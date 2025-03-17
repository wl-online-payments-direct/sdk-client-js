import type { MapById } from '../types';
import type { BasicPaymentItem } from './BasicPaymentItem';
import type { AccountOnFile } from './AccountOnFile';
import type { BasicPaymentProducts } from './BasicPaymentProducts';

function _parseJson(
    _products: BasicPaymentProducts,
    { basicPaymentItems, basicPaymentItemById, accountsOnFile, accountOnFileById }: BasicPaymentItems,
) {
    basicPaymentItems.push(..._products.basicPaymentProducts.map((p) => p.copy()));
    for (const basicPaymentItem of _products.basicPaymentProducts) {
        basicPaymentItemById[basicPaymentItem.id] = basicPaymentItem;
        if (basicPaymentItem.accountsOnFile) {
            for (const aof of basicPaymentItem.accountsOnFile) {
                accountsOnFile.push(aof);
                accountOnFileById[aof.id] = aof;
            }
        }
    }
}

export class BasicPaymentItems {
    readonly basicPaymentItems: BasicPaymentItem[];
    readonly basicPaymentItemById: MapById<BasicPaymentItem>;
    readonly accountsOnFile: AccountOnFile[];
    readonly accountOnFileById: MapById<AccountOnFile>;

    constructor(products: BasicPaymentProducts) {
        this.basicPaymentItems = [];
        this.basicPaymentItemById = {};
        this.accountsOnFile = [];
        this.accountOnFileById = {};

        _parseJson(products, this);
    }
}
