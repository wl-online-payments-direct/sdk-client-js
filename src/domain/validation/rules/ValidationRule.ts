/*
 * Do not remove or alter the notices in this preamble.
 *
 * This software is owned by Worldline and may not be be altered, copied, reproduced, republished, uploaded, posted, transmitted or distributed in any way, without the prior written consent of Worldline.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import type { RuleValidationResult } from '../RuleValidationResult';
import type { ValidationRuleType } from './ValidationRuleType';

export abstract class ValidationRule {
    readonly type: ValidationRuleType;

    protected constructor(type: ValidationRuleType) {
        this.type = type;
    }

    abstract validate(value: string): RuleValidationResult;
}
