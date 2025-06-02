/// <reference types="applepayjs" />
import type { PaymentProductSessionContext } from './communicator.types';
import type { CreatePaymentProductSessionResponseJSON, PaymentContext } from './payment-product.types';

export type ApplePayPaymentToken = ApplePayJS.ApplePayPaymentToken;
export type ApplePayPaymentRequest = ApplePayJS.ApplePayPaymentRequest;

export interface ApplePayPaymentContext extends PaymentContext {
    displayName: string;
    acquirerCountry?: string;
    networks: string[];
}

export interface ApplePayInitResult {
    message: string;
    data: ApplePayPaymentToken;
}

export interface ApplePayC2SCommunicator {
    createPaymentProductSession(
        paymentProductId: number,
        context: PaymentProductSessionContext,
    ): Promise<CreatePaymentProductSessionResponseJSON>;
}
