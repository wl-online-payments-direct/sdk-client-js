/*
 * Do not remove or alter the notices in this preamble.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { getConfiguration, getSessionDetails } from '../setup';
import { createTokenRequest, getEnvVar } from '../utils';
import { OnlinePaymentSdk } from '../../../src/facade/OnlinePaymentSdk';
import { CreditCardTokenRequest } from '../../../src/domain/paymentRequest/CreditCardTokenRequest';
import { init } from '../../../src';

const SDK_MERCHANT_ID = getEnvVar('VITE_ONLINEPAYMENTS_SDK_MERCHANT_ID');

describe('createToken', () => {
    let session: OnlinePaymentSdk;
    let tokenRequest: CreditCardTokenRequest;
    beforeEach(() => {
        session = init(getSessionDetails(), getConfiguration());
        tokenRequest = new CreditCardTokenRequest();
    });

    it('should create valid token with the TokenRequest', async () => {
        tokenRequest.setCardNumber('4567350000427977');
        tokenRequest.setCardholderName('Darwin Núñez');
        tokenRequest.setExpiryDate('1230');
        tokenRequest.setSecurityCode('123');
        tokenRequest.setProductPaymentId(1);
        expect(tokenRequest.getValues()).toEqual({
            cardNumber: '4567350000427977',
            cardholderName: 'Darwin Núñez',
            expiryDate: '1230',
            cvv: '123',
            paymentProductId: 1,
        });

        try {
            const preparedPaymentRequest = await session.encryptTokenRequest(tokenRequest);
            expect(preparedPaymentRequest.encryptedCustomerInput).toBeDefined();

            const result = await createTokenRequest(SDK_MERCHANT_ID, {
                encryptedCustomerInput: preparedPaymentRequest.encryptedCustomerInput,
                paymentProductId: 1,
            });

            expect(result).toBeDefined();
        } catch (error) {
            console.log(error);
            expect(error).toBeUndefined();
        }
    });

    it('response success; should be an instance of `string`', async () => {
        tokenRequest.setProductPaymentId(1);
        tokenRequest.setCardNumber('42424242424242');
        const response = await session.encryptTokenRequest(tokenRequest);

        expect(response).toBeDefined();
    });

    it('should fail if paymentProductId not provided', async () => {
        tokenRequest.setCardNumber('42424242424242');

        await expect(session.encryptTokenRequest(tokenRequest)).rejects.toThrow(
            'Error encrypting credit card token request: the payment product ID not set.',
        );
    });
});
