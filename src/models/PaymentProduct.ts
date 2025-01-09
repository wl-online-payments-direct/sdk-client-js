import type { PaymentProductJSON } from '../types';

import { PaymentProductField } from './PaymentProductField';
import { BasicPaymentProduct } from './BasicPaymentProduct';

function _parseJSON(
    _json: PaymentProductJSON,
    _paymentProductFields: PaymentProductField[],
    _paymentProductFieldById: Record<string, PaymentProductField | undefined>,
) {
    if (!_json.fields) {
        return;
    }

    for (const field of _json.fields) {
        const paymentProductField = new PaymentProductField(field);
        _paymentProductFields.push(paymentProductField);
        _paymentProductFieldById[paymentProductField.id] = paymentProductField;
    }
}

export class PaymentProduct extends BasicPaymentProduct {
    readonly paymentProductFields: PaymentProductField[];
    readonly paymentProductFieldById: Record<string, PaymentProductField | undefined>;

    constructor(readonly json: PaymentProductJSON) {
        super(json);

        this.paymentProductFields = [];
        this.paymentProductFieldById = {};

        _parseJSON(json, this.paymentProductFields, this.paymentProductFieldById);
    }
}
