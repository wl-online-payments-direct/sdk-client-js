export interface PaymentProductFieldTooltipJson {
    label?: string;
}

export interface PaymentProductFieldDisplayHintsJson {
    alwaysShow: boolean;
    displayOrder: number;
    formElement: FormElementJson;
    label?: string;
    link?: string;
    mask?: string;
    obfuscate: boolean;
    placeholderLabel?: string;
    preferredInputType?: string;
    tooltip?: PaymentProductFieldTooltipJson;
}

export interface PaymentProductDisplayHintsJson {
    displayOrder: number;
    label?: string;
    logo: string;
}

export interface FormElementJson {
    type: string;
}
