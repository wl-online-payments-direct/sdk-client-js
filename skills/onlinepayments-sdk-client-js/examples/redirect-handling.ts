import type { MerchantPaymentResponse } from './merchant-backend';

declare function showPaymentOutcome(status: MerchantPaymentResponse['status']): void;

// [START handle-payment-result]
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
// [END handle-payment-result]
