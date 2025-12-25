import type { FixedListValidatorJson, RuleValidationResult, ValidationRuleDefinition } from '../../types';
import { BaseValidationRule } from './ValidationRule';

export class ValidationRuleFixedList extends BaseValidationRule<FixedListValidatorJson> {
    private readonly allowedValues: string[];

    constructor(readonly json: ValidationRuleDefinition<FixedListValidatorJson>) {
        super(json);

        this.allowedValues = json.attributes.allowedValues;
    }

    validate(value: string): RuleValidationResult {
        const result = this.allowedValues.includes(value);

        return {
            valid: result,
            message: !result ? 'Provided value is not allowed.' : '',
        };
    }
}
