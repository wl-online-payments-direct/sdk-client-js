export const AccountOnFileAttributeStatus = {
    READ_ONLY: 'READ_ONLY',
    CAN_WRITE: 'CAN_WRITE',
    MUST_WRITE: 'MUST_WRITE',
} as const;

type AccountOnFileAttributeStatusJson =
    (typeof AccountOnFileAttributeStatus)[keyof typeof AccountOnFileAttributeStatus];

export interface AccountOnFileJson {
    attributes: AccountOnFileAttributeJson[];
    displayHints: AccountOnFileDisplayHintsJson;
    id: string;
    paymentProductId: number;
}

export type AccountOnFileAttributeJson = KeyValuePairJson & {
    status: AccountOnFileAttributeStatusJson;
};

export interface AccountOnFileDisplayHintsJson {
    labelTemplate: LabelTemplateElementJson[];
    logo: string;
}

export interface KeyValuePairJson {
    key: string;
    value: string;
}

export interface LabelTemplateElementJson {
    attributeKey: string;
    mask: string;
}
