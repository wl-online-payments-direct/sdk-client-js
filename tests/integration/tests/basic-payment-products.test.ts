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
import { OnlinePaymentSdk } from '../../../src';
import { paymentContext } from '../../__fixtures__/payment-context';
import { cardPaymentProductJson, unsupportedCardPaymentProductJson } from '../../__fixtures__/payment-product-json';
import { awaitTimes, getApiClientSpyMock } from '../utils';
import { BasicPaymentProducts, init, ResponseError } from '../../../src';
import { SupportedProductsUtil } from '../../../src/infrastructure/utils/SupportedProductsUtil';
import { DefaultApiClient } from '../../../src/infrastructure/DefaultApiClient';

describe('GetBasicPaymentProducts', () => {
    let session: OnlinePaymentSdk;

    beforeEach(() => {
        session = init(getSessionDetails(), getConfiguration());
    });

    afterEach(() => {
        SupportedProductsUtil.browserUnsupportedProducts = [];
        vi.restoreAllMocks();
    });

    it('GetBasicPaymentProducts returns basic payment products for valid context', async () => {
        const basicPaymentProducts = await session.getBasicPaymentProducts(paymentContext);

        expect(basicPaymentProducts).toBeInstanceOf(BasicPaymentProducts);
    });

    it('GetBasicPaymentProducts returns cached result for repeated request', async () => {
        const spy = getApiClientSpyMock('getWithContext', {
            paymentProducts: [cardPaymentProductJson],
        });

        await awaitTimes(3, () => session.getBasicPaymentProducts(paymentContext));

        expect(spy).toHaveBeenCalledOnce();
    });

    it('GetBasicPaymentProducts makes new API call for different context', async () => {
        const spy = getApiClientSpyMock('getWithContext', {
            paymentProducts: [cardPaymentProductJson],
        });

        await session.getBasicPaymentProducts(paymentContext);
        await session.getBasicPaymentProducts({
            ...paymentContext,
            countryCode: 'BE',
        });

        expect(spy).toHaveBeenCalledTimes(2);
    });

    it('GetBasicPaymentProducts filters products not supported in this browser', async () => {
        getApiClientSpyMock('getWithContext', {
            paymentProducts: [cardPaymentProductJson],
        });

        SupportedProductsUtil.browserUnsupportedProducts.push(cardPaymentProductJson.id);

        await expect(() => session.getBasicPaymentProducts(paymentContext)).rejects.toThrowError(
            'No payment products available',
        );
    });

    it('GetBasicPaymentProducts filters products not supported by SDK', async () => {
        getApiClientSpyMock('getWithContext', {
            paymentProducts: [unsupportedCardPaymentProductJson],
        });

        await expect(() => session.getBasicPaymentProducts(paymentContext)).rejects.toThrowError(
            'No payment products available',
        );
    });

    it('GetBasicPaymentProducts throws error for invalid amount', async () => {
        await expect(() =>
            session.getBasicPaymentProducts({
                ...paymentContext,
                amountOfMoney: {
                    ...paymentContext.amountOfMoney,
                    amount: -1,
                },
            }),
        ).rejects.toThrowError('No payment products available');
    });

    it('GetBasicPaymentProducts throws error when no payment products are available', async () => {
        getApiClientSpyMock('getWithContext', {
            paymentProducts: [],
        });

        await expect(() => session.getBasicPaymentProducts(paymentContext)).rejects.toThrow(ResponseError);
        await expect(() => session.getBasicPaymentProducts(paymentContext)).rejects.toThrowError(
            'No payment products available',
        );
    });

    it('GetBasicPaymentProducts throws response error for 503 response', async () => {
        vi.spyOn(DefaultApiClient.prototype, 'getWithContext').mockResolvedValue({
            success: false,
            status: 503,
            data: {
                errorId: 'test-error-id',
                errors: [
                    {
                        errorCode: '503',
                        message: 'Service unavailable',
                        httpStatusCode: 503,
                    },
                ],
            },
        });

        await expect(() => session.getBasicPaymentProducts(paymentContext)).rejects.toThrow(ResponseError);
    });
});
