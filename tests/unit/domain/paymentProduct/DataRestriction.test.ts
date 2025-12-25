import { beforeEach, describe, expect, it } from 'vitest';
import { cardPaymentProductJson } from '../../../__fixtures__/payment-product-json';
import { DataRestrictions } from '../../../../src/domain/paymentProduct/DataRestrictions';

const dataRestrictionsJson = cardPaymentProductJson.fields[0].dataRestrictions;

describe('getValidationRules', () => {
    let dataRestrictions: DataRestrictions;
    beforeEach(() => {
        dataRestrictions = new DataRestrictions(dataRestrictionsJson);
    });

    it('should return validation rules with length 2', () => {
        const validationRules = dataRestrictions.getValidationRules();
        expect(validationRules.length).toBe(2);
        expect(validationRules.map((rule) => rule.type)).toEqual(['length', 'regularExpression']);
    });

    it('should return validation rules correct types: `length`, `regularExpression`', () => {
        const validationRules = dataRestrictions.getValidationRules();
        expect(validationRules.map((rule) => rule.type)).toEqual(['length', 'regularExpression']);
    });
});

describe('getValidationRule', () => {
    let dataRestrictions: DataRestrictions;
    beforeEach(() => {
        dataRestrictions = new DataRestrictions(dataRestrictionsJson);
    });

    it('should return validation rules with correct types: `length`, `regularExpression`', () => {
        const lengthRule = dataRestrictions.getValidationRule('length');
        const regularExpressionRule = dataRestrictions.getValidationRule('regularExpression');
        expect(lengthRule).toBeDefined();
        expect(regularExpressionRule).toBeDefined();
    });

    it('should return undefined for non-existing rule', () => {
        const nonDefinedRule = dataRestrictions.getValidationRule('nonDefined');

        expect(nonDefinedRule).not.toBeDefined();
    });
});
