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

import { describe, expect, it } from 'vitest';
import { buildNetceteraConfig } from '../../../../src/infrastructure/clickToPay/NetceteraConfigBuilder';
import { ConfigurationError, type PaymentContextWithAmount, PaymentProduct5002SpecificData } from '../../../../src';

const context: PaymentContextWithAmount = {
    countryCode: 'NL',
    amountOfMoney: { amount: 1000, currencyCode: 'EUR' },
};

const mastercardData = {
    srcInitiatorId: 'mc-init-id',
    srciDpaId: 'mc-dpa-id',
};

const mastercardDataWithAuth = {
    ...mastercardData,
    authenticationOptions: {
        acquirerMerchantId: 'merch-id',
        acquirerBIN: '12345',
        merchantCategoryCode: '5411',
        merchantCountryCode: 'NL',
    },
};

const visaData = {
    srcInitiatorId: 'visa-init-id',
    srciDpaId: 'visa-dpa-id',
    encryptionKey: 'visa-enc-key',
    nModulus: 'visa-modulus',
};

const visaDataWithAuth = {
    ...visaData,
    authenticationOptions: {
        acquirerMerchantId: 'visa-merch-id',
        acquirerBIN: '67890',
        merchantName: 'Test Merchant',
    },
};

const visaConfig = {
    authenticationOptions: {
        payloadRequested: 'AUTHENTICATED' as const,
        challengeIndicator: '02' as const,
    },
};

const mastercardDpaData = {
    dpaName: 'Test Merchant Ltd',
    dpaPresentationName: 'Test Merchant',
    dpaUri: 'https://merchant.example',
};

const visaDpaData = {
    dpaPresentationName: 'Test Merchant',
    dpaUri: 'https://merchant.example',
};

