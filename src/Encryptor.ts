import type { PaymentRequest } from './PaymentRequest';
import type { PublicKeyResponse } from './models/PublicKeyResponse';
import type { DeviceInformation } from './types';

import { random as forgeRandom, util as forgeUtil } from 'node-forge';
import { Util } from './utils/Util';
import { JOSEEncryptor } from './utils/JOSEEncryptor';

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
     * @param {PaymentRequest} paymentRequest - The payment request object to be encrypted. This object must have a
     *   payment product set and must be valid.
     * @return {Promise<string>} A promise that resolves to the encrypted representation of the payment request.
     * @throws {Error} Will throw an error if the payment request does not have a payment product set or is not valid.
     */
    async encrypt(paymentRequest: PaymentRequest): Promise<string> {
        if (!paymentRequest.getPaymentProduct()) {
            throw 'No `paymentProduct` set';
        }

        if (!paymentRequest.isValid()) {
            throw paymentRequest.getErrorMessageIds();
        }

        const publicKeyResponse = await this.#publicKeyResponsePromise;
        const joseEncryptor = new JOSEEncryptor();

        return joseEncryptor.encrypt(
            this.#createEncryptedConsumerInput(paymentRequest, this.#clientSessionId),
            publicKeyResponse,
        );
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
            paymentProductId: paymentRequest.getPaymentProduct()?.id as number,
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
