import { BasicPaymentProduct } from '../domain/paymentProduct/BasicPaymentProduct';
import type { PaymentProductsJson } from '../types';
import type { AccountOnFile } from '../domain/paymentProduct/AccountOnFile';

function _parseJson(
    json: PaymentProductsJson,
    paymentProducts: BasicPaymentProduct[],
    accountsOnFile: AccountOnFile[],
) {
    if (!json.paymentProducts) {
        return;
    }

    json.paymentProducts.forEach((product) => {
        const paymentProduct = new BasicPaymentProduct(product);
        paymentProducts.push(paymentProduct);

        paymentProduct.accountsOnFile.forEach((aof) => {
            if (!accountsOnFile.find((a) => a.id === aof.id)) {
                accountsOnFile.push(aof);
            }
        });
    });
}

export class BasicPaymentProducts {
    readonly paymentProducts: BasicPaymentProduct[];
    readonly accountsOnFile: AccountOnFile[];

    constructor(Json: PaymentProductsJson) {
        this.paymentProducts = [];
        this.accountsOnFile = [];

        _parseJson(Json, this.paymentProducts, this.accountsOnFile);
    }
}
