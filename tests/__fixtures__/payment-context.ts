import type { PaymentContext, PaymentContextWithAmount } from '../../src';

export const paymentContext: PaymentContext = {
    countryCode: 'NL',
    amountOfMoney: { currencyCode: 'EUR' },
    isRecurring: false,
};

export const paymentContextWithAmount: PaymentContextWithAmount = {
    countryCode: 'NL',
    amountOfMoney: { amount: 1000, currencyCode: 'EUR' },
    isRecurring: false,
};
