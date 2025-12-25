import type { PaymentProduct } from '../../domain/paymentProduct/PaymentProduct';
import type { BasicPaymentProduct } from '../../domain/paymentProduct/BasicPaymentProduct';
import type { BasicPaymentProductJson, PaymentProductJson, PaymentProductsJson } from '../../types';
import type { BasicPaymentProducts } from '../../dataModel';

export interface PaymentProductFactory {
    createPaymentProduct(json: PaymentProductJson): PaymentProduct;

    createBasicPaymentProduct(json: BasicPaymentProductJson): BasicPaymentProduct;

    createBasicPaymentProducts(json: PaymentProductsJson): BasicPaymentProducts;
}
