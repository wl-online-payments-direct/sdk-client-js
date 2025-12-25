import { beforeEach, describe, expect, it } from 'vitest';
import { basePaymentProductJson } from '../../../__fixtures__/base-payment-product-json';
import { BasicPaymentProduct } from '../../../../src/domain/paymentProduct/BasicPaymentProduct';

let basicPaymentProduct: BasicPaymentProduct;
beforeEach(() => {
    basicPaymentProduct = new BasicPaymentProduct(basePaymentProductJson);
});

describe('getLabel', () => {
    it('should return `Test label`', () => {
        expect(basicPaymentProduct.label).toBe('Test label');
    });
});

describe('getLogo', () => {
    it('should return `test-logo`', () => {
        expect(basicPaymentProduct.logo).toBe('test-logo');
    });
});

describe('paymentProductSpecificData', () => {
    it('should not be undefined: `paymentProductSpecific302Data`', () => {
        const paymentProduct302SpecificData = basicPaymentProduct.paymentProduct302SpecificData;

        expect(paymentProduct302SpecificData).toBeDefined();
        expect(paymentProduct302SpecificData?.networks).toEqual(['test network 1', 'test network 2', 'test network 3']);
    });

    it('should not be undefined: `paymentProductSpecific320Data`', () => {
        const paymentProduct320SpecificData = basicPaymentProduct.paymentProduct320SpecificData;

        expect(paymentProduct320SpecificData).toBeDefined();
        expect(paymentProduct320SpecificData?.networks).toEqual(['test network 1', 'test network 2', 'test network 3']);
        expect(paymentProduct320SpecificData?.gateway).toEqual('test gateway');
    });
});

describe('getAccountsOnFile', () => {
    it('should return list of accounts with length: 1', () => {
        const accountsOnFile = basicPaymentProduct.accountsOnFile;

        expect(accountsOnFile.length).toBe(1);
        expect(accountsOnFile[0].id).toEqual('1234');
        expect(accountsOnFile[0].paymentProductId).toEqual(1);
    });
});

describe('getAccountOnFile', () => {
    it('should return `accountOnFile` for existing id', () => {
        const accountOnFile = basicPaymentProduct.getAccountOnFile('1234');

        expect(accountOnFile).toBeDefined();
        expect(accountOnFile!.id).toEqual('1234');
        expect(accountOnFile!.paymentProductId).toEqual(1);
    });

    it('should return `undefined` for nonexisting id', () => {
        const accountOnFile = basicPaymentProduct.getAccountOnFile('0');

        expect(accountOnFile).toBe(undefined);
    });
});
