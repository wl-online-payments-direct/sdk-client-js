import type { EmptyValidatorJson, RuleValidationResult, ValidationRuleDefinition } from '../../types';
import { BaseValidationRule } from './ValidationRule';

export class ValidationRuleTermsAndConditions extends BaseValidationRule<EmptyValidatorJson> {
    constructor(readonly json: ValidationRuleDefinition<EmptyValidatorJson>) {
        super(json);
    }

    validate(value: string | boolean): RuleValidationResult {
        const result = [true, 'true'].includes(value);

        return {
            valid: result,
            message: !result ? 'Please accept terms and conditions.' : '',
        };
    }
}