describe('buildNetceteraConfig — Mastercard', () => {
    it('builds mastercard config from specificData credentials', () => {
        const specificData = new PaymentProduct5002SpecificData({ mastercard: mastercardData });

        const config = buildNetceteraConfig(specificData, context, { locale: 'nl_NL', mastercard: {} });

        expect(config.mastercard?.srcInitiatorId).toBe('mc-init-id');
        expect(config.mastercard?.srciDpaId).toBe('mc-dpa-id');
    });

    it('converts the minor-unit amount to a major-unit number for Mastercard', () => {
        const specificData = new PaymentProduct5002SpecificData({ mastercard: mastercardData });

        const config = buildNetceteraConfig(specificData, context, { locale: 'nl_NL', mastercard: {} });

        // EUR has 2 fraction digits, so 1000 minor units becomes 10.00 — and Mastercard's contract
        // types the amount as a number.
        expect(config.mastercard?.dpaTransactionOptions.transactionAmount).toEqual({
            transactionAmount: 10,
            transactionCurrencyCode: 'EUR',
        });
    });

    it('preserves fractional major units for Mastercard', () => {
        const specificData = new PaymentProduct5002SpecificData({ mastercard: mastercardData });
        const contextWithDecimal: PaymentContextWithAmount = {
            countryCode: 'NL',
            amountOfMoney: { amount: 2550, currencyCode: 'USD' },
        };

        const config = buildNetceteraConfig(specificData, contextWithDecimal, { locale: 'nl_NL', mastercard: {} });

        expect(config.mastercard?.dpaTransactionOptions.transactionAmount?.transactionAmount).toBe(25.5);
    });

    it('sets dpaLocale from config.locale', () => {
        const specificData = new PaymentProduct5002SpecificData({ mastercard: mastercardData });

        const config = buildNetceteraConfig(specificData, context, { locale: 'nl_NL', mastercard: {} });

        expect(config.mastercard?.dpaTransactionOptions.dpaLocale).toBe('nl_NL');
    });

    it('omits mastercard when config.locale is not provided', () => {
        const specificData = new PaymentProduct5002SpecificData({ mastercard: mastercardData, visa: visaData });

        const config = buildNetceteraConfig(specificData, context, { mastercard: {}, visa: {} });

        expect(config.mastercard).toBeUndefined();
        expect(config.visa?.srcInitiatorId).toBe('visa-init-id');
    });

    it('omits mastercard when config.mastercard is not provided', () => {
        const specificData = new PaymentProduct5002SpecificData({ mastercard: mastercardData, visa: visaData });

        const config = buildNetceteraConfig(specificData, context, { locale: 'nl_NL', visa: {} });

        expect(config.mastercard).toBeUndefined();
        expect(config.visa?.srcInitiatorId).toBe('visa-init-id');
    });

    it('sets recognitionToken from config.mastercard.recognitionToken', () => {
        const specificData = new PaymentProduct5002SpecificData({ mastercard: mastercardData });

        const config = buildNetceteraConfig(specificData, context, {
            locale: 'nl_NL',
            mastercard: { recognitionToken: 'token-abc' },
        });

        expect(config.mastercard?.recognitionToken).toBe('token-abc');
    });

    it('omits recognitionToken when config.mastercard does not provide one', () => {
        const specificData = new PaymentProduct5002SpecificData({ mastercard: mastercardData });

        const config = buildNetceteraConfig(specificData, context, { locale: 'nl_NL', mastercard: {} });

        expect(config.mastercard).not.toHaveProperty('recognitionToken');
    });

    it('sets dpaData from config.mastercard.dpaData', () => {
        const specificData = new PaymentProduct5002SpecificData({ mastercard: mastercardData });

        const config = buildNetceteraConfig(specificData, context, {
            locale: 'nl_NL',
            mastercard: { dpaData: mastercardDpaData },
        });

        expect(config.mastercard?.dpaData).toEqual(mastercardDpaData);
    });

    it('omits dpaData when config.mastercard does not provide it', () => {
        const specificData = new PaymentProduct5002SpecificData({ mastercard: mastercardData });

        const config = buildNetceteraConfig(specificData, context, { locale: 'nl_NL', mastercard: {} });

        expect(config.mastercard).not.toHaveProperty('dpaData');
    });

    it('includes authenticationOptions when present in specificData', () => {
        const specificData = new PaymentProduct5002SpecificData({ mastercard: mastercardDataWithAuth });

        const config = buildNetceteraConfig(specificData, context, { locale: 'nl_NL', mastercard: {} });

        expect(config.mastercard?.authenticationOptions).toEqual({
            acquirerMerchantId: 'merch-id',
            acquirerBIN: '12345',
            merchantCategoryCode: '5411',
            merchantCountryCode: 'NL',
        });
    });

    it('omits authenticationOptions when absent in specificData', () => {
        const specificData = new PaymentProduct5002SpecificData({ mastercard: mastercardData });

        const config = buildNetceteraConfig(specificData, context, { locale: 'nl_NL', mastercard: {} });

        expect(config.mastercard?.authenticationOptions).toBeUndefined();
    });

    it('omits visa when only mastercard data is present', () => {
        const specificData = new PaymentProduct5002SpecificData({ mastercard: mastercardData });

        const config = buildNetceteraConfig(specificData, context, { locale: 'nl_NL', mastercard: {} });

        expect(config.visa).toBeUndefined();
    });
});

