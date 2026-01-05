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
import { paymentProductFieldJson } from '../../../__fixtures__/payment-product-field-json';
import { PaymentProductField } from '../../../../src/domain/paymentProduct/productField/PaymentProductField';
import { DefaultPaymentProductFactory } from '../../../../src/infrastructure/factories/DefaultPaymentProductFactory';

describe('PaymentProductField', () => {
    let paymentProductField: PaymentProductField;
    beforeEach(() => {
        paymentProductField = new DefaultPaymentProductFactory().createPaymentProductField(paymentProductFieldJson);
    });

    describe('getLabel', () => {
        it('should return `Card number`', () => {
            const label = paymentProductField.getLabel();
            expect(label).toBe('Card number');
        });
    });

    describe('getPlaceholder', () => {
        it('should return placeholder `test placeholder`', () => {
            const placeholder = paymentProductField.getPlaceholder();
            expect(placeholder).toBe('test placeholder');
        });
    });

    describe('shouldObfuscate', () => {
        it('should return true', () => {
            const placeholder = paymentProductField.shouldObfuscate();
            expect(placeholder).toBe(true);
        });
    });

    describe('isRequired', () => {
        it('should return true', () => {
            const placeholder = paymentProductField.isRequired();
            expect(placeholder).toBe(true);
        });
    });

    describe('applyMask', () => {
        it('should return masked value ', () => {
            const maskedValue = paymentProductField.applyMask('12345678901234567890');
            expect(maskedValue).toBe('1234 5678 9012 3456 789');
        });

        it('should return unmasked value (raw) if no mask', () => {
            const paymentProductFieldWithoutMask = new DefaultPaymentProductFactory().createPaymentProductField({
                ...paymentProductFieldJson,
                displayHints: { ...paymentProductFieldJson.displayHints!, mask: '' },
            });

            const maskedValue = paymentProductFieldWithoutMask.applyMask('12345678901234567890');
            expect(maskedValue).toBe('12345678901234567890');
        });
    });

    describe('removeMask', () => {
        let mask: string | undefined = undefined;
        beforeEach(() => {
            mask = paymentProductField.applyMask('1234567890123456789');
        });

        it('should return unmasked value ', () => {
            expect(mask).toBe('1234 5678 9012 3456 789');
            const rawValue = paymentProductField.removeMask(mask!);
            expect(rawValue).toBe('1234567890123456789');
        });
    });

    describe('validate', () => {
        it('should return empty list of error messages', () => {
            const errorMessages = paymentProductField.validate('4242424242424242');
            expect(errorMessages).length(0);
        });

        it('should return list with error messages', () => {
            const errorMessages = paymentProductField.validate('424');
            expect(errorMessages).length(2);
            const sortedErrors = errorMessages.sort((a, b) => (a.type > b.type ? 1 : -1));
            expect(sortedErrors[0].type).toBe('length');
            expect(sortedErrors[1].type).toBe('luhn');
        });
    });
});
