import type { PaymentProductSessionContext } from './communicator.types';
import type {
  CreatePaymentProductSessionResponseJSON,
  PaymentContext,
} from './payment-product.types';

export interface ApplePayPaymentContext extends PaymentContext {
  displayName: string;
  acquirerCountry?: string;
  networks: string[];
}

export interface ApplePayInitResult {
  message: string;
  data: ApplePayJS.ApplePayPaymentToken;
}

export interface ApplePayC2SCommunicator {
  createPaymentProductSession(
    paymentProductId: number,
    context: PaymentProductSessionContext,
  ): Promise<CreatePaymentProductSessionResponseJSON>;
}
