// [START initialise-sdk-import]
import { init, type OnlinePaymentSdk, type PaymentContextWithAmount } from 'onlinepayments-sdk-client-js';
// [END initialise-sdk-import]
import { fetchSessionData } from './merchant-backend';

// [START initialise-sdk]
export async function createSdk(): Promise<OnlinePaymentSdk> {
    // New session data for every checkout. Your backend creates it with Create Session.
    // The session data holds no secret: never put the API key or secret in browser code.
    const sessionData = await fetchSessionData();

    // init() throws a ConfigurationError when a value is missing or clientApiUrl has a
    // path other than "" or "/client".
    return init(sessionData, { appIdentifier: 'MyShop/1.0.0' });
}
// [END initialise-sdk]

// [START payment-context]
export function createPaymentContext(order: {
    totalInMinorUnits: number;
    currencyCode: string;
    countryCode: string;
}): PaymentContextWithAmount {
    // Use the real values of the order being paid: the payment products, surcharge and
    // currency conversion returned by the SDK depend on them.
    return {
        countryCode: order.countryCode, // ISO 3166-1 alpha-2, for example 'NL'
        amountOfMoney: {
            amount: order.totalInMinorUnits, // in the smallest unit of the currency: 1298 = EUR 12.98
            currencyCode: order.currencyCode, // ISO 4217, for example 'EUR'
        },
        isRecurring: false,
    };
}
// [END payment-context]
