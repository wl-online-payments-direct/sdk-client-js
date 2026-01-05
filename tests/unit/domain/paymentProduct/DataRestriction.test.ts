/*
 * Do not remove or alter the notices in this preamble.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { cardPaymentProductJson } from '../../../__fixtures__/payment-product-json';
import { DataRestrictions } from '../../../../src/domain/paymentProduct/productField/DataRestrictions';
import { DefaultPaymentProductFactory } from '../../../../src/infrastructure/factories/DefaultPaymentProductFactory';
import type { ValidationRule } from '../../../../src/domain/validation/rules/ValidationRule';
import { ValidationRuleType } from '../../../../src/domain/validation/rules/ValidationRuleType';

const dataRestrictionsDto = cardPaymentProductJson.fields[0].dataRestrictions;

describe('getValidationRules', () => {
    let dataRestrictions: DataRestrictions;
    beforeEach(() => {
        dataRestrictions = new DefaultPaymentProductFactory().createDataRestrictions(dataRestrictionsDto);
    });

    it('should return validation rules with length 2', () => {
        const validationRules = dataRestrictions.getValidationRules();
        expect(validationRules.length).toBe(2);
    });

    it('should return validation rules correct types: `length`, `regularExpression`', () => {
        const validationRules = dataRestrictions.getValidationRules();
        expect(rulesToSortedArray(validationRules)).toEqual(['length', 'regularExpression']);
    });
});

describe('getValidationRule', () => {
    let dataRestrictions: DataRestrictions;
    beforeEach(() => {
        dataRestrictions = new DefaultPaymentProductFactory().createDataRestrictions(dataRestrictionsDto);
    });

    it('should return validation rules with correct types: `length`, `regularExpression`', () => {
        const lengthRule = dataRestrictions.getValidationRule(ValidationRuleType.LENGTH);
        const regularExpressionRule = dataRestrictions.getValidationRule(ValidationRuleType.REGULAR_EXPRESSION);
        expect(lengthRule).toBeDefined();
        expect(regularExpressionRule).toBeDefined();
    });

    it('should return undefined for non-existing rule', () => {
        // @ts-ignore
        const nonDefinedRule = dataRestrictions.getValidationRule('nonDefined');

        expect(nonDefinedRule).not.toBeDefined();
    });
});

const rulesToSortedArray = (input: ValidationRule[]): string[] => {
    return input.map((rule) => rule.type).sort((a, b) => (a > b ? 1 : -1));
};
