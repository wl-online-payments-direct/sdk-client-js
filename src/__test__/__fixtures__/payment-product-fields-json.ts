import type { PaymentProductFieldJSON } from '../../types';

export const cardNumberFieldJson: PaymentProductFieldJSON = {
    dataRestrictions: { isRequired: true, validators: { luhn: {} } },
    id: 'cardNumber',
    type: 'numericstring',
};
