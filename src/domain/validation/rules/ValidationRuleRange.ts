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

export class ValidationRuleRange extends ValidationRule {
    constructor(
        readonly minValue: number,
        readonly maxValue: number,
    ) {
        super(ValidationRuleType.RANGE);
    }

    validate(value: string | number): RuleValidationResult {
        const intValue = typeof value === 'number' ? value : parseInt(value);
        const result = isNaN(intValue) ? false : this.minValue <= intValue && intValue <= this.maxValue;

        return {
            valid: result,
            message: !result ? `Provided value is must be between ${this.minValue} and ${this.maxValue}.` : '',
        };
    }
}
