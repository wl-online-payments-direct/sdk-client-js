import type { BasicPaymentProducts } from '../../dataModel';
import type { PaymentProduct } from '../../domain/paymentProduct/PaymentProduct';
import type { PaymentContext, PaymentProductNetworksResponseJson } from '../../types';

export interface PaymentProductService {
    getBasicPaymentProducts(context: PaymentContext): Promise<BasicPaymentProducts>;

    getPaymentProduct(paymentProductId: number, context: PaymentContext): Promise<PaymentProduct>;

    getPaymentProductNetworks(
        paymentProductId: number,
        context: PaymentContext,
    ): Promise<PaymentProductNetworksResponseJson>;
}
