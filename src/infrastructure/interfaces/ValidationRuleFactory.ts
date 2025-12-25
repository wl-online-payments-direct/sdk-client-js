import type { ValidationRuleDefinition, ValidatorJson } from '../../types';
import type { ValidationRule } from '../../domain/validators/ValidationRule';

export interface ValidationRuleFactory {
    makeValidator(json: ValidationRuleDefinition<ValidatorJson>): ValidationRule | null;
}
