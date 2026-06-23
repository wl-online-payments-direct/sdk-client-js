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
import {
    withNoSurchargeCalculationResponse,
    withSurchargeCalculationResponse,
} from '../__fixtures__/surcharge-calculation';
import { getConfiguration } from '../setup';
import { init, OnlinePaymentSdk } from '../../../src';
import type { AmountOfMoney, PartialCard } from '../../../src';

// Un-skip this test suite once the test merchant has been configured to support surcharge.
describe.skip('GetSurchargeCalculation', () => {
    let session: OnlinePaymentSdk;

    const partialCreditCardNumberWithSurcharge = getEnvVar(
        'VITE_PARTIAL_CREDIT_CARD_NUMBER_WITH_SURCHARGE_CURRENCY_CONVERSION',
    );
    const partialCreditCardNumberWithNoSurcharge = getEnvVar(
        'VITE_PARTIAL_CREDIT_CARD_NUMBER_WITHOUT_SURCHARGE_CURRENCY_CONVERSION',
    );
    const cardWithSurchargeToken = getEnvVar('VITE_CARD_TOKEN_WITH_SURCHARGE_CURRENCY_CONVERSION');
    const productIdWithSurcharge = +getEnvVar('VITE_PRODUCT_ID_WITH_SURCHARGE_CURRENCY_CONVERSION');
    const productIdWithoutSurcharge = +getEnvVar('VITE_PRODUCT_ID_WITHOUT_SURCHARGE_CURRENCY_CONVERSION');

    const amountOfMoney: AmountOfMoney = {
        amount: 1000,
        currencyCode: 'EUR',
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

    it('GetSurchargeCalculation Returns surcharge result with card and payment product id', async () => {
        const partialCard: PartialCard = {
            partialCreditCardNumber: partialCreditCardNumberWithSurcharge,
            paymentProductId: productIdWithSurcharge,
        };

        const result = await session.getSurchargeCalculation(amountOfMoney, partialCard);

        expect(result).toStrictEqual(withSurchargeCalculationResponse);
    });

    it('GetSurchargeCalculation Returns surcharge result with card without payment product id', async () => {
        const partialCard: PartialCard = {
            partialCreditCardNumber: partialCreditCardNumberWithSurcharge,
        };

        const result = await session.getSurchargeCalculation(amountOfMoney, partialCard);

        expect(result).toStrictEqual(withSurchargeCalculationResponse);
    });

    it('GetSurchargeCalculation Returns surcharge result with token source', async () => {
        const result = await session.getSurchargeCalculation(amountOfMoney, cardWithSurchargeToken);

        expect(result).toStrictEqual(withSurchargeCalculationResponse);
    });

    it('GetSurchargeCalculation Returns no surcharge with card and payment product id', async () => {
        const partialCard: PartialCard = {
            partialCreditCardNumber: partialCreditCardNumberWithNoSurcharge,
            paymentProductId: productIdWithoutSurcharge,
        };

        const result = await session.getSurchargeCalculation(amountOfMoney, partialCard);

        expect(result).toStrictEqual(withNoSurchargeCalculationResponse);
    });

    it('GetSurchargeCalculation Returns no surcharge with card without payment product id', async () => {
        const partialCard: PartialCard = {
            partialCreditCardNumber: partialCreditCardNumberWithNoSurcharge,
        };

        const result = await session.getSurchargeCalculation(amountOfMoney, partialCard);

        expect(result).toStrictEqual(withNoSurchargeCalculationResponse);
    });

    it('GetSurchargeCalculation returns cached result for repeated request', async () => {
        const amountOfMoneyForCacheTest: AmountOfMoney = {
            amount: 1100,
            currencyCode: 'EUR',
        };

        const spy = getApiClientSpyMock('post', withSurchargeCalculationResponse);

        await awaitTimes(3, () => session.getSurchargeCalculation(amountOfMoneyForCacheTest, cardWithSurchargeToken));

        expect(spy).toHaveBeenCalledOnce();

        spy.mockRestore();
    });
});
