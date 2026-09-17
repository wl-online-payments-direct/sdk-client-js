/*
 * Do not remove or alter the notices in this preamble.
 *
 * This software is owned by Worldline and may not be be altered, copied, reproduced, republished, uploaded, posted, transmitted or distributed in any way, without the prior written consent of Worldline.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cardPaymentProductJson } from '../../../__fixtures__/payment-product-json';
import { cardNumberFieldJson } from '../../../__fixtures__/payment-product-field-json';
import { publicKeyResponse } from '../../../__fixtures__/public-key-response';
import { Encryptor } from '../../../../src/infrastructure/encryption/Encryptor';
import { JOSEEncryptor } from '../../../../src/infrastructure/encryption/JOSEEncryptor';
import { DefaultPaymentProductFactory } from '../../../../src/infrastructure/factories/DefaultPaymentProductFactory';
import { EncryptionError, PaymentRequest, CreditCardTokenRequest, AccountOnFile } from '../../../../src';

const paymentProduct = new DefaultPaymentProductFactory().createPaymentProduct({
    ...cardPaymentProductJson,
    fields: [cardNumberFieldJson],
});

const encryptor = new Encryptor('sessionId');

afterEach(() => {
    vi.restoreAllMocks();
});

describe('encrypt', () => {
    let request: PaymentRequest;
    beforeEach(() => {
        request = new PaymentRequest(paymentProduct);
    });

    const encryptPaymentRequestAndValidateHeader = (request: PaymentRequest) => {
        const encryptedString = encryptor.encrypt(publicKeyResponse, request);

        const parts = encryptedString.split('.');

        expect(parts.length).toBe(5);

        // Only the header can be validated here because the remaining parts contain encrypted binary data.
        const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
        expect(header).toStrictEqual({
            alg: 'RSA-OAEP',
            enc: 'A256CBC-HS512',
            kid: publicKeyResponse.keyId,
        });
    };

    it('should resolve with correct response when valid request is provided', () => {
        request.setValue(cardNumberFieldJson.id, '4567350000427977');

        encryptPaymentRequestAndValidateHeader(request);
    });

    it('includes accountOnFileId in payload when account on file is set', () => {
        const accountOnFile = new AccountOnFile('aof-123', paymentProduct.id);
        request.setAccountOnFile(accountOnFile);

        const joseEncryptSpy = vi.spyOn(JOSEEncryptor, 'encrypt').mockReturnValue('a.b.c.d.e');
        encryptor.encrypt(publicKeyResponse, request);

        expect(joseEncryptSpy.mock.calls[0][0]).toMatchObject({ accountOnFileId: 'aof-123' });
    });

    it('includes tokenize in payload when tokenize is set to true', () => {
        request.setTokenize(true);

        const joseEncryptSpy = vi.spyOn(JOSEEncryptor, 'encrypt').mockReturnValue('a.b.c.d.e');
        encryptor.encrypt(publicKeyResponse, request);

        expect(joseEncryptSpy.mock.calls[0][0]).toMatchObject({ tokenize: true });
    });

    it('omits tokenize from payload when tokenize is not set (defaults to false)', () => {
        request.setValue(cardNumberFieldJson.id, '4567350000427977');

        const joseEncryptSpy = vi.spyOn(JOSEEncryptor, 'encrypt').mockReturnValue('a.b.c.d.e');
        encryptor.encrypt(publicKeyResponse, request);

        const payload = joseEncryptSpy.mock.calls[0][0] as Record<string, unknown>;
        expect(payload.tokenize).toBe(false);
    });

    it('sends full plainTextValues payload shape with all expected fields', () => {
        request.setValue(cardNumberFieldJson.id, '4567350000427977');

        const joseEncryptSpy = vi.spyOn(JOSEEncryptor, 'encrypt').mockReturnValue('a.b.c.d.e');
        encryptor.encrypt(publicKeyResponse, request);

        const payload = joseEncryptSpy.mock.calls[0][0] as Record<string, unknown>;
        expect(payload).toMatchObject({
            clientSessionId: 'sessionId',
            paymentProductId: paymentProduct.id,
            paymentValues: expect.arrayContaining([{ key: cardNumberFieldJson.id, value: '4567350000427977' }]),
            collectedDeviceInformation: expect.any(Object),
        });
        expect(typeof payload.nonce).toBe('string');
        expect((payload.nonce as string).length).toBeGreaterThan(0);
    });
});

describe('encryptTokenRequest', () => {
    let tokenRequest: CreditCardTokenRequest;
    beforeEach(() => {
        tokenRequest = new CreditCardTokenRequest();
    });

    const encryptTokenRequestAndValidateHeader = (tokenRequest: CreditCardTokenRequest) => {
        const encryptedString = encryptor.encryptTokenRequest(publicKeyResponse, tokenRequest);

        const parts = encryptedString.split('.');

        expect(parts.length).toBe(5);

        // Only the header can be validated here because the remaining parts contain encrypted binary data.
        const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
        expect(header).toStrictEqual({
            alg: 'RSA-OAEP',
            enc: 'A256CBC-HS512',
            kid: publicKeyResponse.keyId,
        });
    };

    it('should resolve with correct response when token request is provided', () => {
        tokenRequest.setCardholderName('Darwin Núñez');
        tokenRequest.setCardNumber('4242424242424242');
        tokenRequest.setExpiryDate('1236');
        tokenRequest.setSecurityCode('123');
        tokenRequest.setProductPaymentId(paymentProduct.id);

        encryptTokenRequestAndValidateHeader(tokenRequest);
    });

    it('throws EncryptionError when payment product id is not set', () => {
        const action = () => encryptor.encryptTokenRequest(publicKeyResponse, new CreditCardTokenRequest());

        expect(action).toThrow(EncryptionError);
        expect(action).toThrow('Error encrypting credit card token request: the payment product ID not set.');
    });
});
