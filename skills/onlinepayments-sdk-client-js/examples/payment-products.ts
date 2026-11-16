import type {
    AccountOnFile,
    BasicPaymentProduct,
    OnlinePaymentSdk,
    PaymentContextWithAmount,
} from 'onlinepayments-sdk-client-js';

// [START list-payment-products]
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
// [END list-payment-products]
