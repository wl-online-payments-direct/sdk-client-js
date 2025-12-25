import type { AccountOnFileJson } from '../../src';

export const accountOnFileJson: AccountOnFileJson = {
    attributes: [
        {
            key: 'alias',
            status: 'READ_ONLY',
            value: '411111XXXXXX1111',
        },
        {
            key: 'cardNumber',
            status: 'READ_ONLY',
            value: '9999-9999-9999-9999',
        },
        {
            key: 'cvv',
            status: 'MUST_WRITE',
            value: '',
        },
    ],
    displayHints: {
        labelTemplate: [
            {
                attributeKey: 'alias',
                mask: '{{9999}} {{9999}} {{9999}} {{9999}} {{999}}',
            },
        ],
        logo: 'test-logo',
    },
    id: '1234',
    paymentProductId: 1,
};

export const accountOnFileJson2: AccountOnFileJson = {
    attributes: [
        {
            key: 'alias',
            status: 'READ_ONLY',
            value: 'test label',
        },
        {
            key: 'cardNumber',
            status: 'CAN_WRITE',
            value: '9999-9999-9999-9999',
        },
    ],
    displayHints: {
        labelTemplate: [
            {
                attributeKey: 'alias',
                mask: '',
            },
        ],
        logo: 'test-logo',
    },
    id: '5678',
    paymentProductId: 2,
};
