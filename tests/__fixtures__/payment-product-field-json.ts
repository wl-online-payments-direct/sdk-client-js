import type { PaymentProductFieldJson } from '../../src/types';

export const paymentProductFieldJson: PaymentProductFieldJson = {
    dataRestrictions: {
        isRequired: true,
        validators: {
            length: {
                maxLength: 19,
                minLength: 13,
            },
            luhn: {},
            regularExpression: {
                regularExpression: '^[0-9]*$',
            },
        },
    },
    displayHints: {
        alwaysShow: false,
        displayOrder: 0,
        formElement: {
            type: 'text',
        },
        label: 'Card number',
        mask: '{{9999}} {{9999}} {{9999}} {{9999}} {{999}}',
        obfuscate: true,
        placeholderLabel: 'test placeholder',
        preferredInputType: 'StringKeyboard',
        tooltip: {
            label: '',
        },
    },
    id: 'cardNumber',
    type: 'numericstring',
};

export const cardNumberFieldJson: PaymentProductFieldJson = {
    dataRestrictions: { isRequired: true, validators: { luhn: {} } },
    id: 'cardNumber',
    type: 'numericstring',
};
