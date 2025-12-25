import type { CurrencyConversionResponse, ErrorResponseJson } from '../../../src/types';

export const withCurrencyConversion: CurrencyConversionResponse = {
    docSessionId: '91e6bfec501c484bbcd27d8d7972f2b5q',
    result: {
        result: 'Allowed',
    },
    proposal: {
        baseAmount: {
            amount: 1000,
            currencyCode: 'AUD',
        },
        targetAmount: {
            amount: 665,
            currencyCode: 'USD',
        },
        rate: {
            exchangeRate: 0.66484161,
            invertedExchangeRate: 1.504117649,
            markUpRate: 2,
            quotationDateTime: '2024-04-03T07:30:00Z',
            source: 'Six Financial Services',
        },
    },
};

export const withNoCurrencyConversionErrorResponseJson: ErrorResponseJson = {
    errorId: '93614968-572c-473d-b355-708132bc33c1',
    errors: [
        {
            errorCode: '50001111',
            category: 'DIRECT_PLATFORM_ERROR',
            httpStatusCode: 404,
            id: 'CURRENCY_CONVERSION_NOT_FOUND_REQUEST',
            message: 'Some request parameter e.g. merchant, card etc not found in the system.',
            retriable: false,
        },
    ],
};
