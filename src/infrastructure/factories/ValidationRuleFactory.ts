/*
 * Do not remove or alter the notices in this preamble.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import { ValidationRuleEmailAddress } from '../../domain/validation/rules/ValidationRuleEmailAddress';
import { ValidationRuleTermsAndConditions } from '../../domain/validation/rules/ValidationRuleTermsAndConditions';
import { ValidationRuleExpirationDate } from '../../domain/validation/rules/ValidationRuleExpirationDate';
import { ValidationRuleFixedList } from '../../domain/validation/rules/ValidationRuleFixedList';
import { ValidationRuleLength } from '../../domain/validation/rules/ValidationRuleLength';
import { ValidationRuleLuhn } from '../../domain/validation/rules/ValidationRuleLuhn';
import { ValidationRuleRange } from '../../domain/validation/rules/ValidationRuleRange';
import { ValidationRuleRegularExpression } from '../../domain/validation/rules/ValidationRuleRegularExpression';
import { ValidationRuleIban } from '../../domain/validation/rules/ValidationRuleIban';
import type { ValidationRule } from '../../domain/validation/rules/ValidationRule';
import type { ValidatorsDto } from '../apiModels/validators/ValidatorsDto';

export class ValidationRuleFactory {
    createRules(validators?: ValidatorsDto): ValidationRule[] {
        const rules: ValidationRule[] = [];
        if (!validators) {
            return rules;
        }

        if (validators.luhn != null) {
            rules.push(new ValidationRuleLuhn());
        }

        if (validators.iban != null) {
            rules.push(new ValidationRuleIban());
        }

        if (validators.termsAndConditions != null) {
            rules.push(new ValidationRuleTermsAndConditions());
        }

        if (validators.regularExpression?.regularExpression != null) {
            rules.push(new ValidationRuleRegularExpression(validators.regularExpression.regularExpression));
        }

        if (validators.emailAddress != null) {
            rules.push(new ValidationRuleEmailAddress());
        }

        if (validators.expirationDate != null) {
            rules.push(new ValidationRuleExpirationDate());
        }

        if (validators.fixedList?.allowedValues != null) {
            rules.push(new ValidationRuleFixedList(validators.fixedList.allowedValues));
        }

        if (validators.length != null) {
            const length = validators.length;
            if (length.minLength != null && length.maxLength != null) {
                rules.push(new ValidationRuleLength(length.minLength, length.maxLength));
            }
        }

        if (validators.range != null) {
            const range = validators.range;
            if (range.minValue != null && range.maxValue != null) {
                rules.push(new ValidationRuleRange(range.minValue, range.maxValue));
            }
        }

        return rules;
    }
}
