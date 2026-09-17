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
import { formatNetceteraTransactionAmount } from '../../../../src/infrastructure/clickToPay/NetceteraAmountFormatter';
import { ConfigurationError } from '../../../../src';

describe('formatNetceteraTransactionAmount', () => {
    it('should format a zero-decimal currency (JPY) without a decimal point', () => {
        expect(formatNetceteraTransactionAmount(1000, 'JPY')).toBe('1000');
    });

    it('should format a two-decimal currency (EUR)', () => {
        expect(formatNetceteraTransactionAmount(1000, 'EUR')).toBe('10.00');
    });

    it('should format a two-decimal currency with fractional cents (USD)', () => {
        expect(formatNetceteraTransactionAmount(2550, 'USD')).toBe('25.50');
    });

    it('should format a three-decimal currency (BHD)', () => {
        expect(formatNetceteraTransactionAmount(1000, 'BHD')).toBe('1.000');
    });

    it('should zero-pad an amount smaller than the currency exponent', () => {
        expect(formatNetceteraTransactionAmount(5, 'EUR')).toBe('0.05');
    });

    it('should format a zero amount', () => {
        expect(formatNetceteraTransactionAmount(0, 'EUR')).toBe('0.00');
        expect(formatNetceteraTransactionAmount(0, 'JPY')).toBe('0');
    });

    it('should throw ConfigurationError for a negative amount', () => {
        const call = () => formatNetceteraTransactionAmount(-1, 'EUR');

        expect(call).toThrow(ConfigurationError);
        expect(call).toThrow('Transaction amount must be a non-negative integer.');
    });

    it('should throw ConfigurationError for a non-integer amount', () => {
        const call = () => formatNetceteraTransactionAmount(10.5, 'EUR');

        expect(call).toThrow(ConfigurationError);
        expect(call).toThrow('Transaction amount must be a non-negative integer.');
    });

    it('should throw ConfigurationError for an unsupported currency code', () => {
        const call = () => formatNetceteraTransactionAmount(1000, 'NOT_A_CURRENCY');

        expect(call).toThrow(ConfigurationError);
        expect(call).toThrow('Malformed currency code: NOT_A_CURRENCY.');
    });
});
