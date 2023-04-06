import type { PaymentRequest } from './PaymentRequest';
import type { PublicKeyResponse } from './PublicKeyResponse';
import type { DeviceInformation } from './types';

import { util as forgeUtil, random as forgeRandom } from 'node-forge';
import { Util } from './Util';
import { JOSEEncryptor } from './JOSEEncryptor';

interface EncryptedCustomerInput {
  clientSessionId: string;
  nonce: string;
  paymentProductId: number;
  accountOnFileId?: number;
  tokenize?: boolean;
  paymentValues: Array<{ key: string; value: string }>;
  collectedDeviceInformation: DeviceInformation;
}

function createEncryptedConsumerInput(
  paymentRequest: PaymentRequest,
  clientSessionId: string,
): EncryptedCustomerInput {
  const values = paymentRequest.getUnmaskedValues();

  const blob: EncryptedCustomerInput = {
    clientSessionId,
    nonce: forgeUtil.bytesToHex(forgeRandom.getBytesSync(16)),
    paymentProductId: paymentRequest.getPaymentProduct()?.id as number,
    tokenize: paymentRequest.getTokenize(),
    collectedDeviceInformation: Util.collectDeviceInformation(),
    paymentValues: Object.keys(values).map((key) => ({
      key,
      value: values[key] as string,
    })),
  };

  const accountOnFile = paymentRequest.getAccountOnFile();
  if (accountOnFile) blob.accountOnFileId = accountOnFile.id;

  return blob;
}

export class Encryptor {
  readonly #_publicKeyResponsePromise: Promise<PublicKeyResponse>;
  readonly #_clientSessionId: EncryptedCustomerInput['clientSessionId'];

  constructor(
    publicKeyResponsePromise: Promise<PublicKeyResponse>,
    clientSessionId: EncryptedCustomerInput['clientSessionId'],
  ) {
    this.#_publicKeyResponsePromise = publicKeyResponsePromise;
    this.#_clientSessionId = clientSessionId;
  }

  async encrypt(paymentRequest: PaymentRequest): Promise<string> {
    if (!paymentRequest.getPaymentProduct()) {
      throw 'No `paymentProduct` set';
    }
    if (!paymentRequest.isValid()) {
      throw paymentRequest.getErrorMessageIds();
    }

    const publicKeyResponse = await this.#_publicKeyResponsePromise;
    const joseEncryptor = new JOSEEncryptor();
    return joseEncryptor.encrypt(
      createEncryptedConsumerInput(paymentRequest, this.#_clientSessionId),
      publicKeyResponse,
    );
  }
}
