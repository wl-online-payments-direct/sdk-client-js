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

import { paymentContext } from '../../__fixtures__/payment-context';
import { awaitTimes, getApiClientSpyMock } from '../utils';
import { getConfiguration, getSessionDetails } from '../setup';
import { OnlinePaymentSdk } from '../../../src/facade/OnlinePaymentSdk';
import { cardPaymentProductJson } from '../../__fixtures__/payment-product-json';
import { PaymentProduct } from '../../../src/domain/paymentProduct/PaymentProduct';
import { type ErrorResponse, init, ResponseError } from '../../../src';
import { SupportedProductsUtil } from '../../../src/infrastructure/utils/SupportedProductsUtil';

describe('session.getPaymentProduct', () => {
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

    it('response success; should be an instance of `paymentProduct`', async () => {
        const response = await session.getPaymentProduct(cardPaymentProductJson.id, paymentContext);
        expect(response).toBeInstanceOf(PaymentProduct);
    });

    it('response failed; (invalid data)', async () => {
        // noinspection ES6RedundantAwait It is not redundant.
        await expect(session.getPaymentProduct(99999, paymentContext)).rejects.toThrowError(
            'Error while trying to fetch the payment product 99999.',
        );
    });

    it('should throw a correct object, when called with unsupported IDs', async () => {
        const unsupportedMethodIds = SupportedProductsUtil.sdkUnsupportedProducts;

        for (const id of unsupportedMethodIds) {
            await expect404Error(id);
        }
    });

    it('when called again, should result from cache instead network call', async () => {
        const spy = getApiClientSpyMock('getWithContext', cardPaymentProductJson);
        await awaitTimes(3, () => session.getPaymentProduct(cardPaymentProductJson.id, paymentContext));
        expect(spy).toHaveBeenCalledOnce();
        spy.mockRestore();
    });

    it('should throw a correct object when product id is not supported in browser', async () => {
        const spy = vi.spyOn(SupportedProductsUtil, 'isSupportedInBrowser').mockReturnValue(false);

        await expect404Error(cardPaymentProductJson.id);
        spy.mockRestore();
    });

    const expect404Error = async (id: number) => {
        try {
            await session.getPaymentProduct(id, paymentContext);
            expect.fail('Should throw an error');
        } catch (error) {
            expect(error).toBeInstanceOf(ResponseError);
            expect((error as ResponseError).metadata).toStrictEqual(error404);
        }
    };
});
