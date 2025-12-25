import type { LengthValidatorJson, RuleValidationResult, ValidationRuleDefinition } from '../../types';
import { BaseValidationRule } from './ValidationRule';

export class ValidationRuleLength extends BaseValidationRule<LengthValidatorJson> {
    readonly minLength: number;
    readonly maxLength: number;

    constructor(readonly json: ValidationRuleDefinition<LengthValidatorJson>) {
        super(json);

        this.minLength = json.attributes.minLength;
        this.maxLength = json.attributes.maxLength;
    }

    validate(value: string): RuleValidationResult {
        const result = this.minLength <= value.length && value.length <= this.maxLength;

        return {
            valid: result,
            message: !result ? 'Provided value does not have an allowed length.' : '',
        };
    }
}
