/*
 * Do not remove or alter the notices in this preamble.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import { random as forgeRandom, util as forgeUtil } from 'node-forge';

import { JOSEEncryptor } from './JOSEEncryptor';
import type { CreditCardTokenRequest } from '../../domain/paymentRequest/CreditCardTokenRequest';
import { PaymentRequest } from '../../domain/paymentRequest/PaymentRequest';
import { Util } from '../utils/Util';
import type { DeviceInformation } from './Metadata';
import { EncryptionError, PublicKeyResponse } from '../../domain';

interface EncryptedCustomerInput {
    clientSessionId: string;
    nonce: string;
    paymentProductId: number;
    accountOnFileId?: string;
    tokenize?: boolean;
    paymentValues: { key: string; value: string }[];
    collectedDeviceInformation: DeviceInformation;
}

export class Encryptor {
    readonly #clientSessionId: EncryptedCustomerInput['clientSessionId'];

    /**
     * Constructs an instance of the class with the given parameters.
     *
     * @param {EncryptedCustomerInput['clientSessionId']} clientSessionId - The encrypted client session ID.
     */
    constructor(clientSessionId: EncryptedCustomerInput['clientSessionId']) {
        this.#clientSessionId = clientSessionId;
    }

    /**
     * Encrypts the provided PaymentRequest object using a public key and returns the encrypted string.
     *
     * @param {PublicKeyResponse} publicKey
     * @param {PaymentRequest} paymentRequest - The payment request to be encrypted. This object must have a
     *   payment product set and must be valid.
     * @return {Promise<string>} A promise that resolves to the encrypted representation of the payment request.
     * @throws {EncryptionError} Will throw an error if the payment request is not valid.
     */
    encrypt(publicKey: PublicKeyResponse, paymentRequest: PaymentRequest): string {
        return JOSEEncryptor.encrypt(
            this.#createEncryptedConsumerInput(paymentRequest, this.#clientSessionId),
            publicKey,
        );
    }

    /**
     * Encrypts the provided CreditCardTokenRequest object using a public key and returns the encrypted string.
     *
     * @param {PublicKeyResponse} publicKey
     * @param {CreditCardTokenRequest} tokenRequest - The token request to be encrypted. This object must have a
     *   payment product id set.
     * @return {Promise<string>} A promise that resolves to the encrypted representation of the payment request.
     * @throws {EncryptionError} e Will throw an error if the token request has no paymentProductId.
     */
    encryptTokenRequest(publicKey: PublicKeyResponse, tokenRequest: CreditCardTokenRequest): string {
        const payload = this.#createEncryptedConsumerInputFromTokenRequest(tokenRequest, this.#clientSessionId);

        return JOSEEncryptor.encrypt(payload, publicKey);
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
            throw new EncryptionError('Error encrypting credit card token request: the payment product ID not set.', {
                data: 'paymentProductId',
            });
        }

        return {
            clientSessionId,
            nonce: forgeUtil.bytesToHex(forgeRandom.getBytesSync(16)),
            paymentProductId: tokenRequest.getPaymentProductId()!,
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
        const values = paymentRequest.getValues();

        const blob: EncryptedCustomerInput = {
            clientSessionId,
            nonce: forgeUtil.bytesToHex(forgeRandom.getBytesSync(16)),
            paymentProductId: paymentRequest.getPaymentProductId(),
            tokenize: paymentRequest.getTokenize(),
            collectedDeviceInformation: Util.collectDeviceInformation(),
            paymentValues: Object.keys(values).map((key) => ({
                key,
                value: values[key],
            })),
        };

        const accountOnFile = paymentRequest.getAccountOnFile();
        if (accountOnFile) {
            blob.accountOnFileId = accountOnFile.id;
        }

        return blob;
    }
}
