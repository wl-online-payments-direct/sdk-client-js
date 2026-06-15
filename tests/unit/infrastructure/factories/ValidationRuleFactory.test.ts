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

import { describe, expect, it, beforeEach } from 'vitest';
import { ValidationRuleFactory } from '../../../../src/infrastructure/factories/ValidationRuleFactory';
import { ValidationRuleLuhn } from '../../../../src/domain/validation/rules/ValidationRuleLuhn';
import { ValidationRuleIban } from '../../../../src/domain/validation/rules/ValidationRuleIban';
import { ValidationRuleTermsAndConditions } from '../../../../src/domain/validation/rules/ValidationRuleTermsAndConditions';
import { ValidationRuleRegularExpression } from '../../../../src/domain/validation/rules/ValidationRuleRegularExpression';
import { ValidationRuleEmailAddress } from '../../../../src/domain/validation/rules/ValidationRuleEmailAddress';
import { ValidationRuleExpirationDate } from '../../../../src/domain/validation/rules/ValidationRuleExpirationDate';
import { ValidationRuleFixedList } from '../../../../src/domain/validation/rules/ValidationRuleFixedList';
import { ValidationRuleLength } from '../../../../src/domain/validation/rules/ValidationRuleLength';
import { ValidationRuleRange } from '../../../../src/domain/validation/rules/ValidationRuleRange';

describe('ValidationRuleFactory', () => {
    let factory: ValidationRuleFactory;

    beforeEach(() => {
        factory = new ValidationRuleFactory();
    });

    describe('createRules', () => {
        const createRulesWithInvalidValidators = (validators: unknown) => factory.createRules(validators as never);

        it('returns an empty array when validators is undefined', () => {
            const rules = factory.createRules(undefined);

            expect(rules).toEqual([]);
        });

        it('creates a ValidationRuleLuhn when the luhn validator is present', () => {
            const rules = factory.createRules({ luhn: {} });

            expect(rules).toHaveLength(1);
            expect(rules[0]).toBeInstanceOf(ValidationRuleLuhn);
        });

        it('creates a ValidationRuleIban when the iban validator is present', () => {
            const rules = factory.createRules({ iban: {} });

            expect(rules).toHaveLength(1);
            expect(rules[0]).toBeInstanceOf(ValidationRuleIban);
        });

        it('creates a ValidationRuleTermsAndConditions when the termsAndConditions validator is present', () => {
            const rules = factory.createRules({ termsAndConditions: {} });

            expect(rules).toHaveLength(1);
            expect(rules[0]).toBeInstanceOf(ValidationRuleTermsAndConditions);
        });

        it('creates a ValidationRuleRegularExpression with the correct regular expression', () => {
            const rules = factory.createRules({ regularExpression: { regularExpression: '^\\d+$' } });

            expect(rules).toHaveLength(1);
            expect(rules[0]).toBeInstanceOf(ValidationRuleRegularExpression);
            expect(rules[0].validate('123').valid).toBe(true);
            expect(rules[0].validate('abc').valid).toBe(false);
        });

        it('creates a ValidationRuleEmailAddress when the emailAddress validator is present', () => {
            const rules = factory.createRules({ emailAddress: {} });

            expect(rules).toHaveLength(1);
            expect(rules[0]).toBeInstanceOf(ValidationRuleEmailAddress);
        });

        it('creates a ValidationRuleExpirationDate when the expirationDate validator is present', () => {
            const rules = factory.createRules({ expirationDate: {} });

            expect(rules).toHaveLength(1);
            expect(rules[0]).toBeInstanceOf(ValidationRuleExpirationDate);
        });

        it('creates a ValidationRuleFixedList with the correct allowed values', () => {
            const rules = factory.createRules({ fixedList: { allowedValues: ['a', 'b'] } });

            expect(rules).toHaveLength(1);
            expect(rules[0]).toBeInstanceOf(ValidationRuleFixedList);
            expect(rules[0].validate('a').valid).toBe(true);
            expect(rules[0].validate('c').valid).toBe(false);
        });

        it('creates a ValidationRuleLength with the correct minLength and maxLength', () => {
            const rules = factory.createRules({ length: { minLength: 2, maxLength: 10 } });

            expect(rules).toHaveLength(1);
            const rule = rules[0] as ValidationRuleLength;
            expect(rule).toBeInstanceOf(ValidationRuleLength);
            expect(rule.minLength).toBe(2);
            expect(rule.maxLength).toBe(10);
        });

        it('creates a ValidationRuleRange with the correct minValue and maxValue', () => {
            const rules = factory.createRules({ range: { minValue: 1, maxValue: 100 } });

            expect(rules).toHaveLength(1);
            const rule = rules[0] as ValidationRuleRange;
            expect(rule).toBeInstanceOf(ValidationRuleRange);
            expect(rule.minValue).toBe(1);
            expect(rule.maxValue).toBe(100);
        });

        it('creates one rule per present validator when multiple validators are provided', () => {
            const rules = factory.createRules({
                luhn: {},
                iban: {},
                emailAddress: {},
                length: { minLength: 1, maxLength: 20 },
            });

            expect(rules).toHaveLength(4);
            expect(rules[0]).toBeInstanceOf(ValidationRuleLuhn);
            expect(rules[1]).toBeInstanceOf(ValidationRuleIban);
            expect(rules[2]).toBeInstanceOf(ValidationRuleEmailAddress);
            expect(rules[3]).toBeInstanceOf(ValidationRuleLength);
        });

        it('skips the length rule when minLength or maxLength is missing', () => {
            const rulesWithoutMin = createRulesWithInvalidValidators({ length: { maxLength: 10 } });
            const rulesWithoutMax = createRulesWithInvalidValidators({ length: { minLength: 2 } });

            expect(rulesWithoutMin).toEqual([]);
            expect(rulesWithoutMax).toEqual([]);
        });

        it('skips the range rule when minValue or maxValue is missing', () => {
            const rulesWithoutMin = createRulesWithInvalidValidators({ range: { maxValue: 100 } });
            const rulesWithoutMax = createRulesWithInvalidValidators({ range: { minValue: 1 } });

            expect(rulesWithoutMin).toEqual([]);
            expect(rulesWithoutMax).toEqual([]);
        });
    });
});
