import { OnlinePaymentSdk } from './facade/OnlinePaymentSdk';
import type { SdkConfiguration, SessionData } from './types';

export * from './types';
export * from './dataModel';

export * from './domain/paymentProduct/BasicPaymentProduct';
export * from './domain/paymentProduct/AccountOnFile';
export * from './domain/paymentProduct/PaymentProduct';
export * from './domain/paymentProduct/PaymentProductField';
export * from './domain/paymentRequest/PaymentRequest';
export * from './domain/paymentRequest/PaymentRequestField';
export * from './domain/paymentRequest/CreditCardTokenRequest';
export * from './facade/OnlinePaymentSdk';

/**
 * Initializes the SDK with the provided data.
 */
export function init(sessionData: SessionData, configuration?: SdkConfiguration) {
    return new OnlinePaymentSdk(sessionData, configuration);
}
