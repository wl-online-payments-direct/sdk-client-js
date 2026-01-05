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

export class ValidationRuleRegularExpression extends ValidationRule {
    constructor(private readonly regularExpression: string) {
        super(ValidationRuleType.REGULAR_EXPRESSION);
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
