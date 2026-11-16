---
name: onlinepayments-sdk-client-js
description: Build browser checkouts with the Online Payments JavaScript client SDK (npm package onlinepayments-sdk-client-js). Use when code initialises the SDK from client session data, lists payment products or stored cards (accounts on file), renders payment product fields, detects the card brand (IIN details), validates or masks card input, encrypts a payment or token request, handles the redirect after payment creation, shows a surcharge or currency conversion offer, or integrates Click to Pay.
---

# Online Payments JavaScript client SDK

This skill covers the browser side of an Online Payments card checkout built with
`onlinepayments-sdk-client-js`. The SDK runs in the customer's browser: it reads payment products
from the Client API, validates and formats customer input, and encrypts it. The encrypted result is
sent to your own backend, which creates the payment.

## How to use this skill

- Use the code in the reference files. Do not write calls to this SDK from memory: copy the
  example code and adapt names and UI.
- Read [references/flows.md](references/flows.md) for the checkout steps and
  [references/errors.md](references/errors.md) before writing error handling.
- Read [references/javascript.md](references/javascript.md) for installation, imports and the list
  of SDK methods.
- The examples in `examples/` are complete TypeScript files that are type-checked against the SDK
  on every SDK build.
- For classes and fields not shown here, read the SDK's [README](../../README.md) or the type
  definitions in the installed package (`dist/types/`). For API fields, see the
  [Client API reference](https://docs.direct.worldline-solutions.com/en/api-reference).

## Mandatory rules

Follow all of these in every integration:

1. Never put the API key or API secret in browser code. Initialise the SDK only with the session
   data your backend returns: `clientSessionId`, `customerId`, `clientApiUrl` and `assetUrl`.
2. Use new session data for every checkout. Do not reuse or cache session data across customers or
   payments. When a call fails with a `ResponseError`, get new session data and initialise the SDK
   again.
3. Card data only leaves the browser through `sdk.encryptPaymentRequest` (or
   `sdk.encryptTokenRequest` for tokenization). Never send raw card data to your backend, never log
   it and never store it. Do not call `sdk.getPublicKey` to encrypt data yourself.
4. Build the payment form from the fields returned by `sdk.getPaymentProduct`: labels, masks,
   placeholders, obfuscation and validation rules. Do not hard-code fields or validation rules for a
   payment product.
5. Validate the `PaymentRequest` with `paymentRequest.validate()` before encrypting it, and show the
   errors to the customer next to their fields.
6. The amount, currency and country in the `PaymentContext` must be the real values of the order
   being paid.
7. The browser never decides the payment outcome. After sending the encrypted data, show the result
   your backend returns. When the backend returns a redirect URL, open that URL exactly as received;
   do not build or change it.
8. This SDK has no logging option. Do not log form values, `PaymentRequest` values or SDK request
   bodies to the console, analytics or error trackers. Log only error ids and codes.

## Checkout steps

1. Get new session data from your backend and call `init()`.
2. Build the `PaymentContext` from the order.
3. `sdk.getBasicPaymentProducts()`: show payment products and stored cards.
4. `sdk.getPaymentProduct()`: render the form from its fields.
5. While the customer types: `sdk.getIinDetails()` for the card brand, `setValue()` and
   `getMaskedValue()` for formatting, `validate()` per field.
6. Optional: `sdk.getSurchargeCalculation()` or `sdk.getCurrencyConversionQuote()`. A currency
   conversion offer must not have a preselected option; the customer actively chooses.
7. `paymentRequest.validate()`, then `sdk.encryptPaymentRequest()`.
8. Send `encryptedCustomerInput` and `encodedClientMetaInfo` to your backend, plus `dccSessionId`
   and `acceptedByUser` when a currency conversion offer was shown.
9. Handle the backend's response: redirect or show the result.

Click to Pay and card tokenization are separate flows, described in
[references/flows.md](references/flows.md).
