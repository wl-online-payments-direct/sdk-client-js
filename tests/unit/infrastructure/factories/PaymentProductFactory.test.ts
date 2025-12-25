import { describe, expect, it } from 'vitest';
import { basePaymentProductJson, basePaymentProductJson2 } from '../../../__fixtures__/base-payment-product-json';
import { BasicPaymentProduct } from '../../../../src/domain/paymentProduct/BasicPaymentProduct';
import { DefaultPaymentProductFactory } from '../../../../src/infrastructure/factories/DefaultPaymentProductFactory';

describe('DefaultPaymentProductFactory', () => {
    const factory = new DefaultPaymentProductFactory();

    it('createBasicPaymentProduct should return BasicPaymentProduct instance', () => {
        const product = factory.createBasicPaymentProduct(basePaymentProductJson);

        expect(product).toBeInstanceOf(BasicPaymentProduct);
        expect(product.id).toBe(1);
        expect(product.accountsOnFile.length).toBe(1);
    });

    it('createBasicPaymentProducts should return a list of BasicPaymentProduct instances', () => {
        const product = factory.createBasicPaymentProducts({
            paymentProducts: [basePaymentProductJson, basePaymentProductJson2],
        });

        expect(product.paymentProducts[0]).toBeInstanceOf(BasicPaymentProduct);
        expect(product.paymentProducts[0].id).toBe(1);

        expect(product.paymentProducts[1]).toBeInstanceOf(BasicPaymentProduct);
        expect(product.paymentProducts[1].id).toBe(2);
    });
});
