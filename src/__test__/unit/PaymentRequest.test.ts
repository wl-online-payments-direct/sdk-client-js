import { beforeEach, describe, expect, it } from 'vitest';

import { PaymentRequest } from '../../PaymentRequest';
import { PaymentProduct } from '../../models/PaymentProduct';
import { AccountOnFile } from '../../models/AccountOnFile';
import { cardPaymentProductJson } from '../__fixtures__/payment-products-json';
import { cardNumberFieldJson } from '../__fixtures__/payment-product-fields-json';
import { baseAccountOnFileJson } from '../__fixtures__/base-account-on-file-json';

const fieldRequiredLuhn = {
    ...cardNumberFieldJson,
    dataRestrictions: { isRequired: true, validators: { luhn: {} } },
};

describe('isValid', () => {
    let request: PaymentRequest;
    beforeEach(() => {
        request = new PaymentRequest();
    });

    it('should return `false` when `paymentProduct` is not set', () => {
        expect(request.isValid()).toBe(false);
    });

    it('should return `true` when `paymentProduct` does not have any fields to validate', () => {
        const _paymentProductJson = { ...cardPaymentProductJson, fields: [] };
        request.setPaymentProduct(new PaymentProduct(_paymentProductJson));
        expect(request.isValid()).toBe(true);
    });

    it('should return `false` when `paymentProduct` contains a field which is required, but value is not set', () => {
        const _paymentProductJson = {
            ...cardPaymentProductJson,
            fields: [fieldRequiredLuhn],
        };
        request.setPaymentProduct(new PaymentProduct(_paymentProductJson));
        expect(request.isValid()).toBe(false);
    });

    it('should return `true` when `paymentProduct` contains a field which is required, and value is set correctly', () => {
        const _paymentProductJson = {
            ...cardPaymentProductJson,
            fields: [fieldRequiredLuhn],
        };
        request.setPaymentProduct(new PaymentProduct(_paymentProductJson));
        request.setValue(cardNumberFieldJson.id, '4567350000427977');
        expect(request.isValid()).toBe(true);
    });

    it('should return `false` when `paymentProduct` contains a field which is required, and value is set incorrectly', () => {
        const _paymentProductJson = {
            ...cardPaymentProductJson,
            fields: [fieldRequiredLuhn],
        };
        request.setPaymentProduct(new PaymentProduct(_paymentProductJson));
        request.setValue(cardNumberFieldJson.id, '456735000042797');
        expect(request.isValid()).toBe(false);
    });

    it('should return `false` when `paymentProduct` contains a field which is required, and value is not set', () => {
        const _paymentProductJson = {
            ...cardPaymentProductJson,
            fields: cardPaymentProductJson.fields.map((field) => ({
                ...field,
                dataRestrictions: { isRequired: true, validators: {} },
            })),
        };
        request.setPaymentProduct(new PaymentProduct(_paymentProductJson));
        expect(request.isValid()).toBe(false);
        request.setValue(cardNumberFieldJson.id, '');
        request.setValue('expiryDate', '');
        request.setValue('cvv', '');
        request.setValue('cardholderName', '');
        expect(request.isValid()).toBe(false);
        request.setValue(cardNumberFieldJson.id, 'value');
        expect(request.isValid()).toBe(false);
        request.setValue('expiryDate', 'value');
        expect(request.isValid()).toBe(false);
        request.setValue('cvv', 'value');
        expect(request.isValid()).toBe(false);
        request.setValue('cardholderName', 'value');
        expect(request.isValid()).toBe(true);
    });

    it('should return `false` when `paymentProduct` contains a field which has invalid value', () => {
        const _paymentProductJson = { ...cardPaymentProductJson };
        request.setPaymentProduct(new PaymentProduct(_paymentProductJson));
        expect(request.isValid()).toBe(false);
        request.setValue(cardNumberFieldJson.id, '4567350000427900');
        request.setValue('expiryDate', '3214');
        request.setValue('cvv', '123456');
        request.setValue('cardholderName', '');
        expect(request.isValid()).toBe(false);
        request.setValue(cardNumberFieldJson.id, '4567350000427977');
        expect(request.isValid()).toBe(false);
        request.setValue('expiryDate', '12/2030');
        expect(request.isValid()).toBe(false);
        request.setValue('cvv', '123');
        expect(request.isValid()).toBe(false);
        request.setValue('cardholderName', 'John Doe');
        expect(request.isValid()).toBe(true);
    });

    describe('field provided by account on file', () => {
        const _paymentProductJson = {
            ...cardPaymentProductJson,
            fields: [cardNumberFieldJson],
        };

        const aofReadOnly = new AccountOnFile({
            ...baseAccountOnFileJson,
            paymentProductId: _paymentProductJson.id,
            attributes: [
                {
                    key: 'cardNumber',
                    value: '************7977',
                    status: 'READ_ONLY',
                },
            ],
        });

        const aofMustWrite = new AccountOnFile({
            ...baseAccountOnFileJson,
            paymentProductId: _paymentProductJson.id,
            attributes: [
                {
                    key: 'cardNumber',
                    value: '************7977',
                    status: 'MUST_WRITE',
                },
            ],
        });

        it('should return `true` when account on file contains attribute status `READ_ONLY`', () => {
            request.setPaymentProduct(new PaymentProduct(_paymentProductJson));
            request.setAccountOnFile(aofReadOnly);
            expect(request.isValid()).toBe(true);
        });

        it('should return `false` when account on file contains attribute status `MUST_WRITE` without overridden value', () => {
            request.setPaymentProduct(new PaymentProduct(_paymentProductJson));
            request.setAccountOnFile(aofMustWrite);
            expect(request.isValid()).toBe(false);
        });

        it('should return `true` when account on file contains attribute status `MUST_WRITE` with overridden value', () => {
            request.setPaymentProduct(new PaymentProduct(_paymentProductJson));
            request.setAccountOnFile(aofMustWrite);
            request.setValue('cardNumber', '4567350000427977');
            expect(request.isValid()).toBe(true);
        });
    });
});

