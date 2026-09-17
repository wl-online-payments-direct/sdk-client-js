/*
 * Do not remove or alter the notices in this preamble.
 *
 * This software is owned by Worldline and may not be be altered, copied, reproduced, republished, uploaded, posted, transmitted or distributed in any way, without the prior written consent of Worldline.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { basePaymentProductJson, basePaymentProductJson2 } from '../../../__fixtures__/base-payment-product-json';
import { cardPaymentProductJson } from '../../../__fixtures__/payment-product-json';
import { accountOnFileJson, accountOnFileJson2 } from '../../../__fixtures__/account-on-file-json';
import { BasicPaymentProduct, ProductFieldDisplayHints, PaymentProduct5002SpecificData } from '../../../../src';
import { DefaultPaymentProductFactory } from '../../../../src/infrastructure/factories/DefaultPaymentProductFactory';

describe('DefaultPaymentProductFactory', () => {
    let factory: DefaultPaymentProductFactory;

    beforeEach(() => {
        factory = new DefaultPaymentProductFactory();
    });

    it('createBasicPaymentProduct should return BasicPaymentProduct instance', () => {
        const product = factory.createBasicPaymentProduct(basePaymentProductJson);

        expect(product).toBeInstanceOf(BasicPaymentProduct);
        expect(product.id).toBe(1);
        expect(product.accountsOnFile.length).toBe(1);
    });

    it('createBasicPaymentProducts should return a list of BasicPaymentProduct instances', () => {
        const basicPaymentProducts = factory.createBasicPaymentProducts({
            paymentProducts: [basePaymentProductJson, basePaymentProductJson2],
        });

        expect(basicPaymentProducts.paymentProducts[0]).toBeInstanceOf(BasicPaymentProduct);
        expect(basicPaymentProducts.paymentProducts[0].id).toBe(1);

        expect(basicPaymentProducts.paymentProducts[1]).toBeInstanceOf(BasicPaymentProduct);
        expect(basicPaymentProducts.paymentProducts[1].id).toBe(2);
    });

    it('createBasicPaymentProducts deduplicates accounts on file shared across multiple products', () => {
        const product1 = { ...basePaymentProductJson, accountsOnFile: [accountOnFileJson, accountOnFileJson2] };
        const product2 = { ...basePaymentProductJson2, accountsOnFile: [accountOnFileJson, accountOnFileJson2] };

        const result = factory.createBasicPaymentProducts({ paymentProducts: [product1, product2] });

        const ids = result.accountsOnFile.map((a) => a.id);
        expect(ids).toHaveLength(2);
        expect(ids).toContain(accountOnFileJson.id);
        expect(ids).toContain(accountOnFileJson2.id);
    });

    it('createBasicPaymentProduct maps paymentProduct320SpecificData from DTO', () => {
        const product = factory.createBasicPaymentProduct(basePaymentProductJson);

        expect(product.paymentProduct320SpecificData).toEqual(basePaymentProductJson.paymentProduct320SpecificData);
    });

    it('createPaymentProduct sorts fields by displayOrder ascending', () => {
        const product = factory.createPaymentProduct(cardPaymentProductJson);
        const fields = product.getFields();

        for (let i = 1; i < fields.length; i++) {
            expect(fields[i].getDisplayOrder()).toBeGreaterThanOrEqual(fields[i - 1].getDisplayOrder());
        }
        expect(fields[0].id).toBe('cardNumber');
    });

    it('createDisplayHintsForField uses default values when DTO is undefined', () => {
        const hints = factory.createDisplayHintsForField(undefined);

        expect(hints).toBeInstanceOf(ProductFieldDisplayHints);
        expect(hints.label).toBe('');
        expect(hints.mask).toBe('');
        expect(hints.obfuscate).toBe(false);
        expect(hints.displayOrder).toBe(Number.MAX_VALUE);
    });

    it('createDataRestrictions defaults isRequired to false when missing from DTO', () => {
        const restrictions = factory.createDataRestrictions({ validators: {} } as never);

        expect(restrictions.isRequired).toBe(false);
    });

    it('createBasicPaymentProduct maps paymentProduct5002SpecificData from DTO', () => {
        const mastercard = { srcInitiatorId: 'mc-initiator', srciDpaId: 'mc-dpa' };
        const product = factory.createBasicPaymentProduct({
            ...basePaymentProductJson,
            paymentProduct5002SpecificData: new PaymentProduct5002SpecificData({ mastercard }),
        });

        expect(product.paymentProduct5002SpecificData?.apiParameters?.mastercard).toEqual(mastercard);
        expect(product.paymentProduct5002SpecificData?.apiParameters?.visa).toBeUndefined();
    });
});
