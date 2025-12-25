import type { PaymentProductFieldTooltipJson } from '../../types';

export class Tooltip {
    readonly label?: string;

    constructor(json: PaymentProductFieldTooltipJson) {
        this.label = json.label;
    }
}
