# JavaScript SDK reference

## Installation

```bash
npm install onlinepayments-sdk-client-js
```

The package ships ES modules and type definitions (`dist/types/`). A UMD build is available at
`dist/onlinepayments-sdk-client-js.umd.js`; it exposes the SDK as `window.onlinepaymentssdk`.

Supported browsers start at Chrome 74, Edge 79, Safari 14.1 and Firefox 90 (see the SDK README).

## Imports

Import from the package root. Classes used at runtime (`PaymentRequest`, `CreditCardTokenRequest`,
error classes, enums) are value imports; interfaces are type imports.

<!-- region: initialise-sdk-import -->
```ts
import { init, type OnlinePaymentSdk, type PaymentContextWithAmount } from 'onlinepayments-sdk-client-js';
```

## Async model

Every method that calls the Client API returns a `Promise`. Use `async`/`await` or `.then()`. The
SDK caches payment products, IIN details and the public key for the lifetime of the `sdk` instance.

## SDK methods

`init(sessionData, configuration?)` returns an `OnlinePaymentSdk`. Its methods:

| Method | Client API operation | Returns |
|---|---|---|
| `getBasicPaymentProducts(paymentContext)` | Get payment products | `BasicPaymentProducts` (`paymentProducts`, `accountsOnFile`) |
| `getPaymentProduct(paymentProductId, paymentContext)` | Get payment product | `PaymentProduct` |
| `getPaymentProductNetworks(paymentProductId, paymentContext)` | Get payment product networks | `PaymentProductNetworksResponse` |
| `getIinDetails(partialCardNumber, paymentContext)` | Get IIN details | `IinDetailsResponse` |
| `getSurchargeCalculation(amountOfMoney, cardOrToken)` | Surcharge calculation | `SurchargeCalculationResponse` |
| `getCurrencyConversionQuote(amountOfMoney, cardOrToken)` | Currency conversion quote | `CurrencyConversionResponse` |
| `encryptPaymentRequest(paymentRequest)` | Gets the public key, then encrypts locally | `EncryptedRequest` |
| `encryptTokenRequest(tokenRequest)` | Gets the public key, then encrypts locally | `EncryptedRequest` |
| `clickToPay(paymentContext)` | Loads Click to Pay on `mount()` | `ClickToPayComponentBuilder` |
| `getPublicKey()` | Get public key | Used internally by the encrypt methods; do not use it to encrypt yourself |

`cardOrToken` is either `{ partialCreditCardNumber, paymentProductId }` or the token (account on
file id) as a string.

## Domain objects

- `PaymentProduct`: `getFields()`, `getField(id)`, `getRequiredFields()`, `getAccountOnFile(id)`,
  `allowsTokenization`, `allowsRecurring`.
- `PaymentProductField`: `getLabel()`, `getPlaceholder()`, `isRequired()`, `shouldObfuscate()`,
  `getDisplayOrder()`, `applyMask(value)`, `removeMask(value)`, `validate(value)`.
- `PaymentRequest(paymentProduct, accountOnFile?, tokenize?)`: `getField(id)`, `setValue(id, value)`,
  `validate()`, `setAccountOnFile()`, `setTokenize()`.
- `PaymentRequestField`: `setValue()`, `getValue()`, `getMaskedValue()`, `validate()`.
- `AccountOnFile`: `id`, `paymentProductId`, `label`, `getValue(fieldId)`, `isWritable(fieldId)`.

## Your backend

The examples call your own backend through the functions in `examples/merchant-backend.ts`. The
paths and response shapes are placeholders; the SDK does not call them. The same file also has
`submitEncryptedToken` (tokenization) and `submitClickToPayResult` (Click to Pay).

<!-- region: merchant-backend -->
```ts
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
```
