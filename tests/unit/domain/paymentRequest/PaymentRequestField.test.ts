import { beforeEach, describe, expect, it } from 'vitest';

import { paymentProductFieldJson } from '../../../__fixtures__/payment-product-field-json';
import { PaymentProductField } from '../../../../src/domain/paymentProduct/PaymentProductField';
import { PaymentRequestField } from '../../../../src/domain/paymentRequest/PaymentRequestField';

let paymentProductField: PaymentProductField;
let paymentRequestField: PaymentRequestField;

beforeEach(() => {
    paymentProductField = new PaymentProductField(paymentProductFieldJson);
    paymentRequestField = new PaymentRequestField(paymentProductField, false);
});

describe('value', () => {
    it('set and get value', () => {
        paymentRequestField.setValue('1234 5678 9012 3456 789');
        const value = paymentRequestField.getValue();

        expect(value).toBe('1234567890123456789');
    });

    it('get `undefined` value', () => {
        const value = paymentRequestField.getValue();
        expect(value).toBe(undefined);
    });

    it('set empty string to value', () => {
        paymentRequestField.setValue('');
        const value = paymentRequestField.getValue();

        expect(value).toBe(undefined);
    });
});

describe('clearValue', () => {
    it('should return undefined', () => {
        paymentRequestField.clearValue();
        const value = paymentRequestField.getValue();
        expect(value).toBe(undefined);
    });
});

describe('getType', () => {
    it('should return `numericstring`', () => {
        expect(paymentRequestField.getType()).toBe('numericstring');
    });
});

describe('shouldObfuscate', () => {
    it('should return `true`', () => {
        expect(paymentRequestField.shouldObfuscate()).toBe(true);
    });
});

describe('isRequired', () => {
    it('should return `true`', () => {
        expect(paymentRequestField.isRequired()).toBe(true);
    });
});

describe('getMaskedValue', () => {
    it('should return masked value', () => {
        paymentRequestField.setValue('1234567890123456789');
        expect(paymentRequestField.getMaskedValue()).toBe('1234 5678 9012 3456 789');
        expect(paymentRequestField.getValue()).toBe('1234567890123456789');
    });
});

describe('getId', () => {
    it('should return id `cardNumber`', () => {
        expect(paymentRequestField.getId()).toEqual('cardNumber');
    });
});

describe('getLabel', () => {
    it('should return `Card number`', () => {
        expect(paymentRequestField.getLabel()).toEqual('Card number');
    });
});

describe('getPlaceholder', () => {
    it('should return `test placeholder`', () => {
        expect(paymentRequestField.getPlaceholder()).toEqual('test placeholder');
    });
});

describe('validate', () => {
    it('should return list of errors if field `required` and value not provided', () => {
        const validationResult = paymentRequestField.validate();

        expect(validationResult.isValid).toBe(false);
        expect(validationResult.errors.length).toBe(1);
    });

    it('should return empty `errors` and `false` for `isValid` when correct card number passed', () => {
        paymentRequestField.setValue('7822551678890142249');
        const validationResult = paymentRequestField.validate();

        expect(validationResult.isValid).toBe(true);
        expect(validationResult.errors.length).toBe(0);
    });
});

describe('setValue for `READ_ONLY` field', () => {
    beforeEach(() => {
        paymentProductField = new PaymentProductField(paymentProductFieldJson);
        paymentRequestField = new PaymentRequestField(paymentProductField, true);
    });

    it('should throw an `Cannot write "READ_ONLY" field: cardNumber` error when trying to write value for `READ_ONLY` field', () => {
        expect(() => paymentRequestField.setValue('4222422242224222')).toThrow(
            `Cannot write "READ_ONLY" field: cardNumber`,
        );
    });
});
