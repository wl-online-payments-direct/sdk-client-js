/*
 * Do not remove or alter the notices in this preamble.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import { cardPaymentProductJson } from '../../../__fixtures__/payment-product-json';
import { beforeEach, describe, expect, it } from 'vitest';
import { accountOnFileJson } from '../../../__fixtures__/account-on-file-json';
import { DefaultEncryptionService } from '../../../../src/services/DefaultEncryptionService';
import type { EncryptionService } from '../../../../src/services/interfaces/EncryptionService';
import { CacheManager } from '../../../../src/infrastructure/utils/CacheManager';
import { TestApiClient } from '../../testUtils/TestApiClient';
import {
    AccountOnFile,
    InvalidArgumentError,
    PaymentProduct,
    PaymentRequest,
    type SessionData,
    ValidationResult,
} from '../../../../src';
import { DefaultPaymentProductFactory } from '../../../../src/infrastructure/factories/DefaultPaymentProductFactory';

let paymentProduct: PaymentProduct;
let paymentRequest: PaymentRequest;
let accountOnFile: AccountOnFile;
let sessionData: SessionData;

beforeEach(() => {
    paymentProduct = new DefaultPaymentProductFactory().createPaymentProduct(cardPaymentProductJson);
    accountOnFile = new DefaultPaymentProductFactory().createAccountOnFile(accountOnFileJson);

    sessionData = {
        clientApiUrl: 'https://test-url',
        clientSessionId: '1',
        customerId: '1',
        assetUrl: 'test-url',
    };

    paymentRequest = new PaymentRequest(paymentProduct);
});

describe('getField', () => {
    it('should return field for existing field `expiryDate`', () => {
        const field = paymentRequest.getField('expiryDate');
        expect(field.getType()).toBe('expirydate');
        expect(field.getId()).toBe('expiryDate');
    });

    it('should return field for existing field `expiryDate`', () => {
        expect(() => paymentRequest.getField('someField')).toThrowError();
    });
});

describe('getValues', () => {
    it('should return correct length`', () => {
        const fieldExpiryDate = paymentRequest.getField('expiryDate');
        const fieldCvv = paymentRequest.getField('cvv');
        const fieldCardNumber = paymentRequest.getField('cardNumber');

        expect(fieldExpiryDate.getValue()).toBe(undefined);
        expect(fieldCvv.getValue()).toBe(undefined);
        expect(fieldCardNumber.getValue()).toBe(undefined);

        fieldExpiryDate.setValue('12-35');
        fieldCvv.setValue('123');
        fieldCardNumber.setValue('1234567890123456789');

        const fields = paymentRequest.getValues();

        expect(Object.keys(fields).length).toBe(3);

        expect(paymentRequest.getValue('expiryDate')).toBe('1235');
        expect(paymentRequest.getValue('cvv')).toBe('123');
        expect(paymentRequest.getValue('cardNumber')).toBe('1234567890123456789');

        expect(fieldExpiryDate.getValue()).toBe('1235');
        expect(fieldCvv.getValue()).toBe('123');
        expect(fieldCardNumber.getValue()).toBe('1234567890123456789');
    });
});

describe('get and set values', () => {
    it('should get value `123` for `cvv` fieldId', () => {
        const field = paymentRequest.getField('cvv');
        field.setValue('123');

        const value = paymentRequest.getValue('cvv');
        expect(value).toBe('123');
    });

    it('should set value `123` for `cvv` fieldId', () => {
        const field = paymentRequest.getField('cvv');
        expect(field.getValue()).toBe(undefined);

        paymentRequest.setValue('cvv', '123');
        const value = paymentRequest.getValue('cvv');
        expect(value).toBe('123');
    });
});

describe('setAccountOnFile and getAccountOnFile', () => {
    it('should set and get `accountOnFile`', () => {
        expect(paymentRequest.getAccountOnFile()).toBe(undefined);

        paymentRequest.setAccountOnFile(accountOnFile);

        expect(paymentRequest.getAccountOnFile()).not.toBe(undefined);
        expect(paymentRequest.getAccountOnFile()?.id).toBe('1234');
    });
});

describe('setTokenize and getTokenize', () => {
    it('should set and get `tokenize`', () => {
        expect(paymentRequest.getTokenize()).toBe(false);

        paymentRequest.setTokenize(true);

        expect(paymentRequest.getTokenize()).toBe(true);
    });
});

describe('Test values that are `READ_ONLY`', () => {
    beforeEach(() => {
        paymentProduct = new DefaultPaymentProductFactory().createPaymentProduct(cardPaymentProductJson);
        accountOnFile = new DefaultPaymentProductFactory().createAccountOnFile(accountOnFileJson);
        paymentRequest = new PaymentRequest(paymentProduct, accountOnFile);
    });

    it('should return undefined when `getValue` called for `READ_ONLY` fields', () => {
        expect(paymentRequest.getValue('cardNumber')).toBe(undefined);
    });

    it('should remove field values after setting accountOnFile, and return `undefined` if `READ_ONLY`', () => {
        const paymentRequest = new PaymentRequest(paymentProduct);
        expect(paymentRequest.getAccountOnFile()).toBe(undefined);

        paymentRequest.getField('cardNumber').setValue('1111111111');
        paymentRequest.setAccountOnFile(accountOnFile);

        expect(() => paymentRequest.getField('cardNumber').setValue('2222222222')).toThrowError();
        expect(paymentRequest.getField('cardNumber').getValue()).toBe(undefined);
        expect(paymentRequest.getAccountOnFile()).not.toBe(undefined);
        expect(paymentRequest.getAccountOnFile()?.id).toBe('1234');
    });
});

describe('validate', () => {
    it('should return errors for `cvv`, `cardNumber`, `expiryDate`: `Field required.` if no `accountOnFile` provided.', () => {
        paymentRequest = new PaymentRequest(paymentProduct);
        const validationResult = paymentRequest.validate();

        expect(validationResult.isValid).toBe(false);
        expect(validationResult.errors.length).toBe(3);
    });

    it('should return errors for `cvv`: `Field required.` if `accountOnFile` provided.', () => {
        paymentRequest.setAccountOnFile(accountOnFile);
        const validationResult = paymentRequest.validate();

        expect(validationResult.isValid).toBe(false);
        expect(validationResult.errors.length).toBe(1);
    });

    it('should return empty `errors` and `isValid` when all fields set correctly', () => {
        paymentRequest.setValue('cardNumber', '7822551678890142249');
        paymentRequest.setValue('expiryDate', '11/2026');
        paymentRequest.setValue('cvv', '123');
        paymentRequest.setValue('cardholderName', 'test');

        const validationResult = paymentRequest.validate();
        expect(validationResult.isValid).toBe(true);
        expect(validationResult.errors.length).toBe(0);
    });
});

describe('encrypt', () => {
    let service: EncryptionService;

    beforeEach(() => {
        sessionData = {
            clientApiUrl: 'https://test-url',
            clientSessionId: '1',
            customerId: '1',
            assetUrl: 'test-url',
        };

        paymentProduct = new DefaultPaymentProductFactory().createPaymentProduct(cardPaymentProductJson);

        paymentRequest = new PaymentRequest(paymentProduct);
        service = new DefaultEncryptionService(sessionData, new CacheManager(), new TestApiClient());
    });

    it('should throw error if mandatory data not set', async () => {
        try {
            await service.encryptPaymentRequest(paymentRequest);
        } catch (error: unknown) {
            expect(error).toBeInstanceOf(InvalidArgumentError);
            expect(((error as InvalidArgumentError).metadata as { data: ValidationResult })!.data).toBeInstanceOf(
                ValidationResult,
            );
        }
    });
});
