import type { PaymentProductFieldDataRestrictionsJSON, ValidationRule } from '../types';

import { ValidationRuleFactory } from '../validation-rule';

function _parseJSON(
    _json: PaymentProductFieldDataRestrictionsJSON,
    _validationRules: ValidationRule[],
    _validationRuleByType: Record<string, ValidationRule | undefined>,
) {
    if (!_json.validators) {
        return;
    }

    const validationRuleFactory = new ValidationRuleFactory();
    for (const [type, attributes] of Object.entries(_json.validators)) {
        const validationRule = validationRuleFactory.makeValidator({
            type,
            attributes,
        });
        if (!validationRule) {
            continue;
        }

        _validationRules.push(validationRule);
        _validationRuleByType[validationRule.type] = validationRule;
    }
}

export class DataRestrictions {
    readonly isRequired: boolean;
    readonly validationRules: ValidationRule[];
    readonly validationRuleByType: Record<string, ValidationRule | undefined>;

    constructor(json: PaymentProductFieldDataRestrictionsJSON) {
        this.isRequired = json.isRequired;
        this.validationRules = [];
        this.validationRuleByType = {};

        _parseJSON(json, this.validationRules, this.validationRuleByType);
    }
}
