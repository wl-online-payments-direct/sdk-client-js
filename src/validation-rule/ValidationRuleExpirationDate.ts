import type { EmptyValidatorJSON, ValidatableRequest, ValidationRule, ValidationRuleDefinition } from '../types';

function _validateDateFormat(value: string): boolean {
    // value is mmYY or mmYYYY
    return /\d{4}|\d{6}$/g.test(value);
}

export class ValidationRuleExpirationDate implements ValidationRule {
    readonly type: string;
    readonly errorMessageId: string;

    constructor(readonly json: ValidationRuleDefinition<EmptyValidatorJSON>) {
        this.type = json.type;
        this.errorMessageId = json.type;
    }

    validate(value: string): boolean {
        value = value.replace(/\D/g, '');

        if (!_validateDateFormat(value)) {
            return false;
        }

        // return `false` when length of `value` is not 4 or 6
        if (![4, 6].includes(value.length)) {
            return false;
        }

        const expirationMonth = Number(value.substring(0, 2)) - 1;
        const expirationYear =
            value.length === 4 ? Number(`20${value.substring(2, 4)}`) : Number(value.substring(2, 6));

        const expirationDate = new Date(expirationYear, expirationMonth, 1);

        // Compare the input with the parsed date, to check if the date rolled over.
        if (expirationDate.getMonth() !== expirationMonth || expirationDate.getFullYear() !== expirationYear) {
            return false;
        }

        // For comparison, set the current year & month and the maximum allowed expiration date.
        const nowWithDay = new Date();
        const now = new Date(nowWithDay.getFullYear(), nowWithDay.getMonth(), 1);
        const maxExpirationDate = new Date(nowWithDay.getFullYear() + 25, 11, 1);

        // The card is still valid if it expires this month.
        return expirationDate >= now && expirationDate <= maxExpirationDate;
    }

    validateValue(request: ValidatableRequest, fieldId: string): boolean {
        const value = request.getUnmaskedValue(fieldId);
        return !!value && this.validate(value);
    }
}
