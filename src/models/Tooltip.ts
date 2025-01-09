import type { PaymentProductFieldTooltipJSON } from '../types';

export class Tooltip {
    readonly image: string;
    readonly label?: string;

    constructor(json: PaymentProductFieldTooltipJSON) {
        this.image = json.image;
        this.label = json.label;
    }
}
