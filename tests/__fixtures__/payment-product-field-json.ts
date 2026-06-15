/*
 * Do not remove or alter the notices in this preamble.
 *
 * This software is owned by Worldline and may not be be altered, copied, reproduced, republished, uploaded, posted, transmitted or distributed in any way, without the prior written consent of Worldline.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import type { PaymentProductFieldDto } from '../../src/infrastructure/apiModels/paymentProduct/PaymentProductFieldDto';

export const paymentProductFieldJson: PaymentProductFieldDto = Object.freeze({
    dataRestrictions: Object.freeze({
        isRequired: true,
        validators: Object.freeze({
            length: Object.freeze({
                maxLength: 19,
                minLength: 13,
            }),
            luhn: Object.freeze({}),
            regularExpression: Object.freeze({
                regularExpression: '^[0-9]*$',
            }),
        }),
    }),
    displayHints: Object.freeze({
        alwaysShow: false,
        displayOrder: 0,
        formElement: Object.freeze({
            type: 'text',
        }),
        label: 'Card number',
        mask: '{{9999}} {{9999}} {{9999}} {{9999}} {{999}}',
        obfuscate: true,
        placeholderLabel: 'test placeholder',
        preferredInputType: 'StringKeyboard',
        tooltip: Object.freeze({
            label: '',
        }),
    }),
    id: 'cardNumber',
    type: 'numericstring',
}) as PaymentProductFieldDto;

export const cardNumberFieldJson: PaymentProductFieldDto = Object.freeze({
    dataRestrictions: Object.freeze({ isRequired: true, validators: Object.freeze({ luhn: Object.freeze({}) }) }),
    id: 'cardNumber',
    type: 'numericstring',
}) as PaymentProductFieldDto;
