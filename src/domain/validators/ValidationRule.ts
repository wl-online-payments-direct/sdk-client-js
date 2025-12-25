import type { RuleValidationResult, ValidationRuleDefinition, ValidatorJson } from '../../types';

export interface ValidationRule {
    readonly type: string;

    validate(value: string): RuleValidationResult;
}

export abstract class BaseValidationRule<T extends ValidatorJson> implements ValidationRule {
    readonly type: string;

    protected constructor(readonly json: ValidationRuleDefinition<T>) {
        this.type = json.type;
    }

    abstract validate(value: string): RuleValidationResult;
}