describe('buildNetceteraConfig — Visa', () => {
    it('builds visa config from specificData credentials', () => {
        const specificData = new PaymentProduct5002SpecificData({ visa: visaData });

        const config = buildNetceteraConfig(specificData, context, { visa: {} });

        expect(config.visa?.srcInitiatorId).toBe('visa-init-id');
        expect(config.visa?.srciDpaId).toBe('visa-dpa-id');
        expect(config.visa?.encryptionKey).toBe('visa-enc-key');
        expect(config.visa?.nModulus).toBe('visa-modulus');
    });

    it('combines acquirer data from specificData with 3DS preferences from config.visa', () => {
        const specificData = new PaymentProduct5002SpecificData({ visa: visaDataWithAuth });

        const config = buildNetceteraConfig(specificData, context, { visa: visaConfig });

        expect(config.visa?.authenticationOptions).toEqual({
            payloadRequested: 'AUTHENTICATED',
            acquirerMerchantId: 'visa-merch-id',
            acquirerBIN: '67890',
            merchantName: 'Test Merchant',
            challengeIndicator: '02',
        });
    });

    it('omits authenticationOptions when absent in specificData', () => {
        const specificData = new PaymentProduct5002SpecificData({ visa: visaData });

        const config = buildNetceteraConfig(specificData, context, { visa: visaConfig });

        expect(config.visa?.authenticationOptions).toBeUndefined();
    });

    it('omits authenticationOptions when config.visa.authenticationOptions is not provided', () => {
        const specificData = new PaymentProduct5002SpecificData({ visa: visaDataWithAuth });

        const config = buildNetceteraConfig(specificData, context, { visa: {} });

        expect(config.visa?.authenticationOptions).toBeUndefined();
        expect(config.visa?.srcInitiatorId).toBe('visa-init-id');
    });

    it('omits visa when config.visa is not provided', () => {
        const specificData = new PaymentProduct5002SpecificData({ visa: visaDataWithAuth, mastercard: mastercardData });

        const config = buildNetceteraConfig(specificData, context, { locale: 'nl_NL', mastercard: {} });

        expect(config.visa).toBeUndefined();
        expect(config.mastercard?.srcInitiatorId).toBe('mc-init-id');
    });

    it('omits mastercard when only visa data is present', () => {
        const specificData = new PaymentProduct5002SpecificData({ visa: visaData });

        const config = buildNetceteraConfig(specificData, context, { visa: {} });

        expect(config.mastercard).toBeUndefined();
    });

    it('sets transactionAmount as a major-unit decimal string for Visa', () => {
        const specificData = new PaymentProduct5002SpecificData({ visa: visaData });

        const config = buildNetceteraConfig(specificData, context, { locale: 'nl_NL', visa: {} });

        // Unlike Mastercard (number), Visa's field is a string kept verbatim, so it retains the
        // currency's precision.
        expect(config.visa?.dpaTransactionOptions?.transactionAmount).toEqual({
            transactionAmount: '10.00',
            transactionCurrencyCode: 'EUR',
        });
    });

    it('defaults visa dpaLocale from config.locale', () => {
        const specificData = new PaymentProduct5002SpecificData({ visa: visaData });

        const config = buildNetceteraConfig(specificData, context, { locale: 'nl_NL', visa: {} });

        expect(config.visa?.dpaTransactionOptions?.dpaLocale).toBe('nl_NL');
    });

    it('omits visa dpaTransactionOptions.dpaLocale when config.locale is not set', () => {
        const specificData = new PaymentProduct5002SpecificData({ visa: visaData });

        const config = buildNetceteraConfig(specificData, context, { visa: {} });

        expect(config.visa?.dpaTransactionOptions).not.toHaveProperty('dpaLocale');
    });

    it('sets dpaData from config.visa.dpaData', () => {
        const specificData = new PaymentProduct5002SpecificData({ visa: visaData });

        const config = buildNetceteraConfig(specificData, context, { visa: { dpaData: visaDpaData } });

        expect(config.visa?.dpaData).toEqual(visaDpaData);
    });

    it('omits dpaData when config.visa does not provide it', () => {
        const specificData = new PaymentProduct5002SpecificData({ visa: visaData });

        const config = buildNetceteraConfig(specificData, context, { visa: {} });

        expect(config.visa).not.toHaveProperty('dpaData');
    });
});

