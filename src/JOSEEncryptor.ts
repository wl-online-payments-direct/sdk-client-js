import type { PublicKeyResponse } from './PublicKeyResponse';

import {
  util as forgeUtil,
  random as forgeRandom,
  asn1 as forgeAsn1,
  pki as forgePki,
  cipher as forgeCipher,
  hmac as forgeHmac,
} from 'node-forge';

const CEKKEYLENGTH = 512;
const IVLENGTH = 128;

function base64UrlEncode(str: string): string {
  str = forgeUtil.encode64(str);
  str = str.split('=')[0];
  str = str.replace(/\+/g, '-');
  str = str.replace(/\//g, '_');
  return str;
}

function createProtectedHeader(kid: string): string {
  const JOSEHeader = {
    alg: 'RSA-OAEP',
    enc: 'A256CBC-HS512',
    kid: kid,
  };
  return JSON.stringify(JOSEHeader);
}

function decodePemPublicKey(
  publickeyB64Encoded: string,
): forgePki.rsa.PublicKey {
  // step 1: base64decode
  const publickeyB64Decoded = forgeUtil.decode64(publickeyB64Encoded);
  // create a bytebuffer with these bytes
  const buffer2 = forgeUtil.createBuffer(publickeyB64Decoded, 'raw');
  // convert DER to ASN1 object
  const publickeyObject2 = forgeAsn1.fromDer(buffer2);
  // convert to publicKey object
  const publicKey2 = forgePki.publicKeyFromAsn1(publickeyObject2);
  return publicKey2 as forgePki.rsa.PublicKey;
}

function encryptContentEncryptionKey(
  CEK: string,
  publicKey: forgePki.rsa.PublicKey,
): string {
  // encrypt CEK with OAEP+SHA-1+MGF1Padding
  return publicKey.encrypt(CEK, 'RSA-OAEP');
}

function encryptPayload(
  payload: string,
  encKey: string,
  initializationVector: string,
): string {
  const cipher = forgeCipher.createCipher('AES-CBC', encKey);
  cipher.start({
    iv: initializationVector,
  });
  cipher.update(forgeUtil.createBuffer(payload));
  cipher.finish();
  return cipher.output.bytes();
}

function calculateAdditionalAuthenticatedDataLength(
  encodededProtectedHeader: string,
): string {
  const buffer = forgeUtil.createBuffer(encodededProtectedHeader);
  const lengthInBits = buffer.length() * 8;

  const buffer2 = forgeUtil.createBuffer();
  // convert int to 64bit big endian
  buffer2.putInt32(0);
  buffer2.putInt32(lengthInBits);
  return buffer2.bytes();
}

function calculateHMAC(
  macKey: string,
  encodededProtectedHeader: string,
  initializationVector: string,
  cipherText: string,
  al: string,
): string {
  const buffer = forgeUtil.createBuffer();
  buffer.putBytes(encodededProtectedHeader);
  buffer.putBytes(initializationVector);
  buffer.putBytes(cipherText);
  buffer.putBytes(al);

  const hmacInput = buffer.bytes();

  const hmac = forgeHmac.create();
  hmac.start('sha512', macKey);
  hmac.update(hmacInput);
  return hmac.digest().bytes();
}

export class JOSEEncryptor {
  encrypt<PlainTextValues>(
    plainTextValues: PlainTextValues,
    publicKeyResponse: PublicKeyResponse,
  ): string {
    // Create protected header and encode it with Base64 encoding
    const payload = JSON.stringify(plainTextValues);
    const protectedHeader = createProtectedHeader(publicKeyResponse.keyId);
    const encodededProtectedHeader = base64UrlEncode(protectedHeader);

    // Create ContentEncryptionKey, is a random byte[]
    const CEK = forgeRandom.getBytesSync(CEKKEYLENGTH / 8);
    const publicKey = decodePemPublicKey(publicKeyResponse.publicKey);

    // Encrypt the contentEncryptionKey with the GC gateway publickey and encode it with Base64 encoding
    const encryptedContentEncryptionKey = encryptContentEncryptionKey(
      CEK,
      publicKey,
    );
    const encodedEncryptedContentEncryptionKey = base64UrlEncode(
      encryptedContentEncryptionKey,
    );

    // Split the contentEncryptionKey in ENC_KEY and MAC_KEY for using hmac
    const macKey = CEK.substring(0, CEKKEYLENGTH / 2 / 8);
    const encKey = CEK.substring(CEKKEYLENGTH / 2 / 8);

    // Create Initialization Vector
    const initializationVector = forgeRandom.getBytesSync(IVLENGTH / 8);
    const encodededinitializationVector = base64UrlEncode(initializationVector);

    // Encrypt content with ContentEncryptionKey and Initialization Vector
    const cipherText = encryptPayload(payload, encKey, initializationVector);
    const encodedCipherText = base64UrlEncode(cipherText);

    // Create Additional Authenticated Data  and Additional Authenticated Data Length
    const al = calculateAdditionalAuthenticatedDataLength(
      encodededProtectedHeader,
    );

    // Calculates HMAC
    const calculatedHmac = calculateHMAC(
      macKey,
      encodededProtectedHeader,
      initializationVector,
      cipherText,
      al,
    );

    // Truncate HMAC Value to Create Authentication Tag
    const authenticationTag = calculatedHmac.substring(
      0,
      calculatedHmac.length / 2,
    );
    const encodedAuthenticationTag = base64UrlEncode(authenticationTag);

    return `${encodededProtectedHeader}.${encodedEncryptedContentEncryptionKey}.${encodededinitializationVector}.${encodedCipherText}.${encodedAuthenticationTag}`;
  }
}
