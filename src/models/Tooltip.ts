import type { PaymentProductFieldTooltipJSON } from '../types';

export class Tooltip {
    /** @deprecated This field is deprecated and not returned from the API. */
    readonly image?: string;
    readonly label?: string;

    constructor(json: PaymentProductFieldTooltipJSON) {
        // noinspection JSDeprecatedSymbols
        this.image = json.image;
        this.label = json.label;
    }
}
