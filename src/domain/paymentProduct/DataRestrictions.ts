import { DefaultValidationRuleFactory } from '../../infrastructure/factories/DefaultValidationRuleFactory';
import type { ValidationRuleFactory } from '../../infrastructure/interfaces/ValidationRuleFactory';
import type { PaymentProductFieldDataRestrictionsJson, ValidatorJson } from '../../types';
import type { ValidationRule } from '../validators/ValidationRule';

export class DataRestrictions {
    readonly isRequired: boolean;
    private validationRules?: ValidationRule[];
    private validationRuleByType?: Record<string, ValidationRule>;
    private readonly json: PaymentProductFieldDataRestrictionsJson;
    private readonly validationRuleFactory;

    constructor(json: PaymentProductFieldDataRestrictionsJson, validationRuleFactory?: ValidationRuleFactory) {
        this.json = json;
        this.isRequired = json.isRequired;
        this.validationRuleFactory = validationRuleFactory ?? new DefaultValidationRuleFactory();
    }

    /**
     * Validation rules (lazy initialization).
     * Built once on first access.
     */
    getValidationRules(): ValidationRule[] {
        this.prepareValidationRules();

        return this.validationRules ?? [];
    }

    getValidationRule(type: string): ValidationRule | undefined {
        this.prepareValidationRules();

        return this.validationRuleByType?.[type];
    }

    private prepareValidationRules() {
        if (!this.validationRules) {
            this.validationRules = [];
            this.validationRuleByType = {};

            this.buildValidationRulesFromJson(
                this.validationRuleFactory,
                this.validationRules,
                this.validationRuleByType,
            );
        }
    }

    private buildValidationRulesFromJson(
        validationRuleFactory: ValidationRuleFactory,
        rules: ValidationRule[],
        rulesByType: Record<string, ValidationRule>,
    ): void {
        if (!this.json.validators) {
            return;
        }

        for (const [type, attributes] of Object.entries(this.json.validators) as [string, ValidatorJson][]) {
            const validationRule = validationRuleFactory.makeValidator({ type, attributes });
            if (!validationRule) {
                continue;
            }

            rules.push(validationRule);
            rulesByType[type] = validationRule;
        }
    }
}
