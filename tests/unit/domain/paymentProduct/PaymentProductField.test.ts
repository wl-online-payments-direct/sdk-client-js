import { beforeEach, describe, expect, it } from 'vitest';
import { paymentProductFieldJson } from '../../../__fixtures__/payment-product-field-json';
import { PaymentProductField } from '../../../../src/domain/paymentProduct/PaymentProductField';
import type { PaymentProductFieldJson } from '../../../../src/types';

describe('getLabel', () => {
    let paymentProductField: PaymentProductField;
    beforeEach(() => {
        paymentProductField = new PaymentProductField(paymentProductFieldJson);
    });

    it('should return `Card number`', () => {
        const label = paymentProductField.getLabel();
        expect(label).toBe('Card number');
    });
});

describe('getPlaceholder', () => {
    let paymentProductField: PaymentProductField;
    beforeEach(() => {
        paymentProductField = new PaymentProductField(paymentProductFieldJson);
    });

    it('should return placeholder `test placeholder`', () => {
        const placeholder = paymentProductField.getPlaceholder();
        expect(placeholder).toBe('test placeholder');
    });
});

describe('shouldObfuscate', () => {
    let paymentProductField: PaymentProductField;
    beforeEach(() => {
        paymentProductField = new PaymentProductField(paymentProductFieldJson);
    });

    it('should return true', () => {
        const placeholder = paymentProductField.shouldObfuscate();
        expect(placeholder).toBe(true);
    });
});

describe('isRequired', () => {
    let paymentProductField: PaymentProductField;
    beforeEach(() => {
        paymentProductField = new PaymentProductField(paymentProductFieldJson);
    });

    it('should return true', () => {
        const placeholder = paymentProductField.isRequired();
        expect(placeholder).toBe(true);
    });
});

describe('applyMask', () => {
    let paymentProductField: PaymentProductField;
    beforeEach(() => {
        paymentProductField = new PaymentProductField(paymentProductFieldJson);
    });

    it('should return masked value ', () => {
        const maskedValue = paymentProductField.applyMask('12345678901234567890');
        expect(maskedValue).toBe('1234 5678 9012 3456 789');
    });

    it('should return unmasked value (raw) if no mask', () => {
        const paymentProductFieldWithoutMask = new PaymentProductField({
            ...paymentProductFieldJson,
            displayHints: { ...paymentProductFieldJson.displayHints, mask: '' },
        } as PaymentProductFieldJson);

        const maskedValue = paymentProductFieldWithoutMask.applyMask('12345678901234567890');
        expect(maskedValue).toBe('12345678901234567890');
    });
});

describe('removeMask', () => {
    let paymentProductField: PaymentProductField;
    let mask: string | undefined = undefined;
    beforeEach(() => {
        paymentProductField = new PaymentProductField(paymentProductFieldJson);
        mask = paymentProductField.applyMask('1234567890123456789');
    });

    it('should return unmasked value ', () => {
        expect(mask).toBe('1234 5678 9012 3456 789');
        const rawValue = paymentProductField.removeMask(mask!);
        expect(rawValue).toBe('1234567890123456789');
    });
});

describe('validate', () => {
    let paymentProductField: PaymentProductField;
    beforeEach(() => {
        paymentProductField = new PaymentProductField(paymentProductFieldJson);
    });

    it('should return empty list of error messages', () => {
        const errorMessages = paymentProductField.validate('4242424242424242');
        expect(errorMessages).length(0);
    });

    it('should return list with error messages', () => {
        const errorMessages = paymentProductField.validate('424');
        expect(errorMessages).length(2);
        expect(errorMessages[0].type).toBe('length');
        expect(errorMessages[1].type).toBe('luhn');
    });
});
