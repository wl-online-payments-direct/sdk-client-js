import { describe, expect, it } from 'vitest';
import { ValidationRuleEmailAddress } from '../../../../src/domain/validators/ValidationRuleEmailAddress';
import type { EmptyValidatorJson, ValidationRuleDefinition } from '../../../../src/types';

describe('ValidationRuleEmailAddress', () => {
    const createValidator = (): ValidationRuleEmailAddress => {
        const json: ValidationRuleDefinition<EmptyValidatorJson> = {
            type: 'emailAddress',
            attributes: {},
        };
        return new ValidationRuleEmailAddress(json);
    };

    it('should validate correct email addresses', () => {
        const validator = createValidator();

        expect(validator.validate('test@example.com')).toEqual({
            valid: true,
            message: '',
        });

        expect(validator.validate('user.name@example.com')).toEqual({
            valid: true,
            message: '',
        });

        expect(validator.validate('user+tag@example.co.uk')).toEqual({
            valid: true,
            message: '',
        });
    });

    it('should reject invalid email addresses', () => {
        const validator = createValidator();

        expect(validator.validate('invalid')).toEqual({
            valid: false,
            message: 'Email address is not in the correct format.',
        });

        expect(validator.validate('@example.com')).toEqual({
            valid: false,
            message: 'Email address is not in the correct format.',
        });

        expect(validator.validate('user@')).toEqual({
            valid: false,
            message: 'Email address is not in the correct format.',
        });

        expect(validator.validate('user@.com')).toEqual({
            valid: false,
            message: 'Email address is not in the correct format.',
        });
    });
});
