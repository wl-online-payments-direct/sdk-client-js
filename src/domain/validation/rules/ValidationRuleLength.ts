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

export class ValidationRuleLength extends ValidationRule {
    constructor(
        readonly minLength: number,
        readonly maxLength: number,
    ) {
        super(ValidationRuleType.LENGTH);
    }

    validate(value = ''): RuleValidationResult {
        const result = this.minLength <= value.length && value.length <= this.maxLength;

        return {
            valid: result,
            message: !result ? 'Provided value does not have an allowed length.' : '',
        };
    }
}
