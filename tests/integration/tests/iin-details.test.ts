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

import { beforeEach, describe, expect, it } from 'vitest';

import { getConfiguration, getSessionDetails } from '../setup';
import { OnlinePaymentSdk } from '../../../src';
import { paymentContextWithAmount } from '../../__fixtures__/payment-context';
import { IinDetailsResponse, IinDetailStatus, init, InvalidArgumentError } from '../../../src';

describe('session.getIinDetails', () => {
    let session: OnlinePaymentSdk;
    beforeEach(() => {
        session = init(getSessionDetails(), getConfiguration());
    });

    it('when cardNumber is less than 6 digits, should throw InvalidArgumentError with NOT_ENOUGH_DIGITS status', async () => {
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
