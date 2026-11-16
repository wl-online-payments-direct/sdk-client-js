/**
 * Calls from the browser to the merchant's own backend. The endpoint paths and response shapes are
 * placeholders: replace them with your own. The SDK is not involved in these calls.
 */
import type { EncryptedRequest, SessionData } from 'onlinepayments-sdk-client-js';

// [START merchant-backend]
/** What your backend returns after it has created the payment. */
export interface MerchantPaymentResponse {
    /** Set when the customer must be redirected, for example for 3-D Secure. */
    redirectUrl?: string;
    /** The payment status as your backend reports it. */
    status: 'SUCCESS' | 'PENDING' | 'FAILED';
}

async function postJson<T>(path: string, body?: unknown): Promise<T> {
    const response = await fetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (!response.ok) {
        throw new Error(`${path} failed with HTTP ${response.status}`);
    }
    return (await response.json()) as T;
}

/** Your backend creates a new client session for this checkout and returns its data. */
export function fetchSessionData(): Promise<SessionData> {
    return postJson<SessionData>('/api/checkout/session');
}

/**
 * The customer's currency conversion choice. Your backend passes both fields to Create Payment in
 * cardPaymentMethodSpecificInput.currencyConversion. Both are mandatory once a quote was shown.
 */
export interface CurrencyConversionChoice {
    dccSessionId: string;
    /** true: pay in the card's currency (proposal.targetAmount); false: pay in your currency. */
    acceptedByUser: boolean;
}

/** Your backend creates the payment with the encrypted customer input. */
export function submitEncryptedPayment(
    encryptedRequest: EncryptedRequest,
    currencyConversion?: CurrencyConversionChoice, // only when a currency conversion offer was shown
): Promise<MerchantPaymentResponse> {
    return postJson<MerchantPaymentResponse>('/api/checkout/payment', {
        encryptedCustomerInput: encryptedRequest.encryptedCustomerInput,
        encodedClientMetaInfo: encryptedRequest.encodedClientMetaInfo,
        currencyConversion,
    });
}
// [END merchant-backend]

/** Your backend creates the token with the encrypted card data. */
export function submitEncryptedToken(encryptedRequest: EncryptedRequest): Promise<{ token: string }> {
    return postJson<{ token: string }>('/api/tokens', {
        encryptedCustomerInput: encryptedRequest.encryptedCustomerInput,
        encodedClientMetaInfo: encryptedRequest.encodedClientMetaInfo,
    });
}

/** Your backend completes the Click to Pay payment with the checkout result. */
export function submitClickToPayResult(result: {
    checkoutResponseSignature: string;
    cardScheme: string;
}): Promise<MerchantPaymentResponse> {
    return postJson<MerchantPaymentResponse>('/api/checkout/click-to-pay', result);
}
