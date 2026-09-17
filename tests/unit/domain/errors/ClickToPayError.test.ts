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

import { describe, expect, it } from 'vitest';
import { ClickToPayError, SdkError, SdkErrorType } from '../../../../src';

describe('ClickToPayError', () => {
    it('should set the message, name and code to CLICK_TO_PAY_ERROR', () => {
        const error = new ClickToPayError('Vendor declined the transaction.');

        expect(error.message).toBe('Vendor declined the transaction.');
        expect(error.name).toBe(SdkErrorType.CLICK_TO_PAY_ERROR);
        expect(error.code).toBe(SdkErrorType.CLICK_TO_PAY_ERROR);
    });

    it('should leave metadata undefined when not provided', () => {
        const error = new ClickToPayError('Vendor declined the transaction.');

        expect(error.metadata).toBeUndefined();
    });

    it('should carry the provided metadata', () => {
        const error = new ClickToPayError('Vendor declined the transaction.', { reason: 'ISSUER_DECLINE' });

        expect(error.metadata).toEqual({ reason: 'ISSUER_DECLINE' });
    });

    it('should be an instanceof SdkError and Error', () => {
        const error = new ClickToPayError('Vendor declined the transaction.');

        expect(error).toBeInstanceOf(SdkError);
        expect(error).toBeInstanceOf(Error);
    });
});
