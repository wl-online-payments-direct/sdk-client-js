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

import { beforeAll, describe, expect, it } from 'vitest';

import { awaitTimes, createSdkClient, getApiClientSpyMock, getEnvVar, getSessionFromSdk } from '../utils';
import { withCurrencyConversion, withNoCurrencyConversionErrorResponseJson } from '../__fixtures__/currency-conversion';
import { getConfiguration } from '../setup';
import { init, OnlinePaymentSdk } from '../../../src';
import type { AmountOfMoney, PartialCard } from '../../../src';

// Un-skip this test suite once the test merchant has been configured to support currency conversion.
describe.skip('GetCurrencyConversionQuote', () => {
    let session: OnlinePaymentSdk;

    const partialCreditCardNumberWithCurrencyConversion = getEnvVar(
        'VITE_PARTIAL_CREDIT_CARD_NUMBER_WITH_SURCHARGE_CURRENCY_CONVERSION',
    );
    const partialCreditCardNumberWithNoCurrencyConversion = getEnvVar(
        'VITE_PARTIAL_CREDIT_CARD_NUMBER_WITHOUT_SURCHARGE_CURRENCY_CONVERSION',
    );
    const cardWithCurrencyConversionToken = getEnvVar('VITE_CARD_TOKEN_WITH_SURCHARGE_CURRENCY_CONVERSION');
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

    it('GetCurrencyConversionQuote Returns proposal with card and payment product id', async () => {
        const partialCard: PartialCard = {
            partialCreditCardNumber: partialCreditCardNumberWithCurrencyConversion,
            paymentProductId: productIdWithCurrencyConversion,
        };

        const result = await session.getCurrencyConversionQuote(amountOfMoney, partialCard);

        expect(result.proposal?.baseAmount).toStrictEqual(withCurrencyConversion.proposal.baseAmount);
    });

    it('GetCurrencyConversionQuote Returns proposal with card without payment product id', async () => {
        const partialCard: PartialCard = {
            partialCreditCardNumber: partialCreditCardNumberWithCurrencyConversion,
        };

        const result = await session.getCurrencyConversionQuote(amountOfMoney, partialCard);

        expect(result.proposal?.baseAmount).toStrictEqual(withCurrencyConversion.proposal.baseAmount);
    });

    it('GetCurrencyConversionQuote Returns proposal with token source', async () => {
        const result = await session.getCurrencyConversionQuote(amountOfMoney, cardWithCurrencyConversionToken);

        expect(result.proposal?.baseAmount).toStrictEqual(withCurrencyConversion.proposal.baseAmount);
    });

    it('GetCurrencyConversionQuote Throws error with card and payment product id', async () => {
        const partialCard: PartialCard = {
            partialCreditCardNumber: partialCreditCardNumberWithNoCurrencyConversion,
            paymentProductId: productIdWithoutCurrencyConversion,
        };

        await expectCurrencyConversionNotFound(partialCard);
    });

    it('GetCurrencyConversionQuote Throws error with card without payment product id', async () => {
        const partialCard: PartialCard = {
            partialCreditCardNumber: partialCreditCardNumberWithNoCurrencyConversion,
        };

        await expectCurrencyConversionNotFound(partialCard);
    });

    it('GetCurrencyConversionQuote Throws error with token source', async () => {
        const cardWithoutCurrencyConversionToken = getEnvVar('VITE_CARD_TOKEN_WITHOUT_SURCHARGE_CURRENCY_CONVERSION');

        await expectCurrencyConversionNotFound(cardWithoutCurrencyConversionToken);
    });

    it('GetCurrencyConversionQuote returns cached result for repeated request', async () => {
        const amountOfMoneyForCacheTest: AmountOfMoney = {
            amount: 1100,
            currencyCode: 'EUR',
        };

        const spy = getApiClientSpyMock('post', withCurrencyConversion);

        await awaitTimes(3, () =>
            session.getCurrencyConversionQuote(amountOfMoneyForCacheTest, cardWithCurrencyConversionToken),
        );

        expect(spy).toHaveBeenCalledOnce();

        spy.mockRestore();
    });

    const expectCurrencyConversionNotFound = async (cardOrToken: PartialCard | string) => {
        const expectedErrorResponse = withNoCurrencyConversionErrorResponseJson.errors[0];

        await expect(() => session.getCurrencyConversionQuote(amountOfMoney, cardOrToken)).rejects.toThrow(
            expect.objectContaining({
                errors: [
                    expect.objectContaining({
                        id: expectedErrorResponse.id,
                        httpStatusCode: expectedErrorResponse.httpStatusCode,
                    }),
                ],
            }),
        );
    };
});