describe('buildNetceteraConfig — both schemes', () => {
    it('builds mastercard and visa configs independently', () => {
        const specificData = new PaymentProduct5002SpecificData({
            mastercard: mastercardDataWithAuth,
            visa: visaDataWithAuth,
        });

        const config = buildNetceteraConfig(specificData, context, {
            locale: 'en_US',
            mastercard: {},
            visa: visaConfig,
        });

        expect(config).toStrictEqual({
            mastercard: {
                srcInitiatorId: 'mc-init-id',
                srciDpaId: 'mc-dpa-id',
                authenticationOptions: {
                    acquirerMerchantId: 'merch-id',
                    acquirerBIN: '12345',
                    merchantCategoryCode: '5411',
                    merchantCountryCode: 'NL',
                },
                dpaTransactionOptions: {
                    dpaLocale: 'en_US',
                    transactionAmount: { transactionAmount: 10, transactionCurrencyCode: 'EUR' },
                },
            },
            visa: {
                srcInitiatorId: 'visa-init-id',
                srciDpaId: 'visa-dpa-id',
                encryptionKey: 'visa-enc-key',
                nModulus: 'visa-modulus',
                authenticationOptions: {
                    payloadRequested: 'AUTHENTICATED',
                    acquirerMerchantId: 'visa-merch-id',
                    acquirerBIN: '67890',
                    merchantName: 'Test Merchant',
                    challengeIndicator: '02',
                },
                dpaTransactionOptions: {
                    dpaLocale: 'en_US',
                    transactionAmount: { transactionAmount: '10.00', transactionCurrencyCode: 'EUR' },
                },
            },
        });
    });
});

describe('buildNetceteraConfig — empty specificData', () => {
    it('returns empty config when no schemes are present', () => {
        const specificData = new PaymentProduct5002SpecificData();

        const config = buildNetceteraConfig(specificData, context, {});

        expect(config).toEqual({});
    });
});

describe('buildNetceteraConfig — no scheme configured', () => {
    it('throws a merchant-safe ConfigurationError when no available scheme is configured', () => {
        const specificData = new PaymentProduct5002SpecificData({ mastercard: mastercardData, visa: visaData });
        const call = () => buildNetceteraConfig(specificData, context, { locale: 'nl_NL' });

        expect(call).toThrow(ConfigurationError);
        expect(call).toThrow(
            'No Click to Pay scheme is configured. Schemes available for this session: mastercard, visa. Provide the configuration required by at least one of them.',
        );
    });

    it('does not throw when at least one available scheme is configured', () => {
        const specificData = new PaymentProduct5002SpecificData({ mastercard: mastercardData, visa: visaData });

        const config = buildNetceteraConfig(specificData, context, { locale: 'nl_NL', visa: {} });

        expect(config.mastercard).toBeUndefined();
        expect(config.visa?.srcInitiatorId).toBe('visa-init-id');
    });
});

describe('buildNetceteraConfig — locale validation', () => {
    it('throws a ConfigurationError naming the unsupported locale', () => {
        const specificData = new PaymentProduct5002SpecificData({ mastercard: mastercardData });

        expect(() => buildNetceteraConfig(specificData, context, { locale: 'aa_BB' })).toThrow(ConfigurationError);
        expect(() => buildNetceteraConfig(specificData, context, { locale: 'aa_BB' })).toThrow(
            'Unsupported Click to Pay locale "aa_BB".',
        );
    });

    it('rejects a supported language with the wrong casing', () => {
        const specificData = new PaymentProduct5002SpecificData({ mastercard: mastercardData });
        const call = () => buildNetceteraConfig(specificData, context, { locale: 'en_gb' });

        expect(call).toThrow(ConfigurationError);
        expect(call).toThrow('Unsupported Click to Pay locale "en_gb".');
    });

    it('rejects an unsupported locale even when no scheme requires it', () => {
        const specificData = new PaymentProduct5002SpecificData();
        const call = () => buildNetceteraConfig(specificData, context, { locale: 'aa_BB' });

        expect(call).toThrow(ConfigurationError);
        expect(call).toThrow('Unsupported Click to Pay locale "aa_BB".');
    });

    it('accepts a supported locale', () => {
        const specificData = new PaymentProduct5002SpecificData({ mastercard: mastercardData });

        expect(
            buildNetceteraConfig(specificData, context, { locale: 'sr_RS', mastercard: {} }).mastercard
                ?.dpaTransactionOptions.dpaLocale,
        ).toBe('sr_RS');
    });

    it('does not reject a config without a locale', () => {
        const specificData = new PaymentProduct5002SpecificData({ visa: visaData });

        const config = buildNetceteraConfig(specificData, context, { visa: {} });

        expect(config.visa?.dpaTransactionOptions?.dpaLocale).toBeUndefined();
    });
});
