import type { EmptyValidatorJson, RuleValidationResult, ValidationRuleDefinition } from '../../types';
import { BaseValidationRule } from './ValidationRule';

export class ValidationRuleExpirationDate extends BaseValidationRule<EmptyValidatorJson> {
    constructor(readonly json: ValidationRuleDefinition<EmptyValidatorJson>) {
        super(json);
    }

    validate(value: string): RuleValidationResult {
        value = value.replace(/\D/g, '');

        if (!this.validateDateFormat(value)) {
            return {
                valid: false,
                message: 'Invalid expiration date format.',
            };
        }

        const expirationMonth = Number(value.substring(0, 2)) - 1;
        const expirationYear =
            value.length === 4 ? Number(`20${value.substring(2, 4)}`) : Number(value.substring(2, 6));

        const expirationDate = new Date(expirationYear, expirationMonth, 1);

        // For comparison, set the current year & month and the maximum allowed expiration date.
        const nowWithDay = new Date();
        const now = new Date(nowWithDay.getFullYear(), nowWithDay.getMonth(), 1);
        const maxExpirationDate = new Date(nowWithDay.getFullYear() + 25, 11, 1);

        // The card is still valid if it expires this month.
        const result = expirationDate >= now && expirationDate <= maxExpirationDate;
        return {
            valid: result,
            message: !result ? 'Expiration date cannot be in the past.' : '',
        };
    }

    private validateDateFormat(value: string): boolean {
        // value is mmYY or mmYYYY, where the first digit
        const regex = /^(0[1-9]|1[0-2])(\d{2}|\d{4})$/;

        return regex.test(value);
    }
}
