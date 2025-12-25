import type { RegularExpressionValidatorJson, RuleValidationResult, ValidationRuleDefinition } from '../../types';
import { BaseValidationRule } from './ValidationRule';

export class ValidationRuleRegularExpression extends BaseValidationRule<RegularExpressionValidatorJson> {
    private readonly regularExpression: string;

    constructor(readonly json: ValidationRuleDefinition<RegularExpressionValidatorJson>) {
        super(json);

        this.regularExpression = json.attributes.regularExpression;
    }

    validate(value: string): RuleValidationResult {
        const regexp = new RegExp(this.regularExpression);
        const result = regexp.test(value);

        return {
            valid: result,
            message: !result ? 'Provided value is not in the correct format.' : '',
        };
    }
}
