import type {
    AccountOnFile,
    OnlinePaymentSdk,
    PaymentContextWithAmount,
    PaymentProduct,
} from 'onlinepayments-sdk-client-js';

// [START get-payment-product]
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
// [END get-payment-product]

// [START describe-form-fields]
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
// [END describe-form-fields]
