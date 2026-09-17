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

import { paymentContext, paymentContextWithAmount } from '../../__fixtures__/payment-context';
import { accountOnFileJson } from '../../__fixtures__/account-on-file-json';
import { cardPaymentProductJson } from '../../__fixtures__/payment-product-json';
import { CLICK_TO_PAY_ID } from '../../__fixtures__/payment_ids';
import { getConfiguration, getSessionDetails } from '../setup';
import { awaitTimes, getApiClientSpyMock } from '../utils';
import { type ErrorResponse, init, OnlinePaymentSdk, PaymentProduct, ResponseError } from '../../../src';
import { SupportedProductsUtil } from '../../../src/infrastructure/utils/SupportedProductsUtil';

describe('GetPaymentProduct', () => {
    let session: OnlinePaymentSdk;

    const error404: ErrorResponse = {
        errorId: '48b78d2d-1b35-4f8b-92cb-57cc2638e901',
        errors: [
            {
                errorCode: '1007',
                propertyName: 'productId',
                message: 'UNKNOWN_PRODUCT_ID',
                httpStatusCode: 404,
            },
        ],
    };

    beforeEach(() => {
        session = init(getSessionDetails(), getConfiguration());
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('GetPaymentProduct returns payment product for valid context', async () => {
        const paymentProduct = await session.getPaymentProduct(cardPaymentProductJson.id, paymentContext);

        expect(paymentProduct).toBeInstanceOf(PaymentProduct);
        expect(paymentProduct.id).toBe(cardPaymentProductJson.id);
    });

    it('GetPaymentProduct returns cached result for repeated request', async () => {
        const spy = getApiClientSpyMock('getWithContext', cardPaymentProductJson);

        await awaitTimes(3, () => session.getPaymentProduct(cardPaymentProductJson.id, paymentContext));

        expect(spy).toHaveBeenCalledOnce();
    });

    it('GetPaymentProduct returns product with display hints', async () => {
        getApiClientSpyMock('getWithContext', cardPaymentProductJson);

        const paymentProduct = await session.getPaymentProduct(cardPaymentProductJson.id, paymentContext);

        expect(paymentProduct.label).toBe(cardPaymentProductJson.displayHints.label);
        expect(paymentProduct.logo).toBe(cardPaymentProductJson.displayHints.logo);
        expect(paymentProduct.displayOrder).toBe(cardPaymentProductJson.displayHints.displayOrder);
    });

    it('GetPaymentProduct returns product with mapped accounts on file', async () => {
        getApiClientSpyMock('getWithContext', {
            ...cardPaymentProductJson,
            accountsOnFile: [accountOnFileJson],
        });

        const paymentProduct = await session.getPaymentProduct(cardPaymentProductJson.id, paymentContext);
        const accountOnFile = paymentProduct.getAccountOnFile(accountOnFileJson.id);

        expect(paymentProduct.accountsOnFile).toHaveLength(1);
        expect(accountOnFile).toBeDefined();
        expect(accountOnFile?.id).toBe(accountOnFileJson.id);
        expect(accountOnFile?.paymentProductId).toBe(cardPaymentProductJson.id);
        expect(accountOnFile?.getValue('cardNumber')).toBe('9999-9999-9999-9999');
        expect(accountOnFile?.isWritable('cardNumber')).toBe(false);
        expect(accountOnFile?.isWritable('cvv')).toBe(true);
    });

    it('GetPaymentProduct returns product with valid field structure', async () => {
        getApiClientSpyMock('getWithContext', cardPaymentProductJson);

        const paymentProduct = await session.getPaymentProduct(cardPaymentProductJson.id, paymentContext);
        const fields = paymentProduct.getFields();
        const cardNumberField = paymentProduct.getField('cardNumber');
        const expiryDateField = paymentProduct.getField('expiryDate');
        const cvvField = paymentProduct.getField('cvv');
        const cardholderNameField = paymentProduct.getField('cardholderName');

        expect(fields).toHaveLength(cardPaymentProductJson.fields.length);

        expect(cardNumberField).toBeDefined();
        expect(cardNumberField?.id).toBe('cardNumber');
        expect(cardNumberField?.type).toBe('numericstring');
        expect(cardNumberField?.isRequired()).toBe(true);
        expect(cardNumberField?.getLabel()).toBe('Card number');
        expect(cardNumberField?.applyMask('4567350000427977')).toBe('4567 3500 0042 7977');

        expect(expiryDateField).toBeDefined();
        expect(expiryDateField?.id).toBe('expiryDate');
        expect(expiryDateField?.type).toBe('expirydate');
        expect(expiryDateField?.isRequired()).toBe(true);
        expect(expiryDateField?.applyMask('1230')).toBe('12/30');

        expect(cvvField).toBeDefined();
        expect(cvvField?.id).toBe('cvv');
        expect(cvvField?.type).toBe('numericstring');
        expect(cvvField?.isRequired()).toBe(true);

        expect(cardholderNameField).toBeDefined();
        expect(cardholderNameField?.id).toBe('cardholderName');
        expect(cardholderNameField?.type).toBe('string');
        expect(cardholderNameField?.isRequired()).toBe(false);

        expect(paymentProduct.getRequiredFields().map((field) => field.id)).toStrictEqual([
            'cardNumber',
            'expiryDate',
            'cvv',
        ]);
    });

    it('GetPaymentProduct throws ResponseError with error status code for unsupported or missing payment product', async () => {
        expect.assertions(3);

        try {
            await session.getPaymentProduct(99999, paymentContext);
        } catch (error) {
            const responseError = error as ResponseError;
            const errors = responseError.metadata?.errors;

            expect(responseError).toBeInstanceOf(ResponseError);
            expect(Array.isArray(errors) && errors.some((apiError) => apiError.httpStatusCode >= 400)).toBe(true);
            expect(responseError).toHaveProperty('message', 'Error while trying to fetch the payment product 99999.');
        }
    });

    it('Payment Product unsupported product', async () => {
        const unsupportedProductIds = SupportedProductsUtil.sdkUnsupportedProducts;

        for (const paymentProductId of unsupportedProductIds) {
            await expectUnsupportedProductError(paymentProductId);
        }
    });

    const expectUnsupportedProductError = async (paymentProductId: number) => {
        try {
            await session.getPaymentProduct(paymentProductId, paymentContext);
            expect.fail('Expected unsupported payment product to throw an error.');
        } catch (error) {
            expect(error).toBeInstanceOf(ResponseError);
            expect((error as ResponseError).metadata).toStrictEqual(error404);
        }
    };

    it('GetPaymentProduct makes new API call for different context', async () => {
        const spy = getApiClientSpyMock('getWithContext', cardPaymentProductJson);

        await session.getPaymentProduct(cardPaymentProductJson.id, paymentContext);
        await session.getPaymentProduct(cardPaymentProductJson.id, {
            ...paymentContext,
            countryCode: 'BE',
        });

        expect(spy).toHaveBeenCalledTimes(2);
    });

    it('GetPaymentProduct returns the Click to Pay payment product with its scheme parameters', async () => {
        const paymentProduct = await session.getPaymentProduct(CLICK_TO_PAY_ID, paymentContextWithAmount);

        expect(paymentProduct).toBeInstanceOf(PaymentProduct);
        expect(paymentProduct.id).toBe(CLICK_TO_PAY_ID);

        const apiParameters = paymentProduct.paymentProduct5002SpecificData?.apiParameters;

        expect(apiParameters).toBeDefined();
        expect(Object.keys(apiParameters ?? {})).not.toHaveLength(0);
    });
});
