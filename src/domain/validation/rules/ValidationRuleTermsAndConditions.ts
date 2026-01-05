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

export class ValidationRuleTermsAndConditions extends ValidationRule {
    constructor() {
        super(ValidationRuleType.TERMS_AND_CONDITIONS);
    }

    validate(value: string | boolean): RuleValidationResult {
        const result = [true, 'true'].includes(value);

        return {
            valid: result,
            message: !result ? 'Please accept terms and conditions.' : '',
        };
    }
}
