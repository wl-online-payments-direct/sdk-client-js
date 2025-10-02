import { beforeEach, describe, expect, it } from 'vitest';

import { BasicPaymentItems } from '../../models/BasicPaymentItems';
import { BasicPaymentProduct } from '../../models/BasicPaymentProduct';
import { Session } from '../../Session';
import { Util as clientUtil } from '../../utils/Util';
import { paymentContext } from '../__fixtures__/payment-context';
import { cardPaymentProductJson, unsupportedCardPaymentProductJson } from '../__fixtures__/payment-products-json';
import { awaitTimes, getNetSpyMock } from './utils';
import { getSessionDetails } from './setup';

describe('session.getBasicPaymentItems', () => {
    let session: Session;
    beforeEach(() => {
        session = new Session(getSessionDetails());
    });

    it('response success; should be an instance of `BasicPaymentProducts`', async () => {
        const basicPaymentItems = await session.getBasicPaymentItems(paymentContext);
        expect(basicPaymentItems).toBeInstanceOf(BasicPaymentItems);
        expect(basicPaymentItems.basicPaymentItems).toEqual(expect.arrayContaining([expect.any(BasicPaymentProduct)]));
        expect(basicPaymentItems.basicPaymentItems.length).toBeGreaterThan(0);
    });

    it('should throw an `ResponseError` with message `"No payment products available"` when there are no products found (`json.paymentProducts`)', async () => {
        await expect(() =>
            session.getBasicPaymentItems({
                ...paymentContext,
                amountOfMoney: { ...paymentContext.amountOfMoney, amount: -1 },
            }),
        ).rejects.toThrowError('No payment products available');
    });

    it('when called again, should result from cache instead network call', async () => {
        const spy = getNetSpyMock('get', { paymentProducts: [cardPaymentProductJson] });
        await awaitTimes(3, () => session.getBasicPaymentItems(paymentContext));
        expect(spy).toHaveBeenCalledOnce();
        spy.mockRestore();
    });

    it('if has `json.paymentProducts` property, paymentProducts are filtered based on `Util.paymentProductsThatAreNotSupportedInThisBrowser` (ids)', async () => {
        const spy = getNetSpyMock('get', { paymentProducts: [cardPaymentProductJson] });
        clientUtil.paymentProductsThatAreNotSupportedInThisBrowser.push(cardPaymentProductJson.id);
        await expect(() => session.getBasicPaymentItems(paymentContext)).rejects.toThrowError(
            'No payment products available',
        );
        spy.mockRestore();
    });

    it('if has `json.paymentProducts` property, paymentProducts are filtered based on `Util.paymentProductsThatAreNotSupportedBySdk` (ids)', async () => {
        const spy = getNetSpyMock('get', { paymentProducts: [unsupportedCardPaymentProductJson] });
        await expect(() => session.getBasicPaymentItems(paymentContext)).rejects.toThrowError(
            'No payment products available',
        );
        spy.mockRestore();
    });
});
