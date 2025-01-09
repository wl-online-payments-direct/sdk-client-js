import type { MapById, PaymentProductsJSON } from '../types';
import type { AccountOnFile } from './AccountOnFile';

import { BasicPaymentProduct } from './BasicPaymentProduct';

function _parseJson(
    _json: PaymentProductsJSON,
    _paymentProducts: BasicPaymentProduct[],
    _accountsOnFile: AccountOnFile[],
    _paymentProductById: MapById<BasicPaymentProduct>,
    _accountOnFileById: MapById<AccountOnFile>,
    _paymentProductByAccountOnFileId: MapById<BasicPaymentProduct>,
) {
    if (!_json.paymentProducts) {
        return;
    }

    for (const product of _json.paymentProducts) {
        const paymentProduct = new BasicPaymentProduct(product);
        _paymentProducts.push(paymentProduct);
        _paymentProductById[paymentProduct.id] = paymentProduct;

        if (paymentProduct.accountsOnFile) {
            for (const aof of paymentProduct.accountsOnFile) {
                _accountsOnFile.push(aof);
                _accountOnFileById[aof.id] = aof;
                _paymentProductByAccountOnFileId[aof.id] = paymentProduct;
            }
        }
    }
}

export class BasicPaymentProducts {
    readonly basicPaymentProducts: BasicPaymentProduct[];
    readonly basicPaymentProductById: MapById<BasicPaymentProduct>;
    readonly basicPaymentProductByAccountOnFileId: MapById<BasicPaymentProduct>;
    readonly accountsOnFile: AccountOnFile[];
    readonly accountOnFileById: MapById<AccountOnFile>;

    constructor(readonly json: PaymentProductsJSON) {
        this.basicPaymentProducts = [];
        this.basicPaymentProductById = {};
        this.basicPaymentProductByAccountOnFileId = {};
        this.accountsOnFile = [];
        this.accountOnFileById = {};

        _parseJson(
            json,
            this.basicPaymentProducts,
            this.accountsOnFile,
            this.basicPaymentProductById,
            this.accountOnFileById,
            this.basicPaymentProductByAccountOnFileId,
        );
    }
}
