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

export class ValidationRuleIban extends ValidationRule {
    constructor() {
        super(ValidationRuleType.IBAN);
    }

    /**
     * Validate Iban rule
     *
     * @see https://github.com/arhs/iban.js/blob/master/iban.js
     */
    validate(value: string): RuleValidationResult {
        const errorMessage = 'IBAN is not in the correct format.';
        if (!this.isValidFormat(value)) {
            return {
                valid: false,
                message: errorMessage,
            };
        }

        // Check if reminder module 97 equals 1
        // only then it should pass the validation
        let remainder = this.toComputedString(value);

        while (remainder.length > 2) {
            const block = remainder.slice(0, 9);
            remainder = (parseInt(block, 10) % 97) + remainder.slice(block.length);
        }

        const result = parseInt(remainder, 10) % 97 === 1;

        return {
            valid: result,
            message: !result ? errorMessage : '',
        };
    }

    /**
     * Sanitizes value by removing all unwanted chars of IBAN format
     */
    private sanitizeValue(value: string): string {
        return value.replace(/[^\d\w]+/g, '').toUpperCase();
    }

    /**
     * Validates IBAN format
     */
    private isValidFormat(value: unknown): boolean {
        const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{4}[0-9]{7}([A-Z0-9]?){0,16}$/;

        return typeof value === 'string' && ibanRegex.test(this.sanitizeValue(value));
    }

    /**
     * Computes string out of numbers.
     */
    private toComputedString(value: string): string {
        return (
            this.sanitizeValue(value)
                // place the first 4 chars to the end
                .replace(/(^.{4})(.*)/, '$2$1')

                // replace letters by corresponding numbers A=10 / Z=35
                .replace(/[A-Z]/g, (d) => {
                    return (d.charCodeAt(0) - 55).toString();
                })
        );
    }
}
