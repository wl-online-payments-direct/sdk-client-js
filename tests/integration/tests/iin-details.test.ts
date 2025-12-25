import { beforeEach, describe, expect, it } from 'vitest';

import { awaitTimes, getApiClientSpyMock } from '../utils';
import { getConfiguration, getSessionDetails } from '../setup';
import { OnlinePaymentSdk } from '../../../src/facade/OnlinePaymentSdk';
import { cardNumber } from '../../__fixtures__/card_number';
import { iinDetailsResponse } from '../../__fixtures__/iin-details';
import { paymentContextWithAmount } from '../../__fixtures__/payment-context';
import { IinDetailsResponse, InvalidArgumentError, ResponseError } from '../../../src/dataModel';
import { cardPaymentProductJson } from '../../__fixtures__/payment-product-json';
import { IinDetailsStatus, init } from '../../../src';

describe('session.getIinDetails', () => {
    let session: OnlinePaymentSdk;
    beforeEach(() => {
        session = init(getSessionDetails(), getConfiguration());
    });

    it('response success', async () => {
        const spy = getApiClientSpyMock('post', iinDetailsResponse);

        const result = await session.getIinDetails(cardNumber, paymentContextWithAmount);
        expect(result).toBeInstanceOf(IinDetailsResponse);
        expect(result.status).toBe('SUPPORTED');
        expect(result.paymentProductId).toBe(1);
        spy.mockRestore();
    });

    it('when called again, should result from cache instead network call', async () => {
        const spy = getApiClientSpyMock('post', { isAllowedInContext: true });
        await awaitTimes(3, () => session.getIinDetails(cardNumber, paymentContextWithAmount));
        expect(spy).toHaveBeenCalledOnce();
        spy.mockRestore();
    });

    it('when `isAllowedInContext` is `false` the status should be "EXISTING_BUT_NOT_ALLOWED"', async () => {
        const spy = getApiClientSpyMock('post', { isAllowedInContext: false });
        const result = await session.getIinDetails(cardNumber, paymentContextWithAmount);
        expect(result.status).toBe('EXISTING_BUT_NOT_ALLOWED');
        spy.mockRestore();
    });

    it('when `isAllowedInContext` is not present in the response, we check if it is supported by fetching the payment product', async () => {
        const paymentProductId = cardPaymentProductJson.id;
        const spyPost = getApiClientSpyMock('post', { paymentProductId });

        const result = await session.getIinDetails(cardNumber, paymentContextWithAmount);

        expect(result.status).toBe('SUPPORTED');
        spyPost.mockRestore();
    });

    it('when cardNumber is less then 6 digits, should return instance of IinDetailsResponse with status `"NOT_ENOUGH_DIGITS"`', async () => {
        try {
            await session.getIinDetails('12345', paymentContextWithAmount);
            expect.fail('Should throw an error');
        } catch (error) {
            expect(error).toBeInstanceOf(InvalidArgumentError);
            const res = (error as ResponseError).metadata?.data as IinDetailsResponse;
            expect(res.status).toBe(IinDetailsStatus.NOT_ENOUGH_DIGITS);
        }
    });
});
