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

import { awaitTimes, getApiClientSpyMock } from '../utils';
import { getConfiguration, getSessionDetails } from '../setup';
import { OnlinePaymentSdk } from '../../../src/facade/OnlinePaymentSdk';
import { cardNumber } from '../../__fixtures__/card_number';
import { iinDetailsResponse } from '../../__fixtures__/iin-details';
import { paymentContextWithAmount } from '../../__fixtures__/payment-context';
import { cardPaymentProductJson } from '../../__fixtures__/payment-product-json';
import { IinDetailsResponse, IinDetailStatus, init, InvalidArgumentError } from '../../../src';

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
            const res = ((error as InvalidArgumentError).metadata as { data: IinDetailsResponse })?.data;
            expect(res.status).toBe(IinDetailStatus.NOT_ENOUGH_DIGITS);
        }
    });
});
