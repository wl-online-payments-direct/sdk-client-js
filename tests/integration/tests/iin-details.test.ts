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

import { paymentContextWithAmount } from '../../__fixtures__/payment-context';
import { awaitTimes, getApiClientSpyMock } from '../utils';
import { IinDetailsResponse, IinDetailStatus, init, InvalidArgumentError, OnlinePaymentSdk } from '../../../src';
import { getConfiguration, getSessionDetails } from '../setup';

describe('GetIinDetails', () => {
    let session: OnlinePaymentSdk;

    beforeEach(() => {
        session = init(getSessionDetails(), getConfiguration());
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('GetIinDetails accepts card number with six digits', async () => {
        const spy = getApiClientSpyMock('post', {
            countryCode: 'NL',
            paymentProductId: 1,
            isAllowedInContext: true,
        });

        const result = await session.getIinDetails('424242', paymentContextWithAmount);

        const [path, options] = spy.mock.calls[0];
        const parsedBody = JSON.parse(options?.body as string);

        expect(path).toBe('/services/getIINdetails');
        expect(parsedBody).toStrictEqual({
            bin: '424242',
            paymentContext: paymentContextWithAmount,
        });

        expect(result).toBeInstanceOf(IinDetailsResponse);
        expect(result.status).toBe(IinDetailStatus.SUPPORTED);
        expect(result.countryCode).toBe('NL');
        expect(result.paymentProductId).toBe(1);
        expect(result.isAllowedInContext).toBe(true);
    });

    it('GetIinDetails makes a new API call for different card numbers', async () => {
        const spy = getApiClientSpyMock('post', {
            countryCode: 'NL',
            paymentProductId: 1,
            isAllowedInContext: true,
        });

        await session.getIinDetails('424242', paymentContextWithAmount);
        await session.getIinDetails('555555', paymentContextWithAmount);

        expect(spy).toHaveBeenCalledTimes(2);
    });

    it('GetIinDetails returns cached result for repeated BIN', async () => {
        const spy = getApiClientSpyMock('post', {
            countryCode: 'NL',
            paymentProductId: 1,
            isAllowedInContext: true,
        });

        await awaitTimes(3, () => session.getIinDetails('424242', paymentContextWithAmount));

        expect(spy).toHaveBeenCalledOnce();
    });

    it('GetIinDetails returns existing but not allowed when card is not allowed in context', async () => {
        getApiClientSpyMock('post', {
            countryCode: 'NL',
            paymentProductId: 1,
            isAllowedInContext: false,
        });

        const result = await session.getIinDetails('424242', paymentContextWithAmount);

        expect(result).toBeInstanceOf(IinDetailsResponse);
        expect(result.status).toBe(IinDetailStatus.EXISTING_BUT_NOT_ALLOWED);
        expect(result.countryCode).toBe('NL');
        expect(result.paymentProductId).toBe(1);
        expect(result.isAllowedInContext).toBe(false);
    });

    it('GetIinDetails returns supported status for full card number', async () => {
        const spy = getApiClientSpyMock('post', {
            countryCode: 'NL',
            paymentProductId: 1,
            isAllowedInContext: true,
        });

        const result = await session.getIinDetails('4567350000427977', paymentContextWithAmount);

        const [path, options] = spy.mock.calls[0];
        const parsedBody = JSON.parse(options?.body as string);

        expect(path).toBe('/services/getIINdetails');
        expect(parsedBody).toStrictEqual({
            bin: '45673500',
            paymentContext: paymentContextWithAmount,
        });

        expect(result).toBeInstanceOf(IinDetailsResponse);
        expect(result.status).toBe(IinDetailStatus.SUPPORTED);
        expect(result.countryCode).toBe('NL');
        expect(result.paymentProductId).toBe(1);
        expect(result.isAllowedInContext).toBe(true);
    });

    it('GetIinDetails returns supported status for valid BIN', async () => {
        getApiClientSpyMock('post', {
            countryCode: 'NL',
            paymentProductId: 1,
            isAllowedInContext: true,
        });

        const result = await session.getIinDetails('456735', paymentContextWithAmount);

        expect(result).toBeInstanceOf(IinDetailsResponse);
        expect(result.status).toBe(IinDetailStatus.SUPPORTED);
        expect(result.countryCode).toBe('NL');
        expect(result.paymentProductId).toBe(1);
        expect(result.isAllowedInContext).toBe(true);
    });

    it('GetIinDetails returns supported status when isAllowedInContext is absent', async () => {
        getApiClientSpyMock('post', {
            countryCode: 'NL',
            paymentProductId: 1,
        });

        const result = await session.getIinDetails('456735', paymentContextWithAmount);

        expect(result).toBeInstanceOf(IinDetailsResponse);
        expect(result.status).toBe(IinDetailStatus.SUPPORTED);
        expect(result.countryCode).toBe('NL');
        expect(result.paymentProductId).toBe(1);
        expect(result.isAllowedInContext).toBeUndefined();
    });

    it('GetIinDetails throws invalid argument when card number has fewer than six digits', async () => {
        await expect(session.getIinDetails('12345', paymentContextWithAmount)).rejects.toThrow(InvalidArgumentError);
        await expect(session.getIinDetails('12345', paymentContextWithAmount)).rejects.toThrowError(
            'Not enough digits in the credit card number. Minimum 6 digits required.',
        );
    });

    it('IIN Details allowed context status existing_but_not_allowed', async () => {
        getApiClientSpyMock('post', {
            countryCode: 'NL',
            paymentProductId: 1,
            isAllowedInContext: false,
        });

        const result = await session.getIinDetails('411111', paymentContextWithAmount);

        expect(result).toBeInstanceOf(IinDetailsResponse);
        expect(result.status).toBe(IinDetailStatus.EXISTING_BUT_NOT_ALLOWED);
        expect(result.isAllowedInContext).toBe(false);
    });

    it('GetIinDetails accepts card number with spaces', async () => {
        const spy = getApiClientSpyMock('post', {
            countryCode: 'NL',
            paymentProductId: 1,
            isAllowedInContext: true,
        });

        const result = await session.getIinDetails('4567 3500 0042 7977', paymentContextWithAmount);

        const [, options] = spy.mock.calls[0];
        const parsedBody = JSON.parse(options?.body as string);

        expect(parsedBody).toStrictEqual({
            bin: '45673500',
            paymentContext: paymentContextWithAmount,
        });

        expect(result).toBeInstanceOf(IinDetailsResponse);
        expect(result.status).toBe(IinDetailStatus.SUPPORTED);
        expect(result.countryCode).toBe('NL');
        expect(result.paymentProductId).toBe(1);
        expect(result.isAllowedInContext).toBe(true);
    });
});
