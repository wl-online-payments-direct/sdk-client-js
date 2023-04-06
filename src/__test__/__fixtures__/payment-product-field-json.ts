import type { PaymentProductFieldJSON } from '../../types';

export const paymentProductFieldJson: PaymentProductFieldJSON = {
  dataRestrictions: { isRequired: true, validators: { luhn: {} } },
  id: 'cardNumber',
  type: 'numericstring',
};
