/*
 * Do not remove or alter the notices in this preamble.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getConfiguration, getSessionDetails } from '../setup';
import { OnlinePaymentSdk } from '../../../src/facade/OnlinePaymentSdk';
import { cardPaymentProductJson } from '../../__fixtures__/payment-product-json';
import { PaymentProduct } from '../../../src/domain/paymentProduct/PaymentProduct';
import { CreditCardTokenRequest, init, PaymentRequest } from '../../../src';
import { accountOnFileJson } from '../../__fixtures__/account-on-file-json';
import { createPaymentFromSdk, createTokenRequest, getApiClientSpyMock, getEnvVar, getSessionFromSdk } from '../utils';
import { publicKeyResponse } from '../../__fixtures__/public-key-response';
import { cardNumber } from '../../__fixtures__/card_number';
import { paymentContext } from '../../__fixtures__/payment-context';
import { DefaultPaymentProductFactory } from '../../../src/infrastructure/factories/DefaultPaymentProductFactory';

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
        request.getField('expiryDate').setValue('12/2026');
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
        request.getField('expiryDate').setValue('12/2026');

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

    it('can create payment with valid request`', async () => {
        const request = new PaymentRequest(paymentProduct);

        request.getField('cardNumber').setValue(cardNumber);
        request.getField('cardholderName').setValue('Test cardholder name');
        request.getField('cvv').setValue('123');
        request.getField('expiryDate').setValue('12/2026');

        const encryptedData = await session.encryptPaymentRequest(request);

        expect(encryptedData.encryptedCustomerInput).toBeDefined();

        const result = await createPaymentFromSdk(SDK_MERCHANT_ID, {
            encryptedCustomerInput: encryptedData.encryptedCustomerInput,
        });

        expect(result).toBeDefined();
        expect(result.creationOutput).toBeDefined();
        expect(result.merchantAction).toBeDefined();
        expect(result.payment?.id).toBeDefined();
    });

    it('can create payment with valid AOF`', async () => {
        tokenRequest.setCardNumber('4567350000427977');
        tokenRequest.setCardholderName('Darwin Núñez');
        tokenRequest.setExpiryDate('1230');
        tokenRequest.setSecurityCode('123');
        tokenRequest.setProductPaymentId(1);

        const preparedPaymentRequest = await session.encryptTokenRequest(tokenRequest);
        expect(preparedPaymentRequest.encryptedCustomerInput).toBeDefined();

        const tokenResult = await createTokenRequest(SDK_MERCHANT_ID, {
            encryptedCustomerInput: preparedPaymentRequest.encryptedCustomerInput,
            paymentProductId: 1,
        });

        expect(tokenResult).toBeDefined();

        const sessionDetails = await getSessionFromSdk({
            merchantId: SDK_MERCHANT_ID,
            sessionRequest: {
                tokens: [tokenResult],
            },
        });

        expect(sessionDetails).toBeDefined();
        const newSession = init(sessionDetails);

        const paymentProduct = await newSession.getPaymentProduct(1, paymentContext);

        expect(paymentProduct.accountsOnFile.length).toBe(1);
        expect(paymentProduct.accountsOnFile[0].getValue('cardholderName')).toBe('Darwin Núñez');
        expect(paymentProduct.accountsOnFile[0].getValue('expiryDate')).toBe('1230');
        expect(paymentProduct.accountsOnFile[0].getValue('cardNumber')).toBe('456735XXXXXX7977');

        const request = new PaymentRequest(paymentProduct, paymentProduct.accountsOnFile[0]);
        request.setValue('cardholderName', 'Darwin Núñez');
        request.setValue('cardNumber', '4567350000427977');
        request.setValue('expiryDate', '12/26');

        await expect(newSession.encryptPaymentRequest(request)).rejects.toThrow();

        request.setValue('cvv', '123');

        const encryptedData = await newSession.encryptPaymentRequest(request);

        expect(encryptedData.encryptedCustomerInput).toBeDefined();

        const result = await createPaymentFromSdk(SDK_MERCHANT_ID, {
            encryptedCustomerInput: encryptedData.encryptedCustomerInput,
        });

        expect(result).toBeDefined();
        expect(result.creationOutput).toBeDefined();
        expect(result.merchantAction).toBeDefined();
        expect(result.payment?.id).toBeDefined();
    });
});
