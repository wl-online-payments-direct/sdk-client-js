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
import { paymentContext } from '../../__fixtures__/payment-context';
import { GOOGLE_PAY_ID } from '../../__fixtures__/payment_ids';
import { init, ResponseError } from '../../../src';

describe('session.getPaymentProductNetworks', () => {
    let session: OnlinePaymentSdk;
    beforeEach(() => {
        session = init(getSessionDetails(), getConfiguration());
    });

    it('should throw a response error when paymentProductId is not correct', async () => {
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
            expect.fail('Should throw an error');
        } catch (error) {
            expect(error).toBeInstanceOf(ResponseError);

            const metadata = (error as ResponseError).metadata as { errors: unknown[] };
            const errors = metadata.errors;

            expect(errors).toBeInstanceOf(Array);
            expect(errors).toEqual(expectedErrorJson);
        }
    });

    it('should return a list of payment product networks', async () => {
        const paymentProductNetworks = await session.getPaymentProductNetworks(GOOGLE_PAY_ID, paymentContext);
        expect(paymentProductNetworks).toHaveProperty('networks');
        expect(paymentProductNetworks.networks.length).toBeGreaterThan(0);
    });

    it('when called again, should result from cache instead network call', async () => {
        const spy = getApiClientSpyMock('getWithContext', { networks: [] });
        await awaitTimes(3, () => session.getPaymentProductNetworks(1, paymentContext));
        expect(spy).toHaveBeenCalledOnce();
        spy.mockRestore();
    });
});
