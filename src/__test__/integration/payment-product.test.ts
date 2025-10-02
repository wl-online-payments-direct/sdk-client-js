import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Session } from '../../Session';
import { Util } from '../../utils/Util';
import { PaymentProduct } from '../../models/PaymentProduct';

import { paymentContext } from '../__fixtures__/payment-context';
import { cardPaymentProductJson } from '../__fixtures__/payment-products-json';
import { awaitTimes, getNetSpyMock } from './utils';
import { getSessionDetails } from './setup';

describe('session.getPaymentProduct', () => {
    let session: Session;
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
        session = new Session(getSessionDetails());
    });

    it('response success; should be an instance of `PaymentProduct`', async () => {
        const response = await session.getPaymentProduct(cardPaymentProductJson.id, paymentContext);
        expect(response).toBeInstanceOf(PaymentProduct);
    });

    it('should throw an error `"PaymentContext is not provided"` when `PaymentContext` is not set', async () => {
        await expect(() => session.getPaymentProduct(cardPaymentProductJson.id)).rejects.toThrowError(
            'PaymentContext is not provided',
        );
    });

    it('response failed; (invalid data)', async () => {
        await expect(() => session.getPaymentProduct(99999, paymentContext)).rejects.toThrowError(
            'Failed to retrieve Payment Product 99999',
        );
    });

    it('should throw a correct object, when called with unsupported IDs', async () => {
        const unsupportedMethodIds = Util.paymentProductsThatAreNotSupportedBySDK;

        for (const id of unsupportedMethodIds) {
            await expect(() => session.getPaymentProduct(id, paymentContext)).rejects.toThrow(
                expect.objectContaining(error404),
            );
        }
    });

    it('when called again, should result from cache instead network call', async () => {
        const spy = getNetSpyMock('get', cardPaymentProductJson);
        await awaitTimes(3, () => session.getPaymentProduct(cardPaymentProductJson.id, paymentContext));
        expect(spy).toHaveBeenCalledOnce();
        spy.mockRestore();
    });

    it('Should return payment product from constructor if matches payment product id and prevent doing a network call', async () => {
        const spy = getNetSpyMock('get', cardPaymentProductJson);
        session = new Session(getSessionDetails(), cardPaymentProductJson);
        await session.getPaymentProduct(cardPaymentProductJson.id, paymentContext);
        expect(spy).not.toHaveBeenCalled();
        spy.mockRestore();
    });

    it('should throw a correct object when product id is not supported in browser', async () => {
        const spy = vi.spyOn(Util, 'isSupportedPaymentProductInBrowser').mockReturnValue(false);

        await expect(() => session.getPaymentProduct(cardPaymentProductJson.id, paymentContext)).rejects.toThrow(
            expect.objectContaining(error404),
        );
        spy.mockRestore();
    });
});
