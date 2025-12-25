import { BasicPaymentProduct } from './BasicPaymentProduct';
import { PaymentProductField } from './PaymentProductField';
import type { PaymentProductJson } from '../../types';

export class PaymentProduct extends BasicPaymentProduct {
    private readonly fields: PaymentProductField[];

    constructor(json: PaymentProductJson) {
        super(json);

        this.fields = PaymentProduct.parseFields(json);
    }

    getFields(): PaymentProductField[] {
        return this.fields;
    }

    getRequiredFields(): PaymentProductField[] {
        return this.fields.filter((field) => field.isRequired());
    }

    getField(id: string): PaymentProductField | undefined {
        return this.fields.find((field) => field.id === id);
    }

    private static parseFields(json: PaymentProductJson) {
        if (!json.fields) {
            return [];
        }

        const fields = json.fields.map((field) => new PaymentProductField(field));

        return fields.sort((a, b) => a.getDisplayOrder() - b.getDisplayOrder());
    }
}
