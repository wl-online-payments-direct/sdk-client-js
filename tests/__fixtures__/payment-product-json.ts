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
import type { PaymentProductDto } from '../../src/infrastructure/apiModels/paymentProduct/PaymentProduct';

const fields: PaymentProductFieldDto[] = [
    {
        dataRestrictions: {
            isRequired: false,
            validators: {
                length: {
                    maxLength: 50,
                    minLength: 2,
                },
                regularExpression: {
                    regularExpression:
                        "^[a-zA-ZàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßẞŠšŽžŸÿčČďĎěĚľĽĺĹňŇřŘšťŠŤůŮžŽęĘłŁśŚźŹżŻąĄčČęĘėĖįĮšŠųŲūŪžŽäÄöÖõÕüÜāĀčČēĒģĢīĪķĶļĻņŅōŌŗŖšŠūŪžŽ0-9 +_.=,:\\-\\[\\]\\/\\(\\)']*$",
                },
            },
        },
        displayHints: {
            alwaysShow: false,
            displayOrder: 1,
            formElement: {
                type: 'text',
            },
            label: "Cardholder's name",
            obfuscate: false,
            placeholderLabel: '',
            preferredInputType: 'StringKeyboard',
        },
        id: 'cardholderName',
        type: 'string',
    },
    {
        dataRestrictions: {
            isRequired: true,
            validators: {
                expirationDate: {},
                regularExpression: {
                    regularExpression: '^(0[1-9]|1[0-2])(\\d{4})$',
                },
            },
        },
        displayHints: {
            alwaysShow: false,
            displayOrder: 2,
            formElement: {
                type: 'text',
            },
            label: 'Expiry date',
            mask: '{{99}}/{{9999}}',
            obfuscate: false,
            placeholderLabel: '',
            preferredInputType: 'StringKeyboard',
        },
        id: 'expiryDate',
        type: 'expirydate',
    },
    {
        dataRestrictions: {
            isRequired: true,
            validators: {
                length: {
                    maxLength: 3,
                    minLength: 3,
                },
                regularExpression: {
                    regularExpression: '^[0-9]*$',
                },
            },
        },
        displayHints: {
            alwaysShow: false,
            displayOrder: 3,
            formElement: {
                type: 'text',
            },
            label: 'Card verification code',
            mask: '{{999}}',
            obfuscate: false,
            placeholderLabel: '',
            preferredInputType: 'StringKeyboard',
            tooltip: {
                label: 'Last 3 digits on the back of the card',
            },
        },
        id: 'cvv',
        type: 'numericstring',
    },
    {
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
            obfuscate: false,
            placeholderLabel: '',
            preferredInputType: 'StringKeyboard',
        },
        id: 'cardNumber',
        type: 'numericstring',
    },
];

export const cardPaymentProductJson: PaymentProductDto = {
    allowsRecurring: true,
    allowsTokenization: true,
    displayHints: {
        displayOrder: 0,
        label: 'VISA',
        logo: 'https://assets.test.cdn.v-psp.com/s2s/7331a71bcf6fa3aed5a8/images/pm/VISA.gif',
    },
    fields: fields,
    id: 1,
    paymentMethod: 'card',
    paymentProductGroup: 'Cards',
    usesRedirectionTo3rdParty: false,
    allowsAuthentication: true,
};

export const unsupportedCardPaymentProductJson: PaymentProductDto = {
    allowsRecurring: true,
    allowsTokenization: false,
    displayHints: {
        displayOrder: 1,
        label: 'Maestro',
        logo: 'https://assets.test.cdn.v-psp.com/s2s/7331a71bcf6fa3aed5a8/images/pm/Maestro.gif',
    },
    fields: fields,
    id: 117,
    paymentMethod: 'card',
    paymentProductGroup: 'Cards',
    usesRedirectionTo3rdParty: false,
    allowsInstallments: false,
};