describe('getErrorMessageIds', () => {
    let request: PaymentRequest;
    beforeEach(() => {
        request = new PaymentRequest();
    });

    it('should return `[]` when no value is set', () => {
        const _paymentProductJson = { ...cardPaymentProductJson, fields: [] };
        request.setPaymentProduct(new PaymentProduct(_paymentProductJson));
        expect(request.getErrorMessageIds()).toEqual([]);
    });

    it('should return `["luhn"]` when value is set incorrectly with invalid luhn validation', () => {
        const _paymentProductJson = {
            ...cardPaymentProductJson,
            fields: [fieldRequiredLuhn],
        };
        request.setPaymentProduct(new PaymentProduct(_paymentProductJson));
        request.setValue(cardNumberFieldJson.id, '456735000042797');
        expect(request.getErrorMessageIds()).toEqual(['luhn']);
    });
});

describe('setValue', () => {
    let request: PaymentRequest;
    beforeEach(() => {
        request = new PaymentRequest();
    });

    it('should set a field value', () => {
        request.setValue('cardNumber', '4567350000427977');
        expect(request.getValue('cardNumber')).toBe('4567350000427977');
    });

    it('should update an existing field value', () => {
        request.setValue('cardNumber', '4567350000427977');
        request.setValue('cardNumber', '1234567890123456');
        expect(request.getValue('cardNumber')).toBe('1234567890123456');
    });

    it('should set undefined value', () => {
        request.setValue('cardNumber', undefined);
        expect(request.getValue('cardNumber')).toBeUndefined();
    });
});

describe('setValues', () => {
    let request: PaymentRequest;
    beforeEach(() => {
        request = new PaymentRequest();
    });

    it('should set multiple field values', () => {
        request.setValues({
            cardNumber: '4567350000427977',
            expiryDate: '12/2030',
            cvv: '123',
        });
        expect(request.getValue('cardNumber')).toBe('4567350000427977');
        expect(request.getValue('expiryDate')).toBe('12/2030');
        expect(request.getValue('cvv')).toBe('123');
    });

    it('should handle undefined values', () => {
        request.setValues({
            cardNumber: '4567350000427977',
            expiryDate: undefined,
        });
        expect(request.getValue('cardNumber')).toBe('4567350000427977');
        expect(request.getValue('expiryDate')).toBeUndefined();
    });

    it('should overwrite existing values', () => {
        request.setValue('cardNumber', 'old-value');
        request.setValues({
            cardNumber: '4567350000427977',
        });
        expect(request.getValue('cardNumber')).toBe('4567350000427977');
    });
});

