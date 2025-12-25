import { describe, expect, it } from 'vitest';
import { ValidationRuleRange } from '../../../../src/domain/validators/ValidationRuleRange';
import type { RangeValidatorJson, ValidationRuleDefinition } from '../../../../src/types';

describe('ValidationRuleRange', () => {
    const createValidator = (minValue: number, maxValue: number): ValidationRuleRange => {
        const json: ValidationRuleDefinition<RangeValidatorJson> = {
            type: 'range',
            attributes: {
                minValue,
                maxValue,
            },
        };
        return new ValidationRuleRange(json);
    };

    it('should validate numeric values within range', () => {
        const validator = createValidator(1, 100);

        expect(validator.validate(1)).toEqual({
            valid: true,
            message: '',
        });

        expect(validator.validate(50)).toEqual({
            valid: true,
            message: '',
        });

        expect(validator.validate(100)).toEqual({
            valid: true,
            message: '',
        });
    });

    it('should validate string values within range', () => {
        const validator = createValidator(1, 100);

        expect(validator.validate('1')).toEqual({
            valid: true,
            message: '',
        });

        expect(validator.validate('50')).toEqual({
            valid: true,
            message: '',
        });

        expect(validator.validate('100')).toEqual({
            valid: true,
            message: '',
        });
    });

    it('should reject numeric values outside range', () => {
        const validator = createValidator(1, 100);

        expect(validator.validate(0)).toEqual({
            valid: false,
            message: 'Provided value is must be between 1 and 100.',
        });

        expect(validator.validate(101)).toEqual({
            valid: false,
            message: 'Provided value is must be between 1 and 100.',
        });

        expect(validator.validate(-5)).toEqual({
            valid: false,
            message: 'Provided value is must be between 1 and 100.',
        });
    });

    it('should reject string values outside range', () => {
        const validator = createValidator(1, 100);

        expect(validator.validate('0')).toEqual({
            valid: false,
            message: 'Provided value is must be between 1 and 100.',
        });

        expect(validator.validate('101')).toEqual({
            valid: false,
            message: 'Provided value is must be between 1 and 100.',
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
