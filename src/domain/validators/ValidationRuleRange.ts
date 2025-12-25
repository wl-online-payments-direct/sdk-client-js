import type { RangeValidatorJson, RuleValidationResult, ValidationRuleDefinition } from '../../types';
import { BaseValidationRule } from './ValidationRule';

export class ValidationRuleRange extends BaseValidationRule<RangeValidatorJson> {
    private readonly minValue: number;
    private readonly maxValue: number;

    constructor(readonly json: ValidationRuleDefinition<RangeValidatorJson>) {
        super(json);

        this.minValue = json.attributes.minValue;
        this.maxValue = json.attributes.maxValue;
    }

    validate(value: string | number): RuleValidationResult {
        const intValue = typeof value === 'number' ? value : parseInt(value);
        const result = isNaN(intValue) ? false : this.minValue <= intValue && intValue <= this.maxValue;

        return {
            valid: result,
            message: !result ? `Provided value is must be between ${this.minValue} and ${this.maxValue}.` : '',
        };
    }
}