describe('setTokenize and getTokenize', () => {
    let request: PaymentRequest;
    beforeEach(() => {
        request = new PaymentRequest();
    });

    it('should default to false', () => {
        expect(request.getTokenize()).toBe(false);
    });

    it('should set tokenize to true', () => {
        request.setTokenize(true);
        expect(request.getTokenize()).toBe(true);
    });

    it('should set tokenize to false', () => {
        request.setTokenize(true);
        request.setTokenize(false);
        expect(request.getTokenize()).toBe(false);
    });
});

describe('getValue', () => {
    let request: PaymentRequest;
    beforeEach(() => {
        request = new PaymentRequest();
    });

    it('should return undefined for non-existent field', () => {
        expect(request.getValue('nonExistentField')).toBeUndefined();
    });

    it('should return the value for an existing field', () => {
        request.setValue('cardNumber', '4567350000427977');
        expect(request.getValue('cardNumber')).toBe('4567350000427977');
    });

    it('should return undefined when value is set to undefined', () => {
        request.setValue('cardNumber', undefined);
        expect(request.getValue('cardNumber')).toBeUndefined();
    });
});

describe('getValues', () => {
    let request: PaymentRequest;
    beforeEach(() => {
        request = new PaymentRequest();
    });

    it('should return empty object when no values are set', () => {
        expect(request.getValues()).toEqual({});
    });

    it('should return all field values', () => {
        request.setValue('cardNumber', '4567350000427977');
        request.setValue('expiryDate', '12/2030');
        request.setValue('cvv', '123');
        expect(request.getValues()).toEqual({
            cardNumber: '4567350000427977',
            expiryDate: '12/2030',
            cvv: '123',
        });
    });

    it('should include undefined values', () => {
        request.setValue('cardNumber', '4567350000427977');
        request.setValue('expiryDate', undefined);
        expect(request.getValues()).toEqual({
            cardNumber: '4567350000427977',
            expiryDate: undefined,
        });
    });
});

describe('getMaskedValue', () => {
    let request: PaymentRequest;
    beforeEach(() => {
        request = new PaymentRequest();
    });

    it('should return undefined when payment product is not set', () => {
        request.setValue('cardNumber', '4567350000427977');
        expect(request.getMaskedValue('cardNumber')).toBeUndefined();
    });

    it('should return undefined when field is not in payment product', () => {
        const _paymentProductJson = { ...cardPaymentProductJson, fields: [] };
        request.setPaymentProduct(new PaymentProduct(_paymentProductJson));
        request.setValue('nonExistentField', 'value');
        expect(request.getMaskedValue('nonExistentField')).toBeUndefined();
    });

    it('should return undefined when value is not set', () => {
        const _paymentProductJson = {
            ...cardPaymentProductJson,
            fields: [cardNumberFieldJson],
        };
        request.setPaymentProduct(new PaymentProduct(_paymentProductJson));
        expect(request.getMaskedValue('cardNumber')).toBeUndefined();
    });

    it('should return masked value when value is set', () => {
        const _paymentProductJson = {
            ...cardPaymentProductJson,
        };
        request.setPaymentProduct(new PaymentProduct(_paymentProductJson));
        request.setValue('cardNumber', '4567350000427977');
        expect(request.getMaskedValue('cardNumber')).toBe('4567 3500 0042 7977');
    });
});

describe('getMaskedValues', () => {
    let request: PaymentRequest;
    beforeEach(() => {
        request = new PaymentRequest();
    });

    it('should return empty object when no values are set', () => {
        expect(request.getMaskedValues()).toEqual({});
    });

    it('should return masked values for all fields', () => {
        const _paymentProductJson = {
            ...cardPaymentProductJson,
        };
        request.setPaymentProduct(new PaymentProduct(_paymentProductJson));
        request.setValue('cardNumber', '4567350000427977');
        expect(request.getMaskedValues()).toEqual({
            cardNumber: '4567 3500 0042 7977',
        });
    });

    it('should return undefined for fields without payment product', () => {
        request.setValue('cardNumber', '4567350000427977');
        expect(request.getMaskedValues()).toEqual({
            cardNumber: undefined,
        });
    });
});

