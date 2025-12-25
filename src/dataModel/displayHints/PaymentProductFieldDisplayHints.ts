import { Tooltip } from './Tooltip';
import { FormElement } from './FormElement';
import type { PaymentProductFieldDisplayHintsJson } from '../../types';

export class PaymentProductFieldDisplayHints {
    readonly displayOrder?: number;
    readonly label: string;
    readonly mask: string;
    readonly obfuscate: boolean;
    readonly placeholderLabel?: string;
    readonly preferredInputType?: string;
    readonly alwaysShow: boolean;
    readonly wildcardMask: string;
    readonly tooltipLabel?: string;
    readonly formElementType?: string;

    constructor(json: PaymentProductFieldDisplayHintsJson) {
        this.displayOrder = json.displayOrder;
        this.formElementType = json.formElement ? new FormElement(json.formElement).type : undefined;
        this.label = json.label ?? '';
        this.mask = json.mask ?? '';
        this.obfuscate = json.obfuscate;
        this.placeholderLabel = json.placeholderLabel;
        this.preferredInputType = json.preferredInputType;
        this.tooltipLabel = json.tooltip ? new Tooltip(json.tooltip).label : undefined;
        this.alwaysShow = json.alwaysShow;
        this.wildcardMask = json.mask ? json.mask.replace(/9/g, '*') : '';
    }
}
