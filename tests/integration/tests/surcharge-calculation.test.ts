import type { PartialCard } from '../../../src/types';

import { beforeAll, describe, expect, it } from 'vitest';

import { awaitTimes, createSdkClient, getApiClientSpyMock, getEnvVar, getSessionFromSdk } from '../utils';
import {
    withNoSurchargeCalculationResponse,
    withSurchargeCalculationResponse,
} from '../__fixtures__/surcharge-calculation';
import type { AmountOfMoney } from '../../../src';
import { init, OnlinePaymentSdk } from '../../../src';
import { getConfiguration } from '../setup';

// @todo: un-skip this test suite, once the merchant has been configured to support surcharge
describe.skip('session.getSurchargeCalculation', () => {
    let session: OnlinePaymentSdk;
    const partialCreditCardNumberWithSurcharge = getEnvVar(
        'VITE_PARTIAL_CREDIT_CARD_NUMBER_WITH_SURCHARGE_CURRENCY_CONVERSION',
    );
    const cardWithSurchargeToken = getEnvVar('VITE_CARD_TOKEN_WITH_SURCHARGE_CURRENCY_CONVERSION');
    const partialCreditCardNumberWithNoSurcharge = getEnvVar(
        'VITE_PARTIAL_CREDIT_CARD_NUMBER_WITHOUT_SURCHARGE_CURRENCY_CONVERSION',
    );
    const productIdWithSurcharge = getEnvVar('VITE_PRODUCT_ID_WITH_SURCHARGE_CURRENCY_CONVERSION');
    const productIdWithoutSurcharge = getEnvVar('VITE_PRODUCT_ID_WITHOUT_SURCHARGE_CURRENCY_CONVERSION');

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

    it('success with surcharge with provided card with payment product id', async () => {
        const partialCard: PartialCard = {
            partialCreditCardNumber: partialCreditCardNumberWithSurcharge,
            paymentProductId: parseInt(productIdWithSurcharge),
        };
        const result = await session.getSurchargeCalculation(amountOfMoney, partialCard);
        expect(result).toStrictEqual(withSurchargeCalculationResponse);
    });

    it('success with surcharge with provided card without payment product id', async () => {
        const partialCard: PartialCard = {
            partialCreditCardNumber: partialCreditCardNumberWithSurcharge,
        };
        const result = await session.getSurchargeCalculation(amountOfMoney, partialCard);
        expect(result).toStrictEqual(withSurchargeCalculationResponse);
    });

    it('success with surcharge with provided token', async () => {
        const result = await session.getSurchargeCalculation(amountOfMoney, cardWithSurchargeToken);
        expect(result).toStrictEqual(withSurchargeCalculationResponse);
    });

    it('success with no surcharge with provided card with payment product id', async () => {
        const partialCard: PartialCard = {
            partialCreditCardNumber: partialCreditCardNumberWithNoSurcharge,
            paymentProductId: parseInt(productIdWithoutSurcharge),
        };
        const result = await session.getSurchargeCalculation(amountOfMoney, partialCard);
        expect(result).toStrictEqual(withNoSurchargeCalculationResponse);
    });

    it('success with no surcharge with provided card without payment product id', async () => {
        const partialCard: PartialCard = {
            partialCreditCardNumber: partialCreditCardNumberWithNoSurcharge,
        };
        const result = await session.getSurchargeCalculation(amountOfMoney, partialCard);
        expect(result).toStrictEqual(withNoSurchargeCalculationResponse);
    });

    it('when called again, should result from cache instead network call', async () => {
        const amountOfMoneySpyTest: AmountOfMoney = {
            amount: 1100,
            currencyCode: 'EUR',
        };
        const spy = getApiClientSpyMock('post', { withSurchargeCalculationResponse });
        await awaitTimes(3, () => session.getSurchargeCalculation(amountOfMoneySpyTest, cardWithSurchargeToken));
        expect(spy).toHaveBeenCalledOnce();
        spy.mockRestore();
    });
});
