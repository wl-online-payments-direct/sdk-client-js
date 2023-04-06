import { beforeEach, describe, expect, it } from 'vitest';

import { PaymentRequest } from '../../PaymentRequest';
import { PaymentProduct } from '../../PaymentProduct';
import { AccountOnFile } from '../../AccountOnFile';
import { paymentProductJson } from '../__fixtures__/payment-product-json';
import { paymentProductFieldJson } from '../__fixtures__/payment-product-field-json';
import { baseAccountOnFileJson } from '../__fixtures__/base-account-on-file-json';

const fieldRequiredLuhn = {
  ...paymentProductFieldJson,
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
    const _paymentProductJson = { ...paymentProductJson, fields: [] };
    request.setPaymentProduct(new PaymentProduct(_paymentProductJson));
    expect(request.isValid()).toBe(true);
  });

  it('should return `false` when `paymentProduct` contains a field who is required, but value is not set', () => {
    const _paymentProductJson = {
      ...paymentProductJson,
      fields: [fieldRequiredLuhn],
    };
    request.setPaymentProduct(new PaymentProduct(_paymentProductJson));
    expect(request.isValid()).toBe(false);
  });

  it('should return `true` when `paymentProduct` contains a field who is required, and value is set correctly', () => {
    const _paymentProductJson = {
      ...paymentProductJson,
      fields: [fieldRequiredLuhn],
    };
    request.setPaymentProduct(new PaymentProduct(_paymentProductJson));
    request.setValue(paymentProductFieldJson.id, '4567350000427977');
    expect(request.isValid()).toBe(true);
  });

  it('should return `false` when `paymentProduct` contains a field who is required, and value is set incorrectly', () => {
    const _paymentProductJson = {
      ...paymentProductJson,
      fields: [fieldRequiredLuhn],
    };
    request.setPaymentProduct(new PaymentProduct(_paymentProductJson));
    request.setValue(paymentProductFieldJson.id, '456735000042797');
    expect(request.isValid()).toBe(false);
  });

  describe('field provided by account on file', () => {
    const _paymentProductJson = {
      ...paymentProductJson,
      fields: [paymentProductFieldJson],
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
    const _paymentProductJson = { ...paymentProductJson, fields: [] };
    request.setPaymentProduct(new PaymentProduct(_paymentProductJson));
    expect(request.getErrorMessageIds()).toEqual([]);
  });

  it('should return `["luhn"]` when value is set incorrectly with invalid luhn validation', () => {
    const _paymentProductJson = {
      ...paymentProductJson,
      fields: [fieldRequiredLuhn],
    };
    request.setPaymentProduct(new PaymentProduct(_paymentProductJson));
    request.setValue(paymentProductFieldJson.id, '456735000042797');
    expect(request.getErrorMessageIds()).toEqual(['luhn']);
  });
});