describe('getUnmaskedValue', () => {
    let request: PaymentRequest;
    beforeEach(() => {
        request = new PaymentRequest();
    });

    it('should return undefined when value is not set', () => {
        expect(request.getUnmaskedValue('cardNumber')).toBeUndefined();
    });

    it('should return undefined when payment product is not set', () => {
        request.setValue('cardNumber', '4567 3500 0042 7977');
        expect(request.getUnmaskedValue('cardNumber')).toBeUndefined();
    });

    it('should return undefined when field is not in payment product', () => {
        const _paymentProductJson = { ...cardPaymentProductJson, fields: [] };
        request.setPaymentProduct(new PaymentProduct(_paymentProductJson));
        request.setValue('nonExistentField', 'value');
        expect(request.getUnmaskedValue('nonExistentField')).toBeUndefined();
    });

    it('should return unmasked value when value is set with mask', () => {
        const _paymentProductJson = {
            ...cardPaymentProductJson,
        };
        request.setPaymentProduct(new PaymentProduct(_paymentProductJson));
        request.setValue('cardNumber', '4567 3500 0042 7977');
        expect(request.getUnmaskedValue('cardNumber')).toBe('4567350000427977');
    });
});

describe('getUnmaskedValues', () => {
    let request: PaymentRequest;
    beforeEach(() => {
        request = new PaymentRequest();
    });

    it('should return empty object when no values are set', () => {
        expect(request.getUnmaskedValues()).toEqual({});
    });

    it('should return unmasked values for all fields', () => {
        const _paymentProductJson = {
            ...cardPaymentProductJson,
        };
        request.setPaymentProduct(new PaymentProduct(_paymentProductJson));
        request.setValue('cardNumber', '4567 3500 0042 7977');
        expect(request.getUnmaskedValues()).toEqual({
            cardNumber: '4567350000427977',
        });
    });
});

describe('getPaymentProduct', () => {
    let request: PaymentRequest;
    beforeEach(() => {
        request = new PaymentRequest();
    });

    it('should return undefined when payment product is not set', () => {
        expect(request.getPaymentProduct()).toBeUndefined();
    });

    it('should return the payment product when set', () => {
        const _paymentProductJson = {
            ...cardPaymentProductJson,
            fields: [cardNumberFieldJson],
        };
        const paymentProduct = new PaymentProduct(_paymentProductJson);
        request.setPaymentProduct(paymentProduct);
        expect(request.getPaymentProduct()).toBe(paymentProduct);
    });
});

describe('setAccountOnFile and getAccountOnFile', () => {
    let request: PaymentRequest;
    beforeEach(() => {
        request = new PaymentRequest();
    });

    it('should return undefined when account on file is not set', () => {
        expect(request.getAccountOnFile()).toBeUndefined();
    });

    it('should set and return account on file', () => {
        const aof = new AccountOnFile({
            ...baseAccountOnFileJson,
            paymentProductId: 1,
            attributes: [
                {
                    key: 'cardNumber',
                    value: '************7977',
                    status: 'READ_ONLY',
                },
            ],
        });
        request.setAccountOnFile(aof);
        expect(request.getAccountOnFile()).toBe(aof);
    });

    it('should not set account on file when null is passed', () => {
        request.setAccountOnFile(null);
        expect(request.getAccountOnFile()).toBeUndefined();
    });

    it('should clear field values associated with account on file attributes', () => {
        const aof = new AccountOnFile({
            ...baseAccountOnFileJson,
            paymentProductId: 1,
            attributes: [
                {
                    key: 'cardNumber',
                    value: '************7977',
                    status: 'READ_ONLY',
                },
                {
                    key: 'expiryDate',
                    value: '12/2030',
                    status: 'READ_ONLY',
                },
            ],
        });
        request.setValue('cardNumber', '4567350000427977');
        request.setValue('expiryDate', '12/2030');
        request.setValue('cvv', '123');

        request.setAccountOnFile(aof);

        expect(request.getValue('cardNumber')).toBeUndefined();
        expect(request.getValue('expiryDate')).toBeUndefined();
        expect(request.getValue('cvv')).toBe('123');
    });
});

describe('getPaymentProductId', () => {
    let request: PaymentRequest;
    beforeEach(() => {
        request = new PaymentRequest();
    });

    it('should return undefined when payment product is not set', () => {
        expect(request.getPaymentProductId()).toBeUndefined();
    });

    it('should return payment product id from payment product when set', () => {
        const _paymentProductJson = {
            ...cardPaymentProductJson,
            fields: [cardNumberFieldJson],
        };
        const paymentProduct = new PaymentProduct(_paymentProductJson);
        request.setPaymentProduct(paymentProduct);
        expect(request.getPaymentProductId()).toBe(_paymentProductJson.id);
    });
});
