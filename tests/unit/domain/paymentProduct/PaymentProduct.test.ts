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
import { PaymentProduct } from '../../../../src/domain/paymentProduct/PaymentProduct';
import { DefaultPaymentProductFactory } from '../../../../src/infrastructure/factories/DefaultPaymentProductFactory';

describe('getFields', () => {
    let paymentProduct: PaymentProduct;
    beforeEach(() => {
        paymentProduct = new DefaultPaymentProductFactory().createPaymentProduct(cardPaymentProductJson);
    });

    it('should return correct length`', () => {
        const fields = paymentProduct.getFields();
        expect(fields).length(4);
    });

    it('should return correct elements in ascending order`', () => {
        const fields = paymentProduct.getFields();
        const expectedIds = fields.map((field) => field.id);
        expect(expectedIds).toEqual(['cardNumber', 'cardholderName', 'expiryDate', 'cvv']);
    });
});

describe('getRequiredFields', () => {
    let paymentProduct: PaymentProduct;
    beforeEach(() => {
        paymentProduct = new DefaultPaymentProductFactory().createPaymentProduct(cardPaymentProductJson);
    });

    it('should return correct length`', () => {
        const fields = paymentProduct.getRequiredFields();
        expect(fields).length(3);
    });

    it('should return correct length`', () => {
        const fields = paymentProduct.getRequiredFields();
        const expectedIds = fields.map((field) => field.id);
        expect(expectedIds).toEqual(['cardNumber', 'expiryDate', 'cvv']);
    });
});

describe('getField', () => {
    let paymentProduct: PaymentProduct;
    beforeEach(() => {
        paymentProduct = new DefaultPaymentProductFactory().createPaymentProduct(cardPaymentProductJson);
    });

    it('should return `cardNumber` field', () => {
        const field = paymentProduct.getField('cardNumber');
        expect(field?.id).not.toBe(undefined);
        expect(field?.id).toEqual('cardNumber');
    });

    it('should return `cvv` field', () => {
        const field = paymentProduct.getField('cvv');
        expect(field?.id).not.toBe(undefined);
        expect(field?.id).toEqual('cvv');
    });

    it('should return `cardholderName` field', () => {
        const field = paymentProduct.getField('cardholderName');
        expect(field?.id).not.toBe(undefined);
        expect(field?.id).toEqual('cardholderName');
    });

    it('should return `expiryDate` field', () => {
        const field = paymentProduct.getField('expiryDate');
        expect(field?.id).not.toBe(undefined);
        expect(field?.id).toEqual('expiryDate');
    });

    it('should return `undefined` if wrong id', () => {
        const field = paymentProduct.getField('123');
        expect(field?.id).toBe(undefined);
    });
});

describe('Fluent API methods', () => {
    let paymentProduct: PaymentProduct;
    beforeEach(() => {
        paymentProduct = new DefaultPaymentProductFactory().createPaymentProduct(cardPaymentProductJson);
    });

    it('applyMask on field', () => {
        const maskedString = paymentProduct.getField('cardNumber')?.applyMask('12345678901234567890');
        expect(maskedString).toBe('1234 5678 9012 3456 789');
    });

    it('validate field', () => {
        const validationMessages = paymentProduct.getField('cardNumber')?.validate('12345678901234567890');
        const result = validationMessages?.map((message) => message.type).sort((a, b) => (a > b ? 1 : -1));
        expect(result).toEqual(['length', 'luhn']);
    });

    it('isRequired field', () => {
        const isRequired = paymentProduct.getField('cardNumber')?.isRequired();
        expect(isRequired).toBe(true);
    });
});
