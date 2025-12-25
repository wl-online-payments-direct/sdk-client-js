import { beforeEach, describe, expect, it, vi } from 'vitest';

import { paymentContext } from '../../__fixtures__/payment-context';
import { awaitTimes, getApiClientSpyMock } from '../utils';
import { getConfiguration, getSessionDetails } from '../setup';
import { OnlinePaymentSdk } from '../../../src/facade/OnlinePaymentSdk';
import { cardPaymentProductJson } from '../../__fixtures__/payment-product-json';
import { PaymentProduct } from '../../../src/domain/paymentProduct/PaymentProduct';
import { ResponseError } from '../../../src/dataModel';
import { init } from '../../../src';
import { SupportedProductsUtil } from '../../../src/infrastructure/utils/SupportedProductsUtil';

describe('session.getPaymentProduct', () => {
    let session: OnlinePaymentSdk;
    const error404 = {
        errorId: '48b78d2d-1b35-4f8b-92cb-57cc2638e901',
        errors: [
            {
                code: '1007',
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
        await expect(() => session.getPaymentProduct(99999, paymentContext)).rejects.toThrowError(
            'Failed to retrieve payment product 99999',
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
