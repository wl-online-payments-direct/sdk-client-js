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

export class ValidationRuleExpirationDate extends ValidationRule {
    constructor() {
        super(ValidationRuleType.EXPIRATION_DATE);
    }

    validate(value?: string): RuleValidationResult {
        value = value?.replace(/\D/g, '') ?? '';

        if (!this.validateDateFormat(value)) {
            return {
                valid: false,
                message: 'Invalid expiration date format.',
            };
        }

        const expirationMonth = Number(value.substring(0, 2)) - 1;
        const expirationYear =
            value.length === 4 ? Number(`20${value.substring(2, 4)}`) : Number(value.substring(2, 6));

        const expirationDate = new Date(expirationYear, expirationMonth, 1);

        // For comparison, set the current year & month and the maximum allowed expiration date.
        const nowWithDay = new Date();
        const now = new Date(nowWithDay.getFullYear(), nowWithDay.getMonth(), 1);
        const maxExpirationDate = new Date(nowWithDay.getFullYear() + 25, 11, 1);

        // The card is still valid if it expires this month.
        const result = expirationDate >= now && expirationDate <= maxExpirationDate;
        return {
            valid: result,
            message: !result ? 'Expiration date cannot be in the past.' : '',
        };
    }

    private validateDateFormat(value: string): boolean {
        // value is mmYY or mmYYYY, where the first digit
        const regex = /^(0[1-9]|1[0-2])(\d{2}|\d{4})$/;

        return regex.test(value);
    }
}
