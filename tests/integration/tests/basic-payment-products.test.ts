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
import { OnlinePaymentSdk } from '../../../src/facade/OnlinePaymentSdk';
import { paymentContext } from '../../__fixtures__/payment-context';
import { cardPaymentProductJson, unsupportedCardPaymentProductJson } from '../../__fixtures__/payment-product-json';
import { PaymentProduct } from '../../../src/domain/paymentProduct/PaymentProduct';
import { awaitTimes, getApiClientSpyMock } from '../utils';
import { BasicPaymentProducts, init } from '../../../src';
import { SupportedProductsUtil } from '../../../src/infrastructure/utils/SupportedProductsUtil';

describe('sdk.getBasicPaymentItems', () => {
    let session: OnlinePaymentSdk;
    beforeEach(() => {
        session = init(getSessionDetails(), getConfiguration());
    });

    it('response success; should be an instance of `BasicPaymentProducts`', async () => {
        const basicPaymentItems = await session.getBasicPaymentProducts(paymentContext);
        expect(basicPaymentItems).toBeInstanceOf(BasicPaymentProducts);
    });

    it('response success; should be an instance of `paymentProduct`', async () => {
        const response = await session.getPaymentProduct(cardPaymentProductJson.id, paymentContext);
        expect(response).toBeInstanceOf(PaymentProduct);
    });

    it('should throw an `ClientError` with message `"No payment products available"` when there are no products found (`json.paymentProducts`)', async () => {
        await expect(() =>
            session.getBasicPaymentProducts({
                ...paymentContext,
                amountOfMoney: { ...paymentContext.amountOfMoney, amount: -1 },
            }),
        ).rejects.toThrowError('No payment products available');
    });

    it('when called again, should result from cache instead network call', async () => {
        const spy = getApiClientSpyMock('getWithContext', { paymentProducts: [cardPaymentProductJson] });
        await awaitTimes(3, () => session.getBasicPaymentProducts(paymentContext));
        expect(spy).toHaveBeenCalledOnce();
        spy.mockRestore();
    });

    it('if has `json` property, paymentProducts are filtered based on `Util.paymentProductsThatAreNotSupportedInThisBrowser` (ids)', async () => {
        const spy = getApiClientSpyMock('getWithContext', { paymentProducts: [cardPaymentProductJson] });
        SupportedProductsUtil.browserUnsupportedProducts.push(cardPaymentProductJson.id);
        await expect(() => session.getBasicPaymentProducts(paymentContext)).rejects.toThrowError(
            'No payment products available',
        );
        spy.mockRestore();
    });

    it('if has `json` property, paymentProducts are filtered based on `Util.paymentProductsThatAreNotSupportedBySdk` (ids)', async () => {
        const spy = getApiClientSpyMock('getWithContext', { paymentProducts: [unsupportedCardPaymentProductJson] });
        await expect(() => session.getBasicPaymentProducts(paymentContext)).rejects.toThrowError(
            'No payment products available',
        );
        spy.mockRestore();
    });
});
