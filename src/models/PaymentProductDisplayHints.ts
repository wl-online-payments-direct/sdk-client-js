import type { PaymentProductDisplayHintsJSON } from '../types';

export class PaymentProductDisplayHints {
    readonly displayOrder: number;
    readonly label?: string;
    readonly logo: string;

    constructor(readonly json: PaymentProductDisplayHintsJSON) {
        this.displayOrder = json.displayOrder;
        this.label = json.label;
        this.logo = json.logo;
    }
}
