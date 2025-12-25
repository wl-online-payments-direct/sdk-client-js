import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type {
    CurrencyConversionRequest,
    CurrencyConversionResponse,
    GetIINDetailsResponseJson,
    PartialCard,
    SdkResponse,
    SurchargeCalculationResponse,
    SurchargeRequestJson,
} from '../../../src/types';
import { IinDetailsStatus } from '../../../src/types';
import type { ClientService } from '../../../src/services/interfaces/ClientService';
import type { AmountOfMoney, PaymentContextWithAmount } from '../../../src';
import { IinDetailsResponse } from '../../../src/dataModel';
import { DefaultClientService } from '../../../src/services/DefaultClientService';
import { CacheManager } from '../../../src/infrastructure/utils/CacheManager';
import { TestApiClient } from '../testUtils/TestApiClient';

let service: ClientService;
let amount: AmountOfMoney;
let partialCard: PartialCard;
let currencyConversionResponse: CurrencyConversionResponse;

beforeEach(() => {
    service = new DefaultClientService(new CacheManager(), new TestApiClient());

    amount = {
        amount: 1000,
        currencyCode: 'EUR',
    };

    partialCard = {
        partialCreditCardNumber: '123456789',
        paymentProductId: 1,
    };

    currencyConversionResponse = {
        docSessionId: '1',
        result: { resultReason: 'test reason', result: 'Allowed' },
        proposal: {
            baseAmount: {
                amount: 1000,
                currencyCode: 'EUR',
            },
            targetAmount: {
                amount: 1200,
                currencyCode: 'EUR',
            },
            rate: {
                exchangeRate: 1,
                invertedExchangeRate: 1,
                markUpRate: 1,
                quotationDateTime: 'test',
                source: 'test source',
            },
        },
    };
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe('getIinDetails', () => {
    let json: GetIINDetailsResponseJson;
    let paymentContextWithAmount: PaymentContextWithAmount;
    beforeEach(() => {
        json = {
            countryCode: 'NL',
            paymentProductId: 1,
        };

        paymentContextWithAmount = {
            countryCode: 'NL',
            amountOfMoney: {
                currencyCode: 'EUR',
                amount: 1000,
            },
        };
    });

    it('should return iinDetails response from cache', async () => {
        const iinDetails = new IinDetailsResponse(IinDetailsStatus.SUPPORTED, json);

        const apiSpy = vi.spyOn(TestApiClient.prototype, 'post');
        const cacheHasSpy = vi.spyOn(CacheManager.prototype, 'has').mockResolvedValue(true);
        const cacheGetSpy = vi.spyOn(CacheManager.prototype, 'get').mockResolvedValue(iinDetails);
        const cacheSetSpy = vi.spyOn(CacheManager.prototype, 'set');

        const result = await service.getIinDetails('42424242', paymentContextWithAmount);

        expect(cacheHasSpy).toHaveBeenCalledTimes(1);
        expect(cacheGetSpy).toHaveBeenCalledTimes(1);

        expect(apiSpy).not.toHaveBeenCalled();
        expect(cacheSetSpy).not.toHaveBeenCalled();

        expect(result).toBe(iinDetails);
    });

    it('should return iinDetails from API', async () => {
        const iinDetails = new IinDetailsResponse(IinDetailsStatus.SUPPORTED, json);

        const apiResponse: SdkResponse<GetIINDetailsResponseJson> = {
            status: 200,
            success: true,
            data: json,
        };

        const apiSpy = vi.spyOn(TestApiClient.prototype, 'post').mockResolvedValue(apiResponse);

        const cacheSetSpy = vi.spyOn(CacheManager.prototype, 'set');

        const result = await service.getIinDetails('42424242', paymentContextWithAmount);

        expect(apiSpy).toHaveBeenCalledTimes(1);
        expect(cacheSetSpy).toHaveBeenCalled();
        expect(result).toEqual(iinDetails);
    });
});

describe('getCurrencyConversionQuote', () => {
    it('returns cached value when available and does not call API for currency quote', async () => {
        const cachedValue: CurrencyConversionResponse = {
            docSessionId: '1',
            result: { resultReason: 'test reason', result: 'Allowed' },
            proposal: {
                baseAmount: {
                    amount: 1000,
                    currencyCode: 'EUR',
                },
                targetAmount: {
                    amount: 1200,
                    currencyCode: 'EUR',
                },
                rate: {
                    exchangeRate: 1,
                    invertedExchangeRate: 1,
                    markUpRate: 1,
                    quotationDateTime: 'test',
                    source: 'test source',
                },
            },
        };

        const apiSpy = vi.spyOn(TestApiClient.prototype, 'post');
        const cacheHasSpy = vi.spyOn(CacheManager.prototype, 'has').mockResolvedValue(true);
        const cacheGetSpy = vi.spyOn(CacheManager.prototype, 'get').mockResolvedValue(cachedValue);
        const cacheSetSpy = vi.spyOn(CacheManager.prototype, 'set');
        const result = await service.getCurrencyConversionQuote(
            {
                amount: 1000,
                currencyCode: 'EUR',
            },
            {
                partialCreditCardNumber: '123456789',
            },
        );

        expect(cacheHasSpy).toHaveBeenCalledTimes(1);
        expect(cacheGetSpy).toHaveBeenCalledTimes(1);
        expect(apiSpy).not.toHaveBeenCalled();
        expect(cacheSetSpy).not.toHaveBeenCalled();

        expect(result).toBe(cachedValue);
    });

    it('calls API, caches result, and returns data when not cached', async () => {
        const request: CurrencyConversionRequest = {
            cardSource: {
                card: {
                    cardNumber: partialCard.partialCreditCardNumber,
                    paymentProductId: partialCard.paymentProductId,
                },
            },
            transaction: { amount: amount },
        };

        const apiResponse: SdkResponse<CurrencyConversionResponse> = {
            status: 200,
            success: true,
            data: currencyConversionResponse,
        };

        const apiSpy = vi.spyOn(TestApiClient.prototype, 'post').mockResolvedValue(apiResponse);
        const cacheSetSpy = vi.spyOn(CacheManager.prototype, 'set');

        const result = await service.getCurrencyConversionQuote(amount, partialCard);

        expect(apiSpy).toHaveBeenCalledTimes(1);

        const [path, options, apiVersion] = apiSpy.mock.calls[0];
        const parsedBody = JSON.parse(options?.body as string);

        expect(path).toBe('services/dccrate');
        expect(apiVersion).toBe('v2');
        expect(parsedBody).toEqual(request);

        expect(cacheSetSpy).toHaveBeenCalledTimes(1);
        expect(cacheSetSpy).toHaveBeenCalledWith(expect.any(String), currencyConversionResponse);

        expect(result).toBe(currencyConversionResponse);
    });
});

describe('getSurchargeCalculation', () => {
    it('returns cached value for surcharge and doesnt call API', async () => {
        const cachedValue: SurchargeCalculationResponse = {
            surcharges: [
                {
                    result: 'OK',
                    paymentProductId: 1,
                    surchargeAmount: { amount: 25, currencyCode: 'EUR' },
                    netAmount: {
                        amount: 1500,
                        currencyCode: 'EUR',
                    },
                    totalAmount: { amount: 1525, currencyCode: 'EUR' },
                },
            ],
        };

        const apiSpy = vi.spyOn(TestApiClient.prototype, 'post');
        const cacheHasSpy = vi.spyOn(CacheManager.prototype, 'has').mockResolvedValue(true);
        const cacheGetSpy = vi.spyOn(CacheManager.prototype, 'get').mockResolvedValue(cachedValue);
        const cacheSetSpy = vi.spyOn(CacheManager.prototype, 'set');

        const result = await service.getCurrencyConversionQuote(
            {
                amount: 1000,
                currencyCode: 'EUR',
            },
            {
                partialCreditCardNumber: '123456789',
            },
        );

        expect(cacheHasSpy).toHaveBeenCalledTimes(1);
        expect(cacheGetSpy).toHaveBeenCalledTimes(1);
        expect(apiSpy).not.toHaveBeenCalled();
        expect(cacheSetSpy).not.toHaveBeenCalled();

        expect(result).toBe(cachedValue);
    });

    it('calls API, caches result, and returns data when not cached', async () => {
        const request: SurchargeRequestJson = {
            cardSource: {
                card: {
                    cardNumber: partialCard.partialCreditCardNumber,
                    paymentProductId: partialCard.paymentProductId,
                },
            },
            amountOfMoney: amount,
        };

        const apiResponse: SdkResponse<CurrencyConversionResponse> = {
            status: 200,
            success: true,
            data: currencyConversionResponse,
        };

        const apiSpy = vi.spyOn(TestApiClient.prototype, 'post').mockResolvedValue(apiResponse);
        const cacheSetSpy = vi.spyOn(CacheManager.prototype, 'set');

        const result = await service.getSurchargeCalculation(amount, partialCard);

        expect(apiSpy).toHaveBeenCalledTimes(1);

        const [path, options] = apiSpy.mock.calls[0];
        const parsedBody = JSON.parse(options?.body as string);

        expect(path).toBe('services/surchargeCalculation');
        expect(parsedBody).toEqual(request);

        expect(cacheSetSpy).toHaveBeenCalledTimes(1);
        expect(cacheSetSpy).toHaveBeenCalledWith(expect.any(String), currencyConversionResponse);

        expect(result).toBe(currencyConversionResponse);
    });
});
