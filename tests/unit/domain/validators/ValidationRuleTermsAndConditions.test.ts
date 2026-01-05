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
import { ValidationRuleTermsAndConditions } from '../../../../src/domain/validation/rules/ValidationRuleTermsAndConditions';

describe('ValidationRuleTermsAndConditions', () => {
    const createValidator = (): ValidationRuleTermsAndConditions => {
        return new ValidationRuleTermsAndConditions();
    };

    it('should validate boolean true', () => {
        const validator = createValidator();

        expect(validator.validate(true)).toEqual({
            valid: true,
            message: '',
        });
    });

    it('should validate string "true"', () => {
        const validator = createValidator();

        expect(validator.validate('true')).toEqual({
            valid: true,
            message: '',
        });
    });

    it('should reject boolean false', () => {
        const validator = createValidator();

        expect(validator.validate(false)).toEqual({
            valid: false,
            message: 'Please accept terms and conditions.',
        });
    });

    it('should reject string "false"', () => {
        const validator = createValidator();

        expect(validator.validate('false')).toEqual({
            valid: false,
            message: 'Please accept terms and conditions.',
        });
    });

    it('should reject other values', () => {
        const validator = createValidator();

        expect(validator.validate('yes')).toEqual({
            valid: false,
            message: 'Please accept terms and conditions.',
        });

        expect(validator.validate('1')).toEqual({
            valid: false,
            message: 'Please accept terms and conditions.',
        });

        expect(validator.validate('')).toEqual({
            valid: false,
            message: 'Please accept terms and conditions.',
        });
    });
});
