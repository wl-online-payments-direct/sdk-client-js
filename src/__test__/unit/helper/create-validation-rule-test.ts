import type { PaymentProductFieldJSON, ValidationRule } from '../../../types';

import { describe, expect, it } from 'vitest';
import { PaymentRequest } from '../../../PaymentRequest';
import { PaymentProduct } from '../../../PaymentProduct';
import { paymentProductJson } from '../../__fixtures__/payment-product-json';
import { paymentProductFieldJson } from '../../__fixtures__/payment-product-field-json';

interface TestData {
  msg: string;
  validateValue?: boolean;
  validate?: boolean;
  value?: string;
}

const paymentProductField: PaymentProductFieldJSON = {
  ...paymentProductFieldJson,
  dataRestrictions: { isRequired: true, validators: {} },
};

function createPaymentRequest(): PaymentRequest {
  const paymentProduct = new PaymentProduct({
    ...paymentProductJson,
    fields: [paymentProductField],
  });

  const paymentRequest = new PaymentRequest();
  paymentRequest.setPaymentProduct(paymentProduct);
  return paymentRequest;
}

/**
 * Create validation rule test
 *
 * This test helper function allows a consistent way of testing
 * validation rules; it takes a validation rule and an array of test data.
 */
export function createValidationRuleTest(
  rule: ValidationRule,
  data: TestData[],
) {
  describe('`validate` and `validateValue`', () => {
    it.each(data)('$msg', ({ validateValue, validate, value }) => {
      const paymentRequest = createPaymentRequest();
      if (value !== undefined) {
        paymentRequest.setValue(paymentProductField.id, value);
      }
      if (validateValue !== undefined) {
        expect(rule.validateValue(paymentRequest, paymentProductField.id)).toBe(
          validateValue,
        );
      }
      if (validate !== undefined) {
        expect(rule.validate(value as string)).toBe(validate);
      }
    });
  });
}
