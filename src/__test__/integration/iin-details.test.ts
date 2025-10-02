import { beforeEach, describe, expect, it } from 'vitest';

import { Session } from '../../Session';
import { IinDetailsResponse } from '../../models/IinDetailsResponse';
import { paymentContextWithAmount } from '../__fixtures__/payment-context';
import { cardNumber } from '../__fixtures__/card-number';
import { cardPaymentProductJson } from '../__fixtures__/payment-products-json';
import { awaitTimes, getNetSpyMock } from './utils';
import { getSessionDetails } from './setup';
import { iinDetailsResponse } from '../__fixtures__/iin-details';

describe('session.getIinDetails', () => {
    let session: Session;
    beforeEach(() => {
        session = new Session(getSessionDetails());
    });

    it('should throw an error when payment context is not provided', async () => {
        await expect(() => session.getIinDetails(cardNumber)).rejects.toThrowError('PaymentContext is not provided');
    });

    it('response success', async () => {
        const spy = getNetSpyMock('post', iinDetailsResponse);

        const result = await session.getIinDetails(cardNumber, paymentContextWithAmount);
        expect(result).toBeInstanceOf(IinDetailsResponse);
        expect(result.status).toBe('SUPPORTED');
        expect(result.paymentProductId).toBe(1);
        spy.mockRestore();
    });

    it('when called again, should result from cache instead network call', async () => {
        const spy = getNetSpyMock('post', { isAllowedInContext: true });
        await awaitTimes(3, () => session.getIinDetails(cardNumber, paymentContextWithAmount));
        expect(spy).toHaveBeenCalledOnce();
        spy.mockRestore();
    });

    it('when `isAllowedInContext` is `false` the status should be "EXISTING_BUT_NOT_ALLOWED"', async () => {
        const spy = getNetSpyMock('post', { isAllowedInContext: false });
        const result = await session.getIinDetails(cardNumber, paymentContextWithAmount);
        expect(result.status).toBe('EXISTING_BUT_NOT_ALLOWED');
        spy.mockRestore();
    });

    it('when `isAllowedInContext` is not present in the response, we check if it is supported by fetching the payment product', async () => {
        const paymentProductId = cardPaymentProductJson.id;
        const spyPost = getNetSpyMock('post', { paymentProductId });
        const spyGet = getNetSpyMock('get', {});
        const result = await session.getIinDetails(cardNumber, paymentContextWithAmount);
        expect(spyGet).toHaveBeenCalledWith(
            expect.stringMatching(new RegExp(`/products/${paymentProductId}`)),
            expect.anything(),
        );
        expect(result.status).toBe('SUPPORTED');
        spyPost.mockRestore();
        spyGet.mockRestore();
    });

    it('when cardNumber is less then 6 digits, should return instance of IinDetailsResponse with status `"NOT_ENOUGH_DIGITS"`', async () => {
        await expect(() => session.getIinDetails('12345', paymentContextWithAmount)).rejects.toThrow(
            expect.objectContaining({ status: 'NOT_ENOUGH_DIGITS' }),
        );
    });
});
