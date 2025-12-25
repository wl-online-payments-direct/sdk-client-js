import { describe, expect, it } from 'vitest';
import { ValidationRuleIban } from '../../../../src/domain/validators/ValidationRuleIban';
import type { EmptyValidatorJson, ValidationRuleDefinition } from '../../../../src/types';

describe('ValidationRuleIban', () => {
    const createValidator = (): ValidationRuleIban => {
        const json: ValidationRuleDefinition<EmptyValidatorJson> = {
            type: 'iban',
            attributes: {},
        };
        return new ValidationRuleIban(json);
    };

    it('should validate correct IBAN numbers', () => {
        const validator = createValidator();

        // Valid IBANs from different countries
        expect(validator.validate('DE89370400440532013000')).toEqual({
            valid: true,
            message: '',
        });

        expect(validator.validate('GB82WEST12345698765432')).toEqual({
            valid: true,
            message: '',
        });

        expect(validator.validate('FR1420041010050500013M02606')).toEqual({
            valid: true,
            message: '',
        });

        expect(validator.validate('NL91ABNA0417164300')).toEqual({
            valid: true,
            message: '',
        });
    });

    it('should validate IBAN with spaces', () => {
        const validator = createValidator();

        expect(validator.validate('DE89 3704 0044 0532 0130 00')).toEqual({
            valid: true,
            message: '',
        });

        expect(validator.validate('GB82 WEST 1234 5698 7654 32')).toEqual({
            valid: true,
            message: '',
        });
    });

    it('should reject invalid IBAN numbers', () => {
        const validator = createValidator();

        // Invalid check digits
        expect(validator.validate('DE89370400440532013001')).toEqual({
            valid: false,
            message: 'IBAN is not in the correct format.',
        });

        // Too short
        expect(validator.validate('DE8937040044')).toEqual({
            valid: false,
            message: 'IBAN is not in the correct format.',
        });

        // Invalid country code
        expect(validator.validate('XX89370400440532013000')).toEqual({
            valid: false,
            message: 'IBAN is not in the correct format.',
        });
    });

    it('should reject non-IBAN values', () => {
        const validator = createValidator();

        expect(validator.validate('not-an-iban')).toEqual({
            valid: false,
            message: 'IBAN is not in the correct format.',
        });

        expect(validator.validate('1234567890')).toEqual({
            valid: false,
            message: 'IBAN is not in the correct format.',
        });

        expect(validator.validate('')).toEqual({
            valid: false,
            message: 'IBAN is not in the correct format.',
        });
    });
});
