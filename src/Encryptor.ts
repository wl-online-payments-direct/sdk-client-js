import type { PaymentRequest } from './PaymentRequest';
import type { CreditCardTokenRequest } from './CreditCardTokenRequest';
import type { PublicKeyResponse } from './models/PublicKeyResponse';
import type { DeviceInformation } from './types';

import { random as forgeRandom, util as forgeUtil } from 'node-forge';
import { Util } from './utils/Util';
import { JOSEEncryptor } from './utils/JOSEEncryptor';
import { EncryptionError } from './models/errors/EncryptionError';

interface EncryptedCustomerInput {
    clientSessionId: string;
    nonce: string;
    paymentProductId: number;
    accountOnFileId?: string;
    tokenize?: boolean;
    paymentValues: Array<{ key: string; value: string }>;
    collectedDeviceInformation: DeviceInformation;
}

export class Encryptor {
    readonly #publicKeyResponsePromise: Promise<PublicKeyResponse>;
    readonly #clientSessionId: EncryptedCustomerInput['clientSessionId'];

    /**
     * Constructs an instance of the class with the given parameters.
     *
     * @param {Promise<PublicKeyResponse>} publicKeyResponsePromise - A promise that resolves to the public key
     *     response.
     * @param {EncryptedCustomerInput['clientSessionId']} clientSessionId - The encrypted client session ID.
     */
    constructor(
        publicKeyResponsePromise: Promise<PublicKeyResponse>,
        clientSessionId: EncryptedCustomerInput['clientSessionId'],
    ) {
        this.#publicKeyResponsePromise = publicKeyResponsePromise;
        this.#clientSessionId = clientSessionId;
    }

    /**
     * Encrypts the provided PaymentRequest object using a public key and returns the encrypted string.
     *
     * @param {PaymentRequest} paymentRequest - The payment request to be encrypted. This object must have a
     *   payment product set and must be valid.
     * @return {Promise<string>} A promise that resolves to the encrypted representation of the payment request.
     * @throws {EncryptionError} Will throw an error if the payment request is not valid.
     */
    async encrypt(paymentRequest: PaymentRequest): Promise<string> {
        if (!paymentRequest.isValid()) {
            throw new EncryptionError(
                'Error encrypting payment request: the payment request is not valid.',
                paymentRequest.getErrorMessageIds(),
            );
        }

        const publicKeyResponse = await this.#publicKeyResponsePromise;
        const joseEncryptor = new JOSEEncryptor();

        return joseEncryptor.encrypt(
            this.#createEncryptedConsumerInput(paymentRequest, this.#clientSessionId),
            publicKeyResponse,
        );
    }

    /**
     * Encrypts the provided CreditCardTokenRequest object using a public key and returns the encrypted string.
     *
     * @param {CreditCardTokenRequest} tokenRequest - The token request to be encrypted. This object must have a
     *   payment product id set.
     * @return {Promise<string>} A promise that resolves to the encrypted representation of the payment request.
     * @throws {EncryptionError} Will throw an error if the token request has no paymentProductId.
     */
    async encryptTokenRequest(tokenRequest: CreditCardTokenRequest): Promise<string> {
        const publicKeyResponse = await this.#publicKeyResponsePromise;
        const joseEncryptor = new JOSEEncryptor();

        const payload = this.#createEncryptedConsumerInputFromTokenRequest(tokenRequest, this.#clientSessionId);
        return joseEncryptor.encrypt(payload, publicKeyResponse);
    }

    /**
     * Generates a consumer input payload based on the provided token request and client session ID.
     *
     * @param {CreditCardTokenRequest} tokenRequest - The credit card token request object containing values and other payment
     *     details.
     * @param {string} clientSessionId - The unique identifier for the client's session.
     * @return {EncryptedCustomerInput} An object containing consumer input data, ready to be encrypted.
     */
    #createEncryptedConsumerInputFromTokenRequest(
        tokenRequest: CreditCardTokenRequest,
        clientSessionId: string,
    ): EncryptedCustomerInput {
        const values = tokenRequest.getValues();

        if (!tokenRequest.getPaymentProductId()) {
            throw new EncryptionError('Error encrypting credit card token request: the payment product ID not set.', [
                'paymentProductId',
            ]);
        }

        return {
            clientSessionId,
            nonce: forgeUtil.bytesToHex(forgeRandom.getBytesSync(16)),
            paymentProductId: tokenRequest.getPaymentProductId() as number,
            collectedDeviceInformation: Util.collectDeviceInformation(),
            paymentValues: Object.keys(values).map((key) => ({
                key,
                value: values[key] as string,
            })),
        };
    }

    /**
     * Generates a consumer input payload based on the provided payment request and client session ID.
     *
     * @param {PaymentRequest} paymentRequest - The payment request object containing unmasked values and other payment
     *     details.
     * @param {string} clientSessionId - The unique identifier for the client's session.
     * @return {EncryptedCustomerInput} An object containing consumer input data, ready to be encrypted.
     */
    #createEncryptedConsumerInput(paymentRequest: PaymentRequest, clientSessionId: string): EncryptedCustomerInput {
        const values = paymentRequest.getUnmaskedValues();

        const blob: EncryptedCustomerInput = {
            clientSessionId,
            nonce: forgeUtil.bytesToHex(forgeRandom.getBytesSync(16)),
            paymentProductId: paymentRequest.getPaymentProductId() as number,
            tokenize: paymentRequest.getTokenize(),
            collectedDeviceInformation: Util.collectDeviceInformation(),
            paymentValues: Object.keys(values).map((key) => ({
                key,
                value: values[key] as string,
            })),
        };

        const accountOnFile = paymentRequest.getAccountOnFile();
        if (accountOnFile) {
            blob.accountOnFileId = accountOnFile.id;
        }

        return blob;
    }
}
