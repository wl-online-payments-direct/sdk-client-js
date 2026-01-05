/*
 * Do not remove or alter the notices in this preamble.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import type { ValidationRule } from '../../validation/rules/ValidationRule';
import type { ValidationRuleType } from '../../validation/rules/ValidationRuleType';

export class DataRestrictions {
    private readonly validationRuleByType?: Record<string, ValidationRule>;

    constructor(
        readonly isRequired: boolean,
        private validationRules: ValidationRule[] = [],
    ) {
        this.validationRuleByType = this.validationRules.reduce(
            (result, rule) => ({
                ...result,
                [rule.type]: rule,
            }),
            {},
        );
    }

    getValidationRules(): ValidationRule[] {
        return this.validationRules ?? [];
    }

    getValidationRule(type: ValidationRuleType): ValidationRule | undefined {
        return this.validationRuleByType?.[type];
    }
}
