import type { PaymentProductFieldDisplayHintsJSON } from '../types';

import { FormElement } from './FormElement';
import { Tooltip } from './Tooltip';

export class PaymentProductFieldDisplayHints {
    readonly displayOrder: number;
    readonly formElement?: FormElement;
    readonly label?: string;
    readonly mask?: string;
    readonly obfuscate: boolean;
    readonly placeholderLabel?: string;
    readonly preferredInputType?: string;
    readonly tooltip?: Tooltip;
    readonly alwaysShow: boolean;
    readonly wildcardMask: string;

    constructor(readonly json: PaymentProductFieldDisplayHintsJSON) {
        this.displayOrder = json.displayOrder;
        this.formElement = json.formElement ? new FormElement(json.formElement) : undefined;
        this.label = json.label;
        this.mask = json.mask;
        this.obfuscate = json.obfuscate;
        this.placeholderLabel = json.placeholderLabel;
        this.preferredInputType = json.preferredInputType;
        this.tooltip = json.tooltip ? new Tooltip(json.tooltip) : undefined;
        this.alwaysShow = json.alwaysShow;
        this.wildcardMask = json.mask ? json.mask.replace(/9/g, '*') : '';
    }
}
