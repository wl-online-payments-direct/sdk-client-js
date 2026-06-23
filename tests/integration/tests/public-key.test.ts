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

import { getConfiguration, getSessionDetails } from '../setup';
import { awaitTimes, getApiClientSpyMock } from '../utils';
import { init, OnlinePaymentSdk } from '../../../src';
import { publicKeyResponse } from '../../__fixtures__/public-key-response';

describe('GetPublicKey', () => {
    let session: OnlinePaymentSdk;

    beforeEach(() => {
        session = init(getSessionDetails(), getConfiguration());
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('GetPublicKey returns public key with non-empty fields', async () => {
        const publicKey = await session.getPublicKey();

        expect(publicKey).toBeDefined();
        expect(publicKey.keyId).toBeDefined();
        expect(publicKey.publicKey).toBeDefined();
        expect(typeof publicKey.keyId).toBe('string');
        expect(typeof publicKey.publicKey).toBe('string');
        expect(publicKey.keyId.length).toBeGreaterThan(0);
        expect(publicKey.publicKey.length).toBeGreaterThan(0);
    });

    it('GetPublicKey returns cached result for repeated request', async () => {
        const spy = getApiClientSpyMock('get', publicKeyResponse);

        await awaitTimes(3, () => session.getPublicKey());

        expect(spy).toHaveBeenCalledOnce();
    });
});
