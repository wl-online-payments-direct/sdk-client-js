import type {
    ClickToPayInstance,
    ClickToPayPaymentResult,
    OnlinePaymentSdk,
    PaymentContextWithAmount,
} from 'onlinepayments-sdk-client-js';
import { submitClickToPayResult } from './merchant-backend';
import { handlePaymentResult } from './redirect-handling';

declare function showCardForm(): void;

// [START click-to-pay-mount]
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
// [END click-to-pay-mount]

// [START click-to-pay-complete]
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
// [END click-to-pay-complete]

// [START click-to-pay-unmount]
// unmount() can be called once. To start again, call sdk.clickToPay(paymentContext) again.
export function leaveCheckout(instance: ClickToPayInstance): void {
    instance.unmount();
}
// [END click-to-pay-unmount]
