import { describe, expect, it } from 'vitest';
import { ValidationRuleFixedList } from '../../../../src/domain/validators/ValidationRuleFixedList';
import type { FixedListValidatorJson, ValidationRuleDefinition } from '../../../../src/types';

describe('ValidationRuleFixedList', () => {
    const createValidator = (allowedValues: string[]): ValidationRuleFixedList => {
        const json: ValidationRuleDefinition<FixedListValidatorJson> = {
            type: 'fixedList',
            attributes: {
                allowedValues,
            },
        };
        return new ValidationRuleFixedList(json);
    };

    it('should validate value that is in the allowed list', () => {
        const validator = createValidator(['visa', 'mastercard', 'amex']);

        expect(validator.validate('visa')).toEqual({
            valid: true,
            message: '',
        });

        expect(validator.validate('mastercard')).toEqual({
            valid: true,
            message: '',
        });

        expect(validator.validate('amex')).toEqual({
            valid: true,
            message: '',
        });
    });

    it('should reject value that is not in the allowed list', () => {
        const validator = createValidator(['visa', 'mastercard', 'amex']);

        expect(validator.validate('discover')).toEqual({
            valid: false,
            message: 'Provided value is not allowed.',
        });

        expect(validator.validate('jcb')).toEqual({
            valid: false,
            message: 'Provided value is not allowed.',
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
