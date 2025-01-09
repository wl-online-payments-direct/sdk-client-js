import type { EmptyValidatorJSON, ValidatableRequest, ValidationRule, ValidationRuleDefinition } from '../types';

export class ValidationRuleLuhn implements ValidationRule {
    readonly type: string;
    readonly errorMessageId: string;

    constructor(readonly json: ValidationRuleDefinition<EmptyValidatorJSON>) {
        this.type = json.type;
        this.errorMessageId = json.type;
    }

    validate(value: string): boolean {
        let sum = 0;
        const luhnArr = [
            [0, 2, 4, 6, 8, 1, 3, 5, 7, 9],
            [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        ];

        value.replace(/\D+/g, '').replace(/\d/g, (c, p, o) => {
            sum += luhnArr[(o.length - p) & 1][parseInt(c, 10)];
            return '';
        });

        return sum % 10 === 0 && sum > 0;
    }

    validateValue(request: ValidatableRequest, fieldId: string): boolean {
        const value = request.getUnmaskedValue(fieldId);
        return !!value && this.validate(value);
    }
}
