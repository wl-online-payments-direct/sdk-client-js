import { expect, it } from 'vitest';
import { BasicPaymentProducts } from '../../models/BasicPaymentProducts';
import { BasicPaymentItems } from '../../models/BasicPaymentItems';

import { basePaymentProductJson } from '../__fixtures__/base-payment-product-json';
import { baseAccountOnFileJson } from '../__fixtures__/base-account-on-file-json';

const paymentProducts = [
    {
        ...basePaymentProductJson,
        id: 1,
        paymentMethod: 'card',
        paymentProductGroup: 'cards',
        accountsOnFile: [{ ...baseAccountOnFileJson, id: '1', paymentProductId: 1 }],
    },
    { ...basePaymentProductJson, id: 302, paymentMethod: 'mobile' },
    { ...basePaymentProductJson, id: 809, paymentMethod: 'redirect' },
    {
        ...basePaymentProductJson,
        id: 2,
        paymentMethod: 'card',
        paymentProductGroup: 'cards',
        accountsOnFile: [{ ...baseAccountOnFileJson, id: '2', paymentProductId: 2 }],
    },
    {
        ...basePaymentProductJson,
        id: 840,
        paymentMethod: 'redirect',
        accountsOnFile: [{ ...baseAccountOnFileJson, id: '3', paymentProductId: 840 }],
    },
];

const paymentProductIds = paymentProducts.map((p) => p.id).sort();
const items = new BasicPaymentItems(new BasicPaymentProducts({ paymentProducts }));

it('should have `basicPaymentItems` should contain all product', () => {
    const ids = items.basicPaymentItems.map((item) => item.id).sort();
    expect(ids).toEqual(paymentProductIds);
});

it.each(paymentProductIds)('`basicPaymentItemById[%i]` should contain corresponding BasicPaymentProduct` ', (id) => {
    expect(items.basicPaymentItemById[id]?.id).toBe(id);
});

it('should have correct `accountsOnFile`', () => {
    expect(items.accountsOnFile.map((aof) => aof.id).sort()).toEqual(['1', '2', '3']);
});
