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

import { awaitTimes, getApiClientSpyMock } from '../utils';
import { getConfiguration, getSessionDetails } from '../setup';
import { paymentContext } from '../../__fixtures__/payment-context';
import { GOOGLE_PAY_ID } from '../../__fixtures__/payment_ids';
import { init, OnlinePaymentSdk, ResponseError } from '../../../src';

describe('GetPaymentProductNetworks', () => {
    let session: OnlinePaymentSdk;

    beforeEach(() => {
        session = init(getSessionDetails(), getConfiguration());
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('GetPaymentProductNetworks returns networks for supported payment product', async () => {
        const paymentProductNetworks = await session.getPaymentProductNetworks(GOOGLE_PAY_ID, paymentContext);

        expect(paymentProductNetworks).toHaveProperty('networks');
        expect(paymentProductNetworks.networks).toBeInstanceOf(Array);
        expect(paymentProductNetworks.networks.length).toBeGreaterThan(0);
    });

    it('GetPaymentProductNetworks returns cached result for repeated request', async () => {
        const spy = getApiClientSpyMock('getWithContext', {
            networks: ['VISA', 'MASTERCARD'],
        });

        await awaitTimes(3, () => session.getPaymentProductNetworks(GOOGLE_PAY_ID, paymentContext));

        expect(spy).toHaveBeenCalledOnce();
    });

    it('GetPaymentProductNetworks throws error for unsupported payment product', async () => {
        const expectedErrorJson = [
            {
                retriable: false,
                category: 'DIRECT_PLATFORM_ERROR',
                code: '1431',
                errorCode: '50001111',
                httpStatusCode: 400,
                id: 'PAYMENT_PRODUCT_ID_MISMATCH',
                message: 'The given payment product id does not correspond to the paymentproductid in the given token.',
            },
        ];

        try {
            await session.getPaymentProductNetworks(1, paymentContext);
            expect.fail('Expected unsupported payment product to throw an error.');
        } catch (error) {
            expect(error).toBeInstanceOf(ResponseError);

            const metadata = (error as ResponseError).metadata as { errors: unknown[] };

            expect(metadata.errors).toBeInstanceOf(Array);
            expect(metadata.errors).toEqual(expectedErrorJson);
        }
    });

    it('GetPaymentProductNetworks makes new API call for different context', async () => {
        const spy = getApiClientSpyMock('getWithContext', {
            networks: ['VISA', 'MASTERCARD'],
        });

        await session.getPaymentProductNetworks(GOOGLE_PAY_ID, paymentContext);
        await session.getPaymentProductNetworks(GOOGLE_PAY_ID, {
            ...paymentContext,
            countryCode: 'BE',
        });

        expect(spy).toHaveBeenCalledTimes(2);
    });
});
