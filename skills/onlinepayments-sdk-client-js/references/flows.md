# Checkout flows

Every code block below is copied from a file in `../examples/`. The examples call your backend
through the functions in `examples/merchant-backend.ts`; see
[javascript.md](javascript.md#your-backend) for that contract.

## 1. Initialise the SDK

Your backend creates a client session with Create Session and returns its data. Create Session's
response can be passed to `init()` as it is. Do this for every checkout.

<!-- region: initialise-sdk -->
```ts
export async function createSdk(): Promise<OnlinePaymentSdk> {
    // New session data for every checkout. Your backend creates it with Create Session.
    // The session data holds no secret: never put the API key or secret in browser code.
    const sessionData = await fetchSessionData();

    // init() throws a ConfigurationError when a value is missing or clientApiUrl has a
    // path other than "" or "/client".
    return init(sessionData, { appIdentifier: 'MyShop/1.0.0' });
}
```

## 2. Build the payment context

The payment context is passed to most SDK calls. The payment products, surcharge and currency
conversion depend on it, so it must match the order.

<!-- region: payment-context -->
```ts
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
```

`PaymentContextWithAmount` (amount required) is needed by `getIinDetails` and `clickToPay`. It can
be used for all other calls too.

## 3. List payment products and stored cards

`getBasicPaymentProducts` returns the payment products available for this context and the
customer's accounts on file (stored cards). Accounts on file are only returned when your backend
passed the customer's tokens to Create Session.

<!-- region: list-payment-products -->
```ts
export interface PaymentOptions {
    storedAccounts: { accountOnFile: AccountOnFile; logo?: string }[];
    products: BasicPaymentProduct[];
}

export async function loadPaymentOptions(
    sdk: OnlinePaymentSdk,
    paymentContext: PaymentContextWithAmount,
): Promise<PaymentOptions> {
    const { paymentProducts, accountsOnFile } = await sdk.getBasicPaymentProducts(paymentContext);

    // Accounts on file are the customer's stored cards. They are only returned when your
    // backend passed the customer's tokens to Create Session.
    const storedAccounts = accountsOnFile.map((accountOnFile) => ({
        accountOnFile, // accountOnFile.label is the display text, for example "4242 **** **** 4242"
        logo: paymentProducts.find((product) => product.id === accountOnFile.paymentProductId)?.logo,
    }));

    const products = [...paymentProducts].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

    return { storedAccounts, products };
}
```

## 4. Render the payment form

When the customer selects a product or a stored card, get the full product. It contains the fields
to render. For a stored card, pass the account on file's `paymentProductId`.

<!-- region: get-payment-product -->
```ts
export async function loadSelectedProduct(
    sdk: OnlinePaymentSdk,
    paymentContext: PaymentContextWithAmount,
    selection: { paymentProductId: number; accountOnFileId?: string },
): Promise<{ paymentProduct: PaymentProduct; accountOnFile?: AccountOnFile }> {
    const paymentProduct = await sdk.getPaymentProduct(selection.paymentProductId, paymentContext);
    const accountOnFile = selection.accountOnFileId
        ? paymentProduct.getAccountOnFile(selection.accountOnFileId)
        : undefined;

    return { paymentProduct, accountOnFile };
}
```

Describe the form from the product's fields. Fields of a stored card that are `READ_ONLY` are shown
with their masked value and cannot be edited.

<!-- region: describe-form-fields -->
```ts
export interface FormField {
    id: string;
    label: string;
    placeholder?: string;
    required: boolean;
    obfuscate: boolean; // render as a password-type input
    preferredInputType?: string;
    prefilledValue?: string; // masked value from the account on file
    readOnly: boolean;
}

// Build the form from the fields the API returns. Do not hard-code fields, masks or
// validation rules: they differ per payment product and per merchant configuration.
export function describeFormFields(paymentProduct: PaymentProduct, accountOnFile?: AccountOnFile): FormField[] {
    return [...paymentProduct.getFields()]
        .sort((a, b) => a.getDisplayOrder() - b.getDisplayOrder())
        .map((field) => ({
            id: field.id,
            label: field.getLabel(),
            placeholder: field.getPlaceholder(),
            required: field.isRequired(),
            obfuscate: field.shouldObfuscate(),
            preferredInputType: field.displayHints?.preferredInputType,
            prefilledValue: accountOnFile?.getValue(field.id),
            readOnly: accountOnFile ? !accountOnFile.isWritable(field.id) : false,
        }));
}
```

## 5. Detect the card brand

When at least 6 digits have been entered, get the IIN details to find the payment product for the
card. Use the returned `paymentProductId` to show the brand logo and, if it differs from the
selected product, load that product with `getPaymentProduct`.

<!-- region: iin-details -->
```ts
export type CardDetection =
    | { kind: 'too-short' }
    | { kind: 'supported'; paymentProductId: number; coBrandProductIds: number[] }
    | { kind: 'not-allowed' } // known card, but not accepted for this payment
    | { kind: 'unknown' };

export async function detectCard(
    sdk: OnlinePaymentSdk,
    cardNumberInput: string,
    paymentContext: PaymentContextWithAmount,
): Promise<CardDetection> {
    const digits = cardNumberInput.replace(/\D/g, '');

    // getIinDetails throws an InvalidArgumentError below 6 digits, so do not call it earlier.
    if (digits.length < 6) {
        return { kind: 'too-short' };
    }

    try {
        // The SDK sends only the first 6 or 8 digits.
        const response = await sdk.getIinDetails(digits, paymentContext);

        if (response.status === IinDetailStatus.EXISTING_BUT_NOT_ALLOWED || !response.paymentProductId) {
            return { kind: 'not-allowed' };
        }

        // Co-branded cards: let the customer choose the brand among the allowed ones.
        const coBrandProductIds = (response.coBrands ?? [])
            .filter((coBrand) => coBrand.isAllowedInContext)
            .map((coBrand) => coBrand.paymentProductId);

        return { kind: 'supported', paymentProductId: response.paymentProductId, coBrandProductIds };
    } catch (error) {
        // An IIN the platform does not recognise is returned as an API error.
        if (error instanceof ResponseError) {
            return { kind: 'unknown' };
        }
        throw error;
    }
}
```

## 6. Format and validate input

Create the `PaymentRequest` once the product is loaded, then set values as the customer types.

<!-- region: create-payment-request -->
```ts
export function createPaymentRequest(
    paymentProduct: PaymentProduct,
    accountOnFile: AccountOnFile | undefined,
    customerWantsToStoreCard: boolean,
): PaymentRequest {
    // Ask to store the card only when the product allows it and the customer agreed.
    const tokenize = customerWantsToStoreCard && paymentProduct.allowsTokenization === true;

    return new PaymentRequest(paymentProduct, accountOnFile, tokenize);
}
```

<!-- region: set-field-value -->
```ts
// Call on every input event. Returns the formatted value to show in the input.
export function onFieldInput(paymentRequest: PaymentRequest, fieldId: string, input: string): string {
    const field = paymentRequest.getField(fieldId);

    // setValue removes the mask before it stores the value, so "4111 1111" is stored as "41111111".
    // It throws an InvalidArgumentError for a READ_ONLY field of the selected account on file:
    // render those fields as read-only and never call setValue for them.
    field.setValue(input);

    return field.getMaskedValue() ?? '';
}
```

<!-- region: validate-field -->
```ts
// Call when a field loses focus. Returns the messages to show under the field.
export function fieldErrors(paymentRequest: PaymentRequest, fieldId: string): string[] {
    return paymentRequest
        .getField(fieldId)
        .validate()
        .errors.map((error) => error.errorMessage);
}
```

Before encrypting, validate the whole request. With an account on file, the SDK validates the fields
the customer must enter (`MUST_WRITE`) and the fields the customer changed.

<!-- region: validate-payment-request -->
```ts
// Call before encrypting. Returns the error messages per field id; empty when the request is valid.
export function validatePaymentRequest(paymentRequest: PaymentRequest): Record<string, string[]> {
    const result = paymentRequest.validate();
    const errorsByField: Record<string, string[]> = {};

    for (const error of result.errors) {
        (errorsByField[error.paymentProductFieldId] ??= []).push(error.errorMessage);
    }

    return errorsByField;
}
```

## 7. Surcharge and currency conversion (optional)

Only when your merchant account has surcharging or dynamic currency conversion enabled. Call these
once the card product is known, and show the result before the customer pays.

### Surcharge

The payment context keeps the net amount (without surcharge); the platform adds the surcharge when
your backend creates the payment. Show the surcharge and the total before the customer pays.

<!-- region: surcharge-calculation -->
```ts
// Call once the card is known: either the digits entered so far plus the detected product id,
// or the selected account on file. Only the first 8 digits are sent: never send the complete card
// number, because this request is not encrypted and the first digits identify the brand and issuer.
export async function getSurcharge(
    sdk: OnlinePaymentSdk,
    paymentContext: PaymentContextWithAmount,
    card: { digits: string; paymentProductId: number } | { accountOnFile: AccountOnFile },
): Promise<{ surchargeAmount: AmountOfMoney; totalAmount: AmountOfMoney } | undefined> {
    const cardOrToken =
        'accountOnFile' in card
            ? card.accountOnFile.id // the token
            : { partialCreditCardNumber: card.digits.slice(0, 8), paymentProductId: card.paymentProductId };

    const response = await sdk.getSurchargeCalculation(paymentContext.amountOfMoney, cardOrToken);
    const surcharge = response.surcharges[0];

    if (surcharge.result === SurchargeResult.NO_SURCHARGE) {
        return undefined;
    }

    // Show both amounts to the customer before they pay.
    return { surchargeAmount: surcharge.surchargeAmount, totalAmount: surcharge.totalAmount };
}
```

### Currency conversion

Dynamic currency conversion (eDCC, Visa and Mastercard only) lets the customer pay in their card's
currency. The card schemes' rules apply to how you show the offer:

- Show both amounts as two equal options: same size, colour and font. Include your currency, the
  card's currency, the exchange rate, the mark-up and `proposal.disclaimerDisplay`.
- Preselect neither option. Do not use a yes/no or accept/decline question: the customer must
  actively choose one amount.
- If the customer chooses your currency, continue in your currency and do not offer the conversion
  again in this checkout.

<!-- region: currency-conversion -->
```ts
export interface CurrencyConversionOffer {
    dccSessionId: string;
    proposal: DccProposal;
}

export async function getCurrencyConversionOffer(
    sdk: OnlinePaymentSdk,
    amountToPay: AmountOfMoney, // the order amount, or the surcharge's totalAmount when a surcharge applies
    card: { digits: string; paymentProductId: number } | { accountOnFile: AccountOnFile },
): Promise<CurrencyConversionOffer | undefined> {
    const cardOrToken =
        'accountOnFile' in card
            ? card.accountOnFile.id
            : { partialCreditCardNumber: card.digits.slice(0, 8), paymentProductId: card.paymentProductId };

    const response = await sdk.getCurrencyConversionQuote(amountToPay, cardOrToken);

    if (response.result.result !== ConversionResultType.Allowed) {
        return undefined; // no offer: pay in your currency, send no currency conversion data
    }

    // Show two options with the same size, colour and font: proposal.baseAmount (your currency) and
    // proposal.targetAmount (the card's currency), with proposal.rate (exchange rate and mark-up) and
    // proposal.disclaimerDisplay. Preselect neither option and do not ask a yes/no question: the
    // customer must actively choose one.
    return { dccSessionId: response.dccSessionId, proposal: response.proposal };
}
```

When the customer has chosen, send the choice with the payment. Your backend passes it to Create
Payment as `cardPaymentMethodSpecificInput.currencyConversion`. Both `dccSessionId` and
`acceptedByUser` are required, also when the customer chose your currency (`acceptedByUser: false`).

<!-- region: currency-conversion-choice -->
```ts
// Call when the customer actively selects one of the two options. Pass the result to
// submitEncryptedPayment, also when the customer chose your currency. Once the customer chose your
// currency, do not offer the conversion again in this checkout.
export function chooseCurrency(offer: CurrencyConversionOffer, payInCardCurrency: boolean): CurrencyConversionChoice {
    return { dccSessionId: offer.dccSessionId, acceptedByUser: payInCardCurrency };
}
```

When both surcharging and currency conversion apply, calculate the surcharge first and request the
currency conversion quote for the surcharge's `totalAmount` (net amount plus surcharge), as the Client
API reference prescribes. Without a surcharge, request it for the order amount. The payment context
keeps the net amount in both cases.

## 8. Encrypt and send to your backend

`encryptPaymentRequest` validates the request again and throws an `InvalidArgumentError` if it is
not valid. The result has two parts: `encryptedCustomerInput` and `encodedClientMetaInfo`. Send both
to your backend; it passes them to Create Payment.

<!-- region: encrypt-payment-request -->
```ts
export async function payWithEncryptedRequest(
    sdk: OnlinePaymentSdk,
    paymentRequest: PaymentRequest,
    currencyConversion?: CurrencyConversionChoice, // the customer's choice, when a conversion offer was shown
): Promise<{ validationErrors: Record<string, string[]> } | { result: MerchantPaymentResponse }> {
    const validationErrors = validatePaymentRequest(paymentRequest);
    if (Object.keys(validationErrors).length > 0) {
        return { validationErrors }; // show these to the customer; do not encrypt
    }

    // The only way card data leaves the browser: encrypted by the SDK.
    // Never send, log or store the raw field values.
    const encryptedRequest = await sdk.encryptPaymentRequest(paymentRequest);

    // Your backend passes encryptedCustomerInput to Create Payment and decides the outcome.
    const result = await submitEncryptedPayment(encryptedRequest, currencyConversion);

    return { result };
}
```

## 9. Handle the result

Your backend returns what Create Payment returned. When the payment needs a redirect (for example
3-D Secure), the backend returns the redirect URL from that response.

<!-- region: handle-payment-result -->
```ts
export function handlePaymentResult(result: MerchantPaymentResponse): void {
    if (result.redirectUrl) {
        // For example 3-D Secure or a third-party payment page. Use the URL from the response
        // exactly as received: do not build or change it.
        window.location.assign(result.redirectUrl);
        return;
    }

    // The status comes from your backend. The browser never decides that a payment succeeded.
    showPaymentOutcome(result.status);
}
```

## Tokenization without a payment

To store a card without paying, use `CreditCardTokenRequest`. It applies no validation of its own,
so validate the values with the card product's fields first. Load the card product with
`getIinDetails` and `getPaymentProduct` as in a payment. There is no order amount, so create the
`PaymentContext` with an amount of 1, the smallest unit of the currency (for example 1 cent for
EUR). Do not use 0: the Client API answers an amount of 0 with an error.

<!-- region: encrypt-token-request -->
```ts
const CARD_FIELD_IDS = ['cardNumber', 'cardholderName', 'expiryDate', 'cvv'] as const;
type CardForm = Record<(typeof CARD_FIELD_IDS)[number], string>;

export async function storeCard(
    sdk: OnlinePaymentSdk,
    cardProduct: PaymentProduct, // from sdk.getPaymentProduct for the detected card product
    form: CardForm, // the values as shown in the inputs, with or without masks
): Promise<{ errors: string[] } | { token: string }> {
    // Remove the masks first ("12/26" becomes "1226"): the validation rules and the token request
    // expect values without formatting.
    const values = Object.fromEntries(
        CARD_FIELD_IDS.map((fieldId) => [
            fieldId,
            cardProduct.getField(fieldId)?.removeMask(form[fieldId]) ?? form[fieldId],
        ]),
    ) as CardForm;

    // CreditCardTokenRequest applies no validation, so validate with the product's fields first.
    const errors = CARD_FIELD_IDS.flatMap(
        (fieldId) =>
            cardProduct
                .getField(fieldId)
                ?.validate(values[fieldId])
                .map((error) => error.errorMessage) ?? [],
    );
    if (errors.length > 0) {
        return { errors };
    }

    const tokenRequest = new CreditCardTokenRequest();
    tokenRequest.setCardNumber(values.cardNumber);
    tokenRequest.setCardholderName(values.cardholderName);
    tokenRequest.setExpiryDate(values.expiryDate);
    tokenRequest.setSecurityCode(values.cvv);
    tokenRequest.setProductPaymentId(cardProduct.id);

    const encryptedRequest = await sdk.encryptTokenRequest(tokenRequest);

    // Your backend creates the token with the encrypted data.
    return submitEncryptedToken(encryptedRequest);
}
```

## Click to Pay

Click to Pay lets a customer who registered a Visa or Mastercard with Click to Pay pay without
entering the card. Mount the component, listen to its events and send the result to your backend.
No network call is made until `mount()`.

<!-- region: click-to-pay-mount -->
```ts
// The element with id "click-to-pay-container" must already be in the DOM.
export function mountClickToPay(
    sdk: OnlinePaymentSdk,
    paymentContext: PaymentContextWithAmount,
    isProduction: boolean,
): Promise<ClickToPayInstance> {
    return sdk
        .clickToPay(paymentContext)
        .config({
            // Provide a scheme's object to offer that scheme. locale is required for Mastercard.
            // Configuring no scheme while the session has schemes rejects with a ConfigurationError.
            locale: 'en_US', // must be one of CLICK_TO_PAY_LOCALES
            mastercard: {},
            visa: {},
            // true outside production: the component then uses the Click to Pay test environment.
            sandbox: !isProduction,
        })
        .on('customerStatus', (status) => {
            if (!status.isRecognized) {
                showCardForm(); // the customer has no Click to Pay profile: offer card entry
            }
        })
        .on('paymentSuccess', (result) => {
            void completeClickToPay(result);
        })
        .on('paymentError', () => {
            showCardForm(); // errors are SdkError instances; fall back to card entry
        })
        .mount('click-to-pay-container');
}
```

<!-- region: click-to-pay-complete -->
```ts
// Called with the result of the paymentSuccess event or of processManualCardEntry().
export async function completeClickToPay(result: ClickToPayPaymentResult): Promise<void> {
    if (result.userAction !== 'COMPLETE') {
        showCardForm(); // 'CANCEL' or 'ERROR'
        return;
    }

    // Your backend verifies the signature and completes the payment.
    const response = await submitClickToPayResult({
        checkoutResponseSignature: result.checkoutResponseSignature,
        cardScheme: result.cardScheme,
    });
    handlePaymentResult(response);
}
```

<!-- region: click-to-pay-unmount -->
```ts
// unmount() can be called once. To start again, call sdk.clickToPay(paymentContext) again.
export function leaveCheckout(instance: ClickToPayInstance): void {
    instance.unmount();
}
```

Configuration options (`ClickToPayConfig`, passed to `config()`):

- `sandbox`: set `true` in every environment except production. Without it, the component uses the
  production Click to Pay environment and does not work with test sessions.
- `locale`: required to offer Mastercard; also the display locale for Visa. It must be one of the
  values in `CLICK_TO_PAY_LOCALES` (exported by the SDK), for example `en_US` or `en_GB`. Another
  value rejects with a `ConfigurationError`.
- `mastercard` / `visa`: provide the object to offer the scheme; leave it out to not offer it.
- `mastercard.recognitionToken`: a Mastercard `ClickToPayPaymentResult` can contain a
  `recognitionToken`. Keep it for that customer and pass it here in a later checkout, so the customer
  is recognised again.
- `visa.authenticationOptions`: provide it to state your 3-D Secure preference for Visa
  (`payloadRequested` and `challengeIndicator`). Without it, Visa applies its own risk-based 3-D
  Secure.
- `email`: pre-fills the email address used to recognise a returning customer.
- `hidePayButton`: hides the built-in pay button; then call `processSavedCard()` from your own button.

Other instance methods:

- `processManualCardEntry(card, options)` pays with a card the customer enters, and resolves with a
  `ClickToPayPaymentResult`. Pass its result to `completeClickToPay`.
- `processSavedCard()` pays with the selected saved card. Use it only with `hidePayButton: true` in
  the config; otherwise it rejects with a `ClickToPayError`.
- `displayClickToPayExplanationModal()` shows the Click to Pay explanation dialog.
- `getComplianceResourceURLsForVisa(country)` and `getComplianceResourceURLsForMastercard()` return
  the terms and privacy URLs the schemes require you to show.

`config()` and `on()` throw a `ConfigurationError` after `mount()` has started. If `mount()` rejects,
the builder can be fixed and mounted again.
