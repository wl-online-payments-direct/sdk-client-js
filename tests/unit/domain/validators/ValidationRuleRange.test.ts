/*
 * Do not remove or alter the notices in this preamble.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import { describe, expect, it } from 'vitest';
import { ValidationRuleRange } from '../../../../src/domain/validation/rules/ValidationRuleRange';

describe('ValidationRuleRange', () => {
    const createValidator = (minValue: number, maxValue: number): ValidationRuleRange => {
        return new ValidationRuleRange(minValue, maxValue);
    };

    it('should validate numeric values within range', () => {
        const validator = createValidator(1, 100);

        [1, 50, 100].forEach((value) => {
            expect(validator.validate(value)).toEqual({
                valid: true,
                message: '',
            });
        });
    });

    it('should validate string values within range', () => {
        const validator = createValidator(1, 100);
        ['1', '50', '100'].forEach((value) => {
            expect(validator.validate(value)).toEqual({
                valid: true,
                message: '',
            });
        });
    });

    it('should reject numeric values outside range', () => {
        const validator = createValidator(1, 100);

        [0, 101, -5].forEach((value) => {
            expect(validator.validate(value)).toEqual({
                valid: false,
                message: 'Provided value is must be between 1 and 100.',
            });
        });
    });

    it('should reject string values outside range', () => {
        const validator = createValidator(1, 100);

        ['0', '101', '-5'].forEach((value) => {
            expect(validator.validate(value)).toEqual({
                valid: false,
                message: 'Provided value is must be between 1 and 100.',
            });
        });
    });

    it('should reject non-numeric strings', () => {
        const validator = createValidator(1, 100);

        expect(validator.validate('abc')).toEqual({
            valid: false,
            message: 'Provided value is must be between 1 and 100.',
        });
    });
});
