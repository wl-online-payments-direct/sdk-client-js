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
import { ValidationRuleFixedList } from '../../../../src/domain/validation/rules/ValidationRuleFixedList';

describe('ValidationRuleFixedList', () => {
    const createValidator = (allowedValues: string[]): ValidationRuleFixedList => {
        return new ValidationRuleFixedList(allowedValues);
    };

    it('should validate value that is in the allowed list', () => {
        const validator = createValidator(['visa', 'mastercard', 'amex']);

        ['visa', 'mastercard', 'amex'].forEach((value) => {
            expect(validator.validate(value)).toEqual({
                valid: true,
                message: '',
            });
        });
    });

    it('should reject value that is not in the allowed list', () => {
        const validator = createValidator(['visa', 'mastercard', 'amex']);

        ['discover', 'jcb'].forEach((value) => {
            expect(validator.validate(value)).toEqual({
                valid: false,
                message: 'Provided value is not allowed.',
            });
        });
    });

    it('should handle empty allowed values list', () => {
        const validator = createValidator([]);

        expect(validator.validate('anything')).toEqual({
            valid: false,
            message: 'Provided value is not allowed.',
        });
    });
});
