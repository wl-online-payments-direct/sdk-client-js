/*
 * Do not remove or alter the notices in this preamble.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import { ValidationRule } from './ValidationRule';
import { ValidationRuleType } from './ValidationRuleType';
import type { RuleValidationResult } from '../RuleValidationResult';

export class ValidationRuleFixedList extends ValidationRule {
    constructor(private readonly allowedValues: string[]) {
        super(ValidationRuleType.FIXED_LIST);
    }

    validate(value: string): RuleValidationResult {
        const result = this.allowedValues.includes(value);

        return {
            valid: result,
            message: !result ? 'Provided value is not allowed.' : '',
        };
    }
}
