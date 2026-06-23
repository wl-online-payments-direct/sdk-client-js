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

import { getConfiguration, getSessionDetails } from '../setup';
import { createTokenRequest, getApiClientSpyMock, getEnvVar } from '../utils';
import { CreditCardTokenRequest, init, OnlinePaymentSdk } from '../../../src';
import { publicKeyResponse } from '../../__fixtures__/public-key-response';

const SDK_MERCHANT_ID = getEnvVar('VITE_ONLINEPAYMENTS_SDK_MERCHANT_ID');

describe('CreditCardTokenRequest', () => {
    let session: OnlinePaymentSdk;
    let tokenRequest: CreditCardTokenRequest;

    beforeEach(() => {
        session = init(getSessionDetails(), getConfiguration());
        tokenRequest = new CreditCardTokenRequest();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('CreateToken succeeds with valid token request data', async () => {
        tokenRequest.setCardNumber('4567350000427977');
        tokenRequest.setCardholderName('Darwin Núñez');
        tokenRequest.setExpiryDate('1236');
        tokenRequest.setSecurityCode('123');
        tokenRequest.setProductPaymentId(1);

        const encryptedTokenRequest = await session.encryptTokenRequest(tokenRequest);

        const token = await createTokenRequest(SDK_MERCHANT_ID, {
            encryptedCustomerInput: encryptedTokenRequest.encryptedCustomerInput,
            paymentProductId: 1,
        });

        expect(token).toBeDefined();
        expect(typeof token).toBe('string');
        expect(token.length).toBeGreaterThan(0);
    });

    it('CreateToken fails with invalid token request data', async () => {
        await expect(
            createTokenRequest(SDK_MERCHANT_ID, {
                encryptedCustomerInput: 'invalid-encrypted-customer-input',
                paymentProductId: 1,
            }),
        ).rejects.toThrow('Can not create token');
    });

    it('EncryptTokenRequest fails when payment product id is missing', async () => {
        tokenRequest.setCardNumber('42424242424242');

        await expect(session.encryptTokenRequest(tokenRequest)).rejects.toThrow(
            'Error encrypting credit card token request: the payment product ID not set.',
        );
    });

    it('EncryptTokenRequest returns correct values map', () => {
        tokenRequest.setCardNumber('4567350000427977');
        tokenRequest.setCardholderName('Darwin Núñez');
        tokenRequest.setExpiryDate('1236');
        tokenRequest.setSecurityCode('123');
        tokenRequest.setProductPaymentId(1);

        expect(tokenRequest.getValues()).toStrictEqual({
            cardNumber: '4567350000427977',
            cardholderName: 'Darwin Núñez',
            expiryDate: '1236',
            cvv: '123',
            paymentProductId: 1,
        });
    });

    it('EncryptTokenRequest returns encoded client meta information', async () => {
        getApiClientSpyMock('get', publicKeyResponse);

        tokenRequest.setProductPaymentId(1);
        tokenRequest.setCardNumber('42424242424242');

        const response = await session.encryptTokenRequest(tokenRequest);

        expect(response.encodedClientMetaInfo).toBeDefined();
        expect(typeof response.encodedClientMetaInfo).toBe('string');
        expect(response.encodedClientMetaInfo?.length).toBeGreaterThan(0);
    });

    it('EncryptTokenRequest returns encrypted token as string', async () => {
        getApiClientSpyMock('get', publicKeyResponse);

        tokenRequest.setProductPaymentId(1);
        tokenRequest.setCardNumber('42424242424242');

        const response = await session.encryptTokenRequest(tokenRequest);

        expect(response.encryptedCustomerInput).toBeDefined();
        expect(typeof response.encryptedCustomerInput).toBe('string');
        expect(response.encryptedCustomerInput.split('.')).toHaveLength(5);
    });

    it('EncryptTokenRequest with invalid data still produces encrypted output', async () => {
        getApiClientSpyMock('get', publicKeyResponse);

        tokenRequest.setCardNumber('not-a-valid-card-number');
        tokenRequest.setCardholderName('');
        tokenRequest.setExpiryDate('invalid-expiry-date');
        tokenRequest.setSecurityCode('x');
        tokenRequest.setProductPaymentId(1);

        const response = await session.encryptTokenRequest(tokenRequest);

        expect(response.encryptedCustomerInput).toBeDefined();
        expect(typeof response.encryptedCustomerInput).toBe('string');
        expect(response.encryptedCustomerInput.split('.')).toHaveLength(5);
    });

    it('EncryptTokenRequest with valid data returns encrypted output', async () => {
        getApiClientSpyMock('get', publicKeyResponse);

        tokenRequest.setCardNumber('4567350000427977');
        tokenRequest.setCardholderName('Darwin Núñez');
        tokenRequest.setExpiryDate('1236');
        tokenRequest.setSecurityCode('123');
        tokenRequest.setProductPaymentId(1);

        const response = await session.encryptTokenRequest(tokenRequest);

        expect(response.encryptedCustomerInput).toBeDefined();
        expect(typeof response.encryptedCustomerInput).toBe('string');
        expect(response.encryptedCustomerInput.split('.')).toHaveLength(5);
        expect(response.encodedClientMetaInfo).toBeDefined();
    });
});
