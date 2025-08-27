import type { PaymentProductJSON } from '../../types';

export const cardPaymentProductJson: PaymentProductJSON = {
    displayHints: {
        displayOrder: 0,
        label: 'VISA',
        logo: 'https://assets.test.cdn.v-psp.com/s2s/cf426b0b425fa88a79fd/images/pm/VISA.gif',
    },
    displayHintsList: [
        {
            displayOrder: 0,
            label: 'VISA',
            logo: 'https://assets.test.cdn.v-psp.com/s2s/cf426b0b425fa88a79fd/images/pm/VISA.gif',
        },
    ],
    fields: [
        {
            dataRestrictions: {
                isRequired: true,
                validators: {
                    length: { maxLength: 19, minLength: 13 },
                    luhn: {},
                    regularExpression: { regularExpression: '^[0-9]*$' },
                },
            },
            displayHints: {
                alwaysShow: false,
                displayOrder: 0,
                formElement: { type: 'text' },
                label: 'Card number',
                mask: '{{9999}} {{9999}} {{9999}} {{9999}} {{999}}',
                obfuscate: false,
                placeholderLabel: '',
                preferredInputType: 'StringKeyboard',
            },
            id: 'cardNumber',
            type: 'tel',
            validators: ['length', 'luhn', 'regularExpression'],
        },
        {
            dataRestrictions: {
                isRequired: true,
                validators: {
                    length: { maxLength: 50, minLength: 2 },
                    regularExpression: {
                        regularExpression:
                            "^[a-zA-ZàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßẞŠšŽžŸÿčČďĎěĚľĽĺĹňŇřŘšťŠŤůŮžŽęĘłŁśŚźŹżŻąĄčČęĘėĖįĮšŠųŲūŪžŽäÄöÖõÕüÜāĀčČēĒģĢīĪķĶļĻņŅōŌŗŖšŠūŪžŽ0-9 +_.=,:\\-\\[\\]\\/\\(\\)']*$",
                    },
                },
            },
            displayHints: {
                alwaysShow: false,
                displayOrder: 1,
                formElement: { type: 'text' },
                label: "Cardholder's name",
                obfuscate: false,
                placeholderLabel: '',
                preferredInputType: 'StringKeyboard',
            },
            id: 'cardholderName',
            type: 'text',
            validators: ['length', 'regularExpression'],
        },
        {
            dataRestrictions: {
                isRequired: true,
                validators: {
                    expirationDate: {},
                    regularExpression: { regularExpression: '^(0[1-9]|1[0-2])(\\d{2})$' },
                },
            },
            displayHints: {
                alwaysShow: false,
                displayOrder: 2,
                formElement: { type: 'text' },
                label: 'Expiry date',
                mask: '{{99}}/{{9999}}',
                obfuscate: false,
                placeholderLabel: '',
                preferredInputType: 'StringKeyboard',
            },
            id: 'expiryDate',
            type: 'tel',
            validators: ['expirationDate', 'regularExpression'],
        },
        {
            dataRestrictions: {
                isRequired: true,
                validators: {
                    length: { maxLength: 3, minLength: 3 },
                    regularExpression: { regularExpression: '^[0-9]*$' },
                },
            },
            displayHints: {
                alwaysShow: false,
                displayOrder: 3,
                formElement: { type: 'text' },
                label: 'Card verification code',
                mask: '{{9999}}',
                obfuscate: false,
                placeholderLabel: '',
                preferredInputType: 'StringKeyboard',
            },
            id: 'cvv',
            type: 'tel',
            validators: ['length', 'regularExpression'],
        },
    ],
    id: 1,
    paymentMethod: 'card',
    paymentProductGroup: 'Cards',
    usesRedirectionTo3rdParty: false,
    type: 'product',
    allowsInstallments: false,
    allowsRecurring: false,
    allowsTokenization: true,
    autoTokenized: false,
    deviceFingerprintEnabled: false,
    mobileIntegrationLevel: '',
};
