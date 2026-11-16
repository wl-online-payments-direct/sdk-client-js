import { CreditCardTokenRequest, type OnlinePaymentSdk, type PaymentProduct } from 'onlinepayments-sdk-client-js';
import { submitEncryptedToken } from './merchant-backend';

// [START encrypt-token-request]
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
// [END encrypt-token-request]
