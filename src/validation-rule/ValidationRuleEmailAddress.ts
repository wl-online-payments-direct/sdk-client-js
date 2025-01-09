import type { EmptyValidatorJSON, ValidatableRequest, ValidationRule, ValidationRuleDefinition } from '../types';

export class ValidationRuleEmailAddress implements ValidationRule {
    readonly type: string;
    readonly errorMessageId: string;

    constructor(readonly json: ValidationRuleDefinition<EmptyValidatorJSON>) {
        this.type = json.type;
        this.errorMessageId = json.type;
    }

    validate(value: string): boolean {
        const regexp = new RegExp(/^[^@.]+(\.[^@.]+)*@([^@.]+\.)*[^@.]+\.[^@.][^@.]+$/i);
        return regexp.test(value);
    }

    validateValue(request: ValidatableRequest, fieldId: string): boolean {
        const value = request.getUnmaskedValue(fieldId);
        return !!value && this.validate(value);
    }
}
