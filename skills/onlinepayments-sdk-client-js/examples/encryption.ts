import {
    PaymentRequest,
    type AccountOnFile,
    type OnlinePaymentSdk,
    type PaymentProduct,
} from 'onlinepayments-sdk-client-js';
import {
    submitEncryptedPayment,
    type CurrencyConversionChoice,
    type MerchantPaymentResponse,
} from './merchant-backend';
import { validatePaymentRequest } from './validation-and-masking';

// [START create-payment-request]
export function createPaymentRequest(
    paymentProduct: PaymentProduct,
    accountOnFile: AccountOnFile | undefined,
    customerWantsToStoreCard: boolean,
): PaymentRequest {
    // Ask to store the card only when the product allows it and the customer agreed.
    const tokenize = customerWantsToStoreCard && paymentProduct.allowsTokenization === true;

    return new PaymentRequest(paymentProduct, accountOnFile, tokenize);
}
// [END create-payment-request]

// [START encrypt-payment-request]
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
// [END encrypt-payment-request]
