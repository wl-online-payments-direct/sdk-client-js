import type { EmptyValidatorJson, RuleValidationResult, ValidationRuleDefinition } from '../../types';
import { BaseValidationRule } from './ValidationRule';

export class ValidationRuleEmailAddress extends BaseValidationRule<EmptyValidatorJson> {
    constructor(readonly json: ValidationRuleDefinition<EmptyValidatorJson>) {
        super(json);
    }

    validate(value: string): RuleValidationResult {
        const regexp = new RegExp(/^[^@.]+(\.[^@.]+)*@([^@.]+\.)*[^@.]+\.[^@.][^@.]+$/i);
        const result = regexp.test(value);

        return {
            valid: result,
            message: !result ? 'Email address is not in the correct format.' : '',
        };
    }
}
