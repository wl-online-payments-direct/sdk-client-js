import { PaymentProduct } from '../../domain/paymentProduct/PaymentProduct';
import type { PaymentProductFactory } from '../interfaces/PaymentProductFactory';
import { BasicPaymentProduct } from '../../domain/paymentProduct/BasicPaymentProduct';
import type { BasicPaymentProductJson, PaymentProductJson, PaymentProductsJson } from '../../types';
import { BasicPaymentProducts } from '../../dataModel';

export class DefaultPaymentProductFactory implements PaymentProductFactory {
    createPaymentProduct(json: PaymentProductJson): PaymentProduct {
        return new PaymentProduct(json);
    }

    createBasicPaymentProduct(json: BasicPaymentProductJson): BasicPaymentProduct {
        return new BasicPaymentProduct(json);
    }

    createBasicPaymentProducts(json: PaymentProductsJson) {
        return new BasicPaymentProducts(json);
    }
}
