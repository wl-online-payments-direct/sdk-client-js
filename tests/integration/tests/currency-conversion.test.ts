/*
 * Do not remove or alter the notices in this preamble.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import { beforeAll, describe, expect, it } from 'vitest';

import { awaitTimes, createSdkClient, getApiClientSpyMock, getEnvVar, getSessionFromSdk } from '../utils';
import { withCurrencyConversion, withNoCurrencyConversionErrorResponseJson } from '../__fixtures__/currency-conversion';
import { OnlinePaymentSdk } from '../../../src/facade/OnlinePaymentSdk';
import type { AmountOfMoney, PartialCard } from '../../../src';
import { init } from '../../../src';
import { getConfiguration } from '../setup';

//  Un-skip this test suite if test merchant has been configured to support surcharge.
describe.skip('session.getCurrencyConversionQuote', () => {
    let session: OnlinePaymentSdk;

    const partialCreditCardNumberWithCurrencyConversion = getEnvVar(
        'VITE_PARTIAL_CREDIT_CARD_NUMBER_WITH_SURCHARGE_CURRENCY_CONVERSION',
    );
    const cardWithCurrencyConversionToken = getEnvVar('VITE_CARD_TOKEN_WITH_SURCHARGE_CURRENCY_CONVERSION');
    const partialCreditCardNumberWithNoCurrencyConversion = getEnvVar(
        'VITE_PARTIAL_CREDIT_CARD_NUMBER_WITHOUT_SURCHARGE_CURRENCY_CONVERSION',
    );
    const productIdWithCurrencyConversion = +getEnvVar('VITE_PRODUCT_ID_WITH_SURCHARGE_CURRENCY_CONVERSION');
    const productIdWithoutCurrencyConversion = +getEnvVar('VITE_PRODUCT_ID_WITHOUT_SURCHARGE_CURRENCY_CONVERSION');

    const amountOfMoney: AmountOfMoney = {
        amount: 1000,
        currencyCode: 'AUD',
    };

    beforeAll(async () => {
        const client = createSdkClient({
            apiKeyId: getEnvVar('VITE_MERCHANT_KEY_SURCHARGE_CURRENCY_CONVERSION'),
            secretApiKey: getEnvVar('VITE_MERCHANT_SECRET_KEY_SURCHARGE_CURRENCY_CONVERSION'),
        });

        const sessionDetails = await getSessionFromSdk({
            client,
            merchantId: getEnvVar('VITE_MERCHANT_SURCHARGE_CURRENCY_CONVERSION'),
        });

        session = init(sessionDetails, getConfiguration());
    });

    it('success with currency conversion with provided card with payment product id', async () => {
        const partialCard: PartialCard = {
            partialCreditCardNumber: partialCreditCardNumberWithCurrencyConversion,
            paymentProductId: productIdWithCurrencyConversion,
        };
        const result = await session.getCurrencyConversionQuote(amountOfMoney, partialCard);

        // Values of the CurrencyConversionResponse are different daily (exchange rate, quotation date time,
        // etc.). Only the baseAmount can be verified, since that is provided as input.
        expect(result.proposal?.baseAmount).toStrictEqual(withCurrencyConversion.proposal.baseAmount);
    });

    it('success with currency conversion with provided card without payment product id', async () => {
        const partialCard: PartialCard = {
            partialCreditCardNumber: partialCreditCardNumberWithCurrencyConversion,
        };
        const result = await session.getCurrencyConversionQuote(amountOfMoney, partialCard);

        // Values of the CurrencyConversionResponse are different on a daily basis (exchange rate, quotation date time,
        // etc.). Only the baseAmount can be verified, since that is provided as input.
        expect(result.proposal?.baseAmount).toStrictEqual(withCurrencyConversion.proposal.baseAmount);
    });

    it('success with currency conversion with provided token', async () => {
        const result = await session.getCurrencyConversionQuote(amountOfMoney, cardWithCurrencyConversionToken);

        // Values of the CurrencyConversionResponse are different on a daily basis (exchange rate, quotation date time,
        // etc.). Only the baseAmount can be verified, since that is provided as input.
        expect(result.proposal?.baseAmount).toStrictEqual(withCurrencyConversion.proposal.baseAmount);
    });

    it('error thrown with provided card with no currency conversion with payment product id', async () => {
        const partialCard: PartialCard = {
            partialCreditCardNumber: partialCreditCardNumberWithNoCurrencyConversion,
            paymentProductId: productIdWithoutCurrencyConversion,
        };
        const expectedErrorResponse = withNoCurrencyConversionErrorResponseJson.errors[0];

        await expect(() => session.getCurrencyConversionQuote(amountOfMoney, partialCard)).rejects.toThrow(
            expect.objectContaining({
                errors: [
                    expect.objectContaining({
                        id: expectedErrorResponse.id,
                        httpStatusCode: expectedErrorResponse.httpStatusCode,
                    }),
                ],
            }),
        );
    });

    it('error thrown with provided card with no currency conversion without payment product id', async () => {
        const partialCard: PartialCard = {
            partialCreditCardNumber: partialCreditCardNumberWithNoCurrencyConversion,
        };
        const expectedErrorResponse = withNoCurrencyConversionErrorResponseJson.errors[0];

        await expect(() => session.getCurrencyConversionQuote(amountOfMoney, partialCard)).rejects.toThrow(
            expect.objectContaining({
                errors: [
                    expect.objectContaining({
                        id: expectedErrorResponse.id,
                        httpStatusCode: expectedErrorResponse.httpStatusCode,
                    }),
                ],
            }),
        );
    });

    it('when called again, should result from cache instead network call', async () => {
        const amountOfMoneySpyTest: AmountOfMoney = {
            amount: 1100,
            currencyCode: 'EUR',
        };
        const spy = getApiClientSpyMock('post', { withCurrencyConversion });
        await awaitTimes(3, () =>
            session.getCurrencyConversionQuote(amountOfMoneySpyTest, cardWithCurrencyConversionToken),
        );
        expect(spy).toHaveBeenCalledOnce();
        spy.mockRestore();
    });
});
