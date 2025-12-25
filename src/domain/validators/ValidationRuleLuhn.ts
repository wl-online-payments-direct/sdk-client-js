import type { EmptyValidatorJson, RuleValidationResult, ValidationRuleDefinition } from '../../types';
import { BaseValidationRule } from './ValidationRule';

export class ValidationRuleLuhn extends BaseValidationRule<EmptyValidatorJson> {
    constructor(readonly json: ValidationRuleDefinition<EmptyValidatorJson>) {
        super(json);
    }

    validate(value: string): RuleValidationResult {
        const digits = value.replace(/[\s-]/g, '');

        // Must contain only digits and be at least 2 digits long
        if (!/^\d{2,}$/.test(digits)) {
            return {
                valid: false,
                message: 'Card number is in invalid format.',
            };
        }

        let sum = 0;
        let shouldDouble = false;

        // Process digits from right to left
        for (let i = digits.length - 1; i >= 0; i--) {
            let digit = Number(digits[i]);

            if (shouldDouble) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }

            sum += digit;
            shouldDouble = !shouldDouble;
        }

        const result = sum % 10 === 0;

        return {
            valid: result,
            message: !result ? 'Card number is in invalid format.' : '',
        };
    }
}
