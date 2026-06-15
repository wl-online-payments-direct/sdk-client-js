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

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getConfiguration, getSessionDetails } from '../setup';
import { OnlinePaymentSdk, PaymentProduct } from '../../../src';
import { cardPaymentProductJson } from '../../__fixtures__/payment-product-json';
import { CreditCardTokenRequest, init, PaymentRequest } from '../../../src';
import { accountOnFileJson } from '../../__fixtures__/account-on-file-json';
import { createPaymentFromSdk, createTokenRequest, getApiClientSpyMock, getEnvVar, getSessionFromSdk } from '../utils';
import { publicKeyResponse } from '../../__fixtures__/public-key-response';
import { cardNumber } from '../../__fixtures__/card_number';
import { paymentContext } from '../../__fixtures__/payment-context';
import { DefaultPaymentProductFactory } from '../../../src/infrastructure/factories/DefaultPaymentProductFactory';
import { JOSEEncryptor } from '../../../src/infrastructure/encryption/JOSEEncryptor';

const SDK_MERCHANT_ID = getEnvVar('VITE_ONLINEPAYMENTS_SDK_MERCHANT_ID');

describe('session.createPaymentRequest', () => {
    let session: OnlinePaymentSdk;
    let paymentProduct: PaymentProduct;
    let tokenRequest: CreditCardTokenRequest;

    beforeEach(() => {
        session = init(getSessionDetails(), getConfiguration());
        paymentProduct = new DefaultPaymentProductFactory().createPaymentProduct(cardPaymentProductJson);
        tokenRequest = new CreditCardTokenRequest();
    });

    it('should encrypt payment request`', async () => {
        const request = new PaymentRequest(paymentProduct);

        request.getField('cardholderName').setValue('Test cardholder name');
        request.getField('cvv').setValue('123');
        request.getField('expiryDate').setValue('12/2036');
        request.getField('cardNumber').setValue('4242424242424242');

        const response = await session.encryptPaymentRequest(request);

        expect(response.encryptedCustomerInput).toBeDefined();
        expect(response.encodedClientMetaInfo).toBeDefined();
    });

    it('should fail if mandatory field not set`', async () => {
        const spy = getApiClientSpyMock('get', publicKeyResponse);
        const request = new PaymentRequest(paymentProduct);

        request.getField('cardholderName').setValue('Test cardholder name');
        request.getField('cvv').setValue('123');
        request.getField('expiryDate').setValue('12/2036');

        // noinspection ES6RedundantAwait It is not redundant.
        await expect(session.encryptPaymentRequest(request)).rejects.toThrow('The payment request is not valid.');

        expect(spy).not.toHaveBeenCalled();
        vi.restoreAllMocks();
    });

    it('if account on file present cannot change mandatory field`', async () => {
        const accountOnFile = new DefaultPaymentProductFactory().createAccountOnFile(accountOnFileJson);
        const request = new PaymentRequest(paymentProduct, accountOnFile);

        expect(() => request.getField('cardNumber').setValue('4222422242224222')).toThrow(
            'Cannot write "READ_ONLY" field: cardNumber',
        );
    });

    it('encrypted payload should include tokenize flag when setTokenize(true) is called', async () => {
        const publicKeySpy = getApiClientSpyMock('get', publicKeyResponse);
        const encryptSpy = vi.spyOn(JOSEEncryptor, 'encrypt').mockReturnValue('mock.jwe.token.value.here');

        const request = new PaymentRequest(paymentProduct);
        request.getField('cardNumber').setValue('4242424242424242');
        request.getField('cardholderName').setValue('Test cardholder name');
        request.getField('cvv').setValue('123');
        request.getField('expiryDate').setValue('12/2036');
        request.setTokenize(true);

        await session.encryptPaymentRequest(request);

        expect(encryptSpy).toHaveBeenCalledOnce();

        const [capturedPayload] = encryptSpy.mock.calls[0];
        expect(capturedPayload).toMatchObject({
            tokenize: true,
        });

        publicKeySpy.mockRestore();
        encryptSpy.mockRestore();
    });

    it('can create payment with valid request`', async () => {
        const request = new PaymentRequest(paymentProduct);

        request.getField('cardNumber').setValue(cardNumber);
        request.getField('cardholderName').setValue('Test cardholder name');
        request.getField('cvv').setValue('123');
        request.getField('expiryDate').setValue('12/2036');

        const encryptedData = await session.encryptPaymentRequest(request);

        expect(encryptedData.encryptedCustomerInput).toBeDefined();

        const result = await createPaymentFromSdk(SDK_MERCHANT_ID, {
            encryptedCustomerInput: encryptedData.encryptedCustomerInput,
        });

        expect(result).toBeDefined();
        expect(result.creationOutput).toBeDefined();
        expect(result.payment?.id).toBeDefined();
    });

    it('can create payment with valid AOF', async () => {
        tokenRequest.setCardNumber('4567350000427977');
        tokenRequest.setCardholderName('Darwin Núñez');
        tokenRequest.setExpiryDate('1236');
        tokenRequest.setSecurityCode('123');
        tokenRequest.setProductPaymentId(1);

        // Step 1: encrypt token request
        const preparedPaymentRequest = await session.encryptTokenRequest(tokenRequest);
        expect(typeof preparedPaymentRequest.encryptedCustomerInput).toBe('string');
        expect(preparedPaymentRequest.encryptedCustomerInput.split('.').length).toBe(5);

        // Step 2: create token via live API
        const tokenResult = await createTokenRequest(SDK_MERCHANT_ID, {
            encryptedCustomerInput: preparedPaymentRequest.encryptedCustomerInput,
            paymentProductId: 1,
        });
        expect(typeof tokenResult).toBe('string');
        expect(tokenResult.length).toBeGreaterThan(0);

        // Step 3: open new session with the token as account-on-file
        const sessionDetails = await getSessionFromSdk({
            merchantId: SDK_MERCHANT_ID,
            sessionRequest: {
                tokens: [tokenResult],
            },
        });
        expect(sessionDetails).toBeDefined();
        const newSession = init(sessionDetails);

        // Step 4: fetch payment product — should expose the saved account-on-file
        const paymentProduct = await newSession.getPaymentProduct(1, paymentContext);
        expect(paymentProduct.accountsOnFile.length).toBe(1);
        expect(paymentProduct.accountsOnFile[0].getValue('cardholderName')).toBe('Darwin Núñez');
        expect(paymentProduct.accountsOnFile[0].getValue('expiryDate')).toBe('1236');
        // Card number should be masked — 6 clear + X-mask + 4 clear
        expect(paymentProduct.accountsOnFile[0].getValue('cardNumber')).toMatch(/^\d{6}X+\d{4}$/);

        // Step 5: invalid CVV (length < 3) should be rejected before encryption
        const request = new PaymentRequest(paymentProduct, paymentProduct.accountsOnFile[0]);
        request.setValue('cardholderName', 'Darwin Núñez');
        request.setValue('cardNumber', '4567350000427977');
        request.setValue('expiryDate', '12/36');
        request.setValue('cvv', '1');
        await expect(newSession.encryptPaymentRequest(request)).rejects.toThrow('The payment request is not valid.');

        // Step 6: valid CVV — encrypt and submit payment
        request.setValue('cvv', '222');
        const encryptedData = await newSession.encryptPaymentRequest(request);
        expect(typeof encryptedData.encryptedCustomerInput).toBe('string');
        expect(encryptedData.encryptedCustomerInput.split('.').length).toBe(5);
        expect(typeof encryptedData.encodedClientMetaInfo).toBe('string');

        const result = await createPaymentFromSdk(SDK_MERCHANT_ID, {
            encryptedCustomerInput: encryptedData.encryptedCustomerInput,
        });
        expect(result.creationOutput).toMatchObject({ tokenizationSucceeded: expect.any(Boolean) });
        expect(typeof result.payment?.id).toBe('string');
    });
});
