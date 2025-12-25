import { beforeEach, describe, expect, it } from 'vitest';
import { accountOnFileJson } from '../../../__fixtures__/account-on-file-json';
import { AccountOnFile } from '../../../../src/domain/paymentProduct/AccountOnFile';

let accountOnFile: AccountOnFile;
beforeEach(() => {
    accountOnFile = new AccountOnFile(accountOnFileJson);
});

describe('getLabel', () => {
    it('should return label as `4111 11XX XXXX 1111`', () => {
        const label = accountOnFile.label;
        expect(label).toBe('4111 11XX XXXX 1111');
    });
});

describe('id and paymentProductId', () => {
    it('should be `1234` for `id` field', () => {
        expect(accountOnFile.id).toBe('1234');
    });

    it('should be `1` for `paymentProductId` field', () => {
        expect(accountOnFile.paymentProductId).toBe(1);
    });
});

describe('getRequiredAttributes', () => {
    it('should return attributes with status `MUST_WRITE`', () => {
        const requiredAttributes = accountOnFile.getRequiredAttributes();

        expect(requiredAttributes.length).toBe(1);
        expect(requiredAttributes).toEqual([
            {
                key: 'cvv',
                status: 'MUST_WRITE',
                value: '',
            },
        ]);
    });
});

describe('isWritable', () => {
    it('should return `false` for cardNumber', () => {
        const isWritable = accountOnFile.isWritable('cardNumber');
        expect(isWritable).toBe(false);
    });

    it('should return `true` for cvv', () => {
        const isWritable = accountOnFile.isWritable('cvv');
        expect(isWritable).toBe(true);
    });
});

describe('getValue', () => {
    it('should return `9999-9999-9999-9999` for cardNumber', () => {
        const value = accountOnFile.getValue('cardNumber');
        expect(value).toBe('9999-9999-9999-9999');
    });

    it('should return `` for cvv', () => {
        const value = accountOnFile.getValue('cvv');
        expect(value).toBe('');
    });
});
