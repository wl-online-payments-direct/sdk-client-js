import type { LabelTemplateElementJson } from '../../src';

export const labelTemplate: LabelTemplateElementJson[] = [
    { attributeKey: 'cardNumber', mask: '****' },
    {
        attributeKey: 'cardHolderName',
        mask: '****',
    },
];

export const accountOnFileDisplayHintsJson = {
    logo: 'test-logo',
    labelTemplate,
};
