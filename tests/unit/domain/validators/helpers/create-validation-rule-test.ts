/*
 * Do not remove or alter the notices in this preamble.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import { describe, expect, it } from 'vitest';
import { PaymentRequest } from '../../../../../src';
import { cardNumberFieldJson } from '../../../../__fixtures__/payment-product-field-json';
import { cardPaymentProductJson } from '../../../../__fixtures__/payment-product-json';
import type { ValidationRule } from '../../../../../src/domain/validation/rules/ValidationRule';
import { DefaultPaymentProductFactory } from '../../../../../src/infrastructure/factories/DefaultPaymentProductFactory';
import type { PaymentProductFieldDto } from '../../../../../src/infrastructure/apiModels/paymentProduct/PaymentProductFieldDto';

interface TestData {
    msg: string;
    isValid?: boolean;
    value?: string;
}

const paymentProductField: PaymentProductFieldDto = {
    ...cardNumberFieldJson,
    dataRestrictions: { isRequired: true, validators: {} },
};

function createPaymentRequest(): PaymentRequest {
    const paymentProduct = new DefaultPaymentProductFactory().createPaymentProduct({
        ...cardPaymentProductJson,
        fields: [paymentProductField],
    });

    return new PaymentRequest(paymentProduct);
}

/**
 * Create validation rule test
 *
 * This test helper function allows a consistent way of testing
 * validation rules; it takes a validation rule and an array of test data.
 */
export function createValidationRuleTest(rule: ValidationRule, data: TestData[]) {
    describe(rule.type + ' `validate`', () => {
        it.each(data)('$msg', ({ isValid, value }) => {
            const paymentRequest = createPaymentRequest();
            if (value !== undefined) {
                paymentRequest.setValue(paymentProductField.id, value);
            }

            if (isValid !== undefined) {
                expect(rule.validate(value as string).valid).toBe(isValid);
            }
        });
    });
}
