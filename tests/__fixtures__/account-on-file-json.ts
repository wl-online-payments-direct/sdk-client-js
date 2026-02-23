/*
 * Do not remove or alter the notices in this preamble.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import type { AccountOnFileDto } from '../../src/infrastructure/apiModels/accountOnFile/AccountOnFileDto';
import { AccountOnFileAttributeStatus } from '../../src';
import type { PaymentProductDto } from '../../src/infrastructure/apiModels/paymentProduct/PaymentProductDto';

export const accountOnFileJson: AccountOnFileDto = {
    attributes: [
        {
            key: 'alias',
            status: AccountOnFileAttributeStatus.READ_ONLY,
            value: '411111XXXXXX1111',
        },
        {
            key: 'cardNumber',
            status: AccountOnFileAttributeStatus.READ_ONLY,
            value: '9999-9999-9999-9999',
        },
        {
            key: 'cvv',
            status: AccountOnFileAttributeStatus.MUST_WRITE,
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

export const accountOnFileJson2: AccountOnFileDto = {
    attributes: [
        {
            key: 'alias',
            status: AccountOnFileAttributeStatus.READ_ONLY,
            value: 'test label',
        },
        {
            key: 'cardNumber',
            status: AccountOnFileAttributeStatus.CAN_WRITE,
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

export const accountOnFileWithMustWriteCvvJson: AccountOnFileDto = {
    attributes: [
        {
            key: 'cardNumber',
            value: '************7977',
            status: AccountOnFileAttributeStatus.READ_ONLY,
        },
        {
            key: 'cardholderName',
            value: 'Darwin Núñez',
            status: AccountOnFileAttributeStatus.CAN_WRITE,
        },
        {
            key: 'expiryDate',
            value: '1230',
            status: AccountOnFileAttributeStatus.CAN_WRITE,
        },
        {
            key: 'cvv',
            value: '',
            status: AccountOnFileAttributeStatus.MUST_WRITE,
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

export const accountOnFileWithCardHolderNameCanWriteJson: AccountOnFileDto = {
    attributes: [
        {
            key: 'cardholderName',
            value: 'test',
            status: AccountOnFileAttributeStatus.CAN_WRITE,
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

export const cardPaymentProductJson: PaymentProductDto = {
    allowsRecurring: true,
    allowsTokenization: true,
    displayHints: {
        displayOrder: 0,
        label: 'VISA',
        logo: 'https://assets.test.cdn.v-psp.com/s2s/7331a71bcf6fa3aed5a8/images/pm/VISA.gif',
    },
    fields: [
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
        {
            dataRestrictions: {
                isRequired: true,
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
    ],
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
        displayOrder: 0,
        label: 'Maestro',
        logo: 'https://assets.test.cdn.v-psp.com/s2s/7331a71bcf6fa3aed5a8/images/pm/Maestro.gif',
    },
    fields: [
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
        {
            dataRestrictions: {
                isRequired: true,
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
            type: 'numericstring',
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
            type: 'numericstring',
        },
    ],
    id: 117,
    paymentMethod: 'card',
    paymentProductGroup: 'Cards',
    usesRedirectionTo3rdParty: false,
    allowsInstallments: false,
};

export const noRequiredFieldsJson: PaymentProductDto = {
    allowsRecurring: true,
    allowsTokenization: true,
    displayHints: {
        displayOrder: 0,
        label: 'VISA',
        logo: 'https://assets.test.cdn.v-psp.com/s2s/7331a71bcf6fa3aed5a8/images/pm/VISA.gif',
    },
    fields: [
        {
            dataRestrictions: {
                isRequired: false,
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
        {
            dataRestrictions: {
                isRequired: true,
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
                isRequired: false,
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
                isRequired: false,
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
    ],
    id: 1,
    paymentMethod: 'card',
    paymentProductGroup: 'Cards',
    usesRedirectionTo3rdParty: false,
    allowsAuthentication: true,
};

export const requiredFieldJson: PaymentProductDto = {
    allowsRecurring: true,
    allowsTokenization: true,
    displayHints: {
        displayOrder: 0,
        label: 'VISA',
        logo: 'https://assets.test.cdn.v-psp.com/s2s/7331a71bcf6fa3aed5a8/images/pm/VISA.gif',
    },
    fields: [
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
    ],
    id: 1,
    paymentMethod: 'card',
    paymentProductGroup: 'Cards',
    usesRedirectionTo3rdParty: false,
    allowsAuthentication: true,
};

export const baseAccountOnFileJson: AccountOnFileDto = {
    attributes: [],
    displayHints: { logo: '', labelTemplate: [] },
    id: '0',
    paymentProductId: 0,
};
