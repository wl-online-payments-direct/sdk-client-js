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

import { accountOnFileJson, accountOnFileWithMustWriteCvvJson } from '../../__fixtures__/account-on-file-json';
import { cardPaymentProductJson } from '../../__fixtures__/payment-product-json';
import { cardNumber } from '../../__fixtures__/card_number';
import { paymentContext } from '../../__fixtures__/payment-context';
import { publicKeyResponse } from '../../__fixtures__/public-key-response';
import { getConfiguration, getSessionDetails } from '../setup';
import { awaitTimes, getApiClientSpyMock } from '../utils';
import { init, OnlinePaymentSdk, PaymentProduct, PaymentRequest } from '../../../src';
import { DefaultPaymentProductFactory } from '../../../src/infrastructure/factories/DefaultPaymentProductFactory';
import { JOSEEncryptor } from '../../../src/infrastructure/encryption/JOSEEncryptor';

describe('EncryptPaymentRequest', () => {
    let session: OnlinePaymentSdk;
    let paymentProduct: PaymentProduct;

    beforeEach(() => {
        session = init(getSessionDetails(), getConfiguration());
        paymentProduct = new DefaultPaymentProductFactory().createPaymentProduct(cardPaymentProductJson);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('ApplyMask produces correctly formatted output', () => {
        const request = new PaymentRequest(paymentProduct);

        request.getField('cardNumber').setValue('4567350000427977');
        request.getField('expiryDate').setValue('1236');
        request.getField('cvv').setValue('123');

        expect(request.getField('cardNumber').getMaskedValue()).toBe('4567 3500 0042 7977');
        expect(request.getField('expiryDate').getMaskedValue()).toBe('12/36');
        expect(request.getField('cvv').getMaskedValue()).toBe('123');
    });

    it('EncryptPaymentRequest encrypts valid payment request', async () => {
        getApiClientSpyMock('get', publicKeyResponse);

        const request = createValidPaymentRequest();

        const response = await session.encryptPaymentRequest(request);

        expect(response.encryptedCustomerInput).toBeDefined();
        expect(typeof response.encryptedCustomerInput).toBe('string');
        expect(response.encryptedCustomerInput.split('.')).toHaveLength(5);
    });

    it('EncryptPaymentRequest returns encoded client meta information', async () => {
        getApiClientSpyMock('get', publicKeyResponse);

        const request = createValidPaymentRequest();

        const response = await session.encryptPaymentRequest(request);

        expect(response.encodedClientMetaInfo).toBeDefined();
        expect(typeof response.encodedClientMetaInfo).toBe('string');
        expect(response.encodedClientMetaInfo?.length).toBeGreaterThan(0);
    });

    it('EncryptPaymentRequest produces different encrypted output for multiple requests', async () => {
        getApiClientSpyMock('get', publicKeyResponse);

        const firstRequest = createValidPaymentRequest();
        const secondRequest = createValidPaymentRequest();

        const firstResponse = await session.encryptPaymentRequest(firstRequest);
        const secondResponse = await session.encryptPaymentRequest(secondRequest);

        expect(firstResponse.encryptedCustomerInput).not.toBe(secondResponse.encryptedCustomerInput);
    });

    it('EncryptPaymentRequest includes tokenize flag when tokenize is enabled', async () => {
        getApiClientSpyMock('get', publicKeyResponse);
        const encryptSpy = vi.spyOn(JOSEEncryptor, 'encrypt').mockReturnValue('mock.jwe.token.value.here');

        const request = createValidPaymentRequest();
        request.setTokenize(true);

        await session.encryptPaymentRequest(request);

        expect(encryptSpy).toHaveBeenCalledOnce();

        const [capturedPayload] = encryptSpy.mock.calls[0];

        expect(capturedPayload).toMatchObject({
            tokenize: true,
        });
    });

    it('EncryptPaymentRequest throws error when mandatory field is missing', async () => {
        const request = new PaymentRequest(paymentProduct);

        request.getField('cardholderName').setValue('Test cardholder name');
        request.getField('cvv').setValue('123');
        request.getField('expiryDate').setValue('12/2036');

        await expect(session.encryptPaymentRequest(request)).rejects.toThrowError('The payment request is not valid.');
    });

    it('EncryptPaymentRequest does not call public key API when mandatory field is missing', async () => {
        const spy = getApiClientSpyMock('get', publicKeyResponse);
        const request = new PaymentRequest(paymentProduct);

        request.getField('cardholderName').setValue('Test cardholder name');
        request.getField('cvv').setValue('123');
        request.getField('expiryDate').setValue('12/2036');

        await expect(session.encryptPaymentRequest(request)).rejects.toThrowError('The payment request is not valid.');

        expect(spy).not.toHaveBeenCalled();
    });

    it('EncryptPaymentRequest throws validation error for invalid card number', async () => {
        const request = new PaymentRequest(paymentProduct);

        request.getField('cardholderName').setValue('Test cardholder name');
        request.getField('cvv').setValue('123');
        request.getField('expiryDate').setValue('12/2036');
        request.getField('cardNumber').setValue('4242424242424241');

        await expect(session.encryptPaymentRequest(request)).rejects.toThrowError('The payment request is not valid.');
    });

    it('EncryptPaymentRequest succeeds for account-on-file with required fields', async () => {
        getApiClientSpyMock('get', publicKeyResponse);

        const accountOnFile = new DefaultPaymentProductFactory().createAccountOnFile(accountOnFileWithMustWriteCvvJson);
        const request = new PaymentRequest(paymentProduct, accountOnFile);

        request.setValue('cvv', '123');

        const response = await session.encryptPaymentRequest(request);

        expect(response.encryptedCustomerInput).toBeDefined();
        expect(typeof response.encryptedCustomerInput).toBe('string');
        expect(response.encryptedCustomerInput.split('.')).toHaveLength(5);
        expect(response.encodedClientMetaInfo).toBeDefined();
    });

    it('PaymentRequest prevents writing read-only account-on-file card number', () => {
        const accountOnFile = new DefaultPaymentProductFactory().createAccountOnFile(accountOnFileJson);
        const request = new PaymentRequest(paymentProduct, accountOnFile);

        expect(() => request.getField('cardNumber').setValue('4222422242224222')).toThrowError(
            'Cannot write "READ_ONLY" field: cardNumber',
        );
    });

    it('GetPaymentProduct returns cached result for repeated request', async () => {
        const spy = getApiClientSpyMock('getWithContext', cardPaymentProductJson);

        await awaitTimes(3, () => session.getPaymentProduct(cardPaymentProductJson.id, paymentContext));

        expect(spy).toHaveBeenCalledOnce();
    });

    const createValidPaymentRequest = () => {
        const request = new PaymentRequest(paymentProduct);

        request.getField('cardNumber').setValue(cardNumber);
        request.getField('cardholderName').setValue('Test cardholder name');
        request.getField('cvv').setValue('123');
        request.getField('expiryDate').setValue('12/2036');

        return request;
    };
});
