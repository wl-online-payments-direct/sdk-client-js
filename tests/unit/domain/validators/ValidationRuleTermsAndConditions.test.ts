import { describe, expect, it } from 'vitest';
import { ValidationRuleTermsAndConditions } from '../../../../src/domain/validators/ValidationRuleTermsAndConditions';
import type { EmptyValidatorJson, ValidationRuleDefinition } from '../../../../src/types';

describe('ValidationRuleTermsAndConditions', () => {
    const createValidator = (): ValidationRuleTermsAndConditions => {
        const json: ValidationRuleDefinition<EmptyValidatorJson> = {
            type: 'termsAndConditions',
            attributes: {},
        };
        return new ValidationRuleTermsAndConditions(json);
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
