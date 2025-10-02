import type { PaymentContext } from '../../types';

import { beforeEach, describe, expect, it } from 'vitest';

import { Session } from '../../Session';
import { paymentContext } from '../__fixtures__/payment-context';
import { GOOGLE_PAY_ID } from '../__fixtures__/payment-ids';
import { awaitTimes, getNetSpyMock } from './utils';
import { getSessionDetails } from './setup';

describe('session.getPaymentProductNetworks', () => {
    let session: Session;
    beforeEach(() => {
        session = new Session(getSessionDetails());
    });

    it('should throw response of request when paymentProductId is not correct', async () => {
        const expectedErrorJson = {
            retriable: false,
            category: 'DIRECT_PLATFORM_ERROR',
            code: '1431',
            errorCode: '50001111',
            httpStatusCode: 400,
            id: 'PAYMENT_PRODUCT_ID_MISMATCH',
            message: 'The given payment product id does not correspond to the paymentproductid in the given token.',
        };
        await expect(() => session.getPaymentProductNetworks(1, paymentContext)).rejects.toThrow(
            expect.objectContaining({ errors: [expectedErrorJson] }),
        );
    });

    it('should return a list of payment product networks', async () => {
        const paymentProductNetworks = await session.getPaymentProductNetworks(GOOGLE_PAY_ID, paymentContext);
        expect(paymentProductNetworks).toHaveProperty('networks');
        expect(paymentProductNetworks.networks.length).toBeGreaterThan(0);
    });

    it('when called again, should result from cache instead network call', async () => {
        const spy = getNetSpyMock('get', { networks: [] });
        await awaitTimes(3, () => session.getPaymentProductNetworks(1, paymentContext));
        expect(spy).toHaveBeenCalledOnce();
        spy.mockRestore();
    });

    it('should store paymentContext which is used when calling `getPaymentProduct`', async () => {
        const amountOfMoney = { ...paymentContext.amountOfMoney, amount: 10 };
        const context: PaymentContext = { ...paymentContext, amountOfMoney };

        // this method should store the paymentContext internally
        await session.getPaymentProductNetworks(GOOGLE_PAY_ID, context);

        // @note we don't pass paymentContext here, but it should still work
        await expect(session.getPaymentProduct(1)).resolves.not.toThrowError('PaymentContext is not provided');
    });
});
