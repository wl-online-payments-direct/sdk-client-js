/*
 * Do not remove or alter the notices in this preamble.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import type { PaymentProductFieldDto } from '../../src/infrastructure/apiModels/paymentProduct/PaymentProductFieldDto';

export const paymentProductFieldJson: PaymentProductFieldDto = {
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

export const cardNumberFieldJson: PaymentProductFieldDto = {
    dataRestrictions: { isRequired: true, validators: { luhn: {} } },
    id: 'cardNumber',
    type: 'numericstring',
};
