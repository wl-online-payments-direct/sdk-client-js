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

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cardPaymentProductJson } from '../../__fixtures__/payment-product-json';
import { publicKeyResponse } from '../../__fixtures__/public-key-response';
import { DefaultEncryptionService } from '../../../src/services/DefaultEncryptionService';
import { PaymentRequest, CreditCardTokenRequest } from '../../../src';
import { CacheManager } from '../../../src/infrastructure/utils/CacheManager';
import { TestApiClient } from '../testUtils/TestApiClient';
import { PublicKeyResponse, ResponseError, type SdkConfiguration, type SessionData } from '../../../src';
import { DefaultPaymentProductFactory } from '../../../src/infrastructure/factories/DefaultPaymentProductFactory';
import { Encryptor } from '../../../src/infrastructure/encryption/Encryptor';

let service: DefaultEncryptionService;

const sessionData: SessionData = {
    clientSessionId: 'test-session-id',
    customerId: 'test-customer-id',
    assetUrl: 'test-url',
    clientApiUrl: 'https://test-client-api',
};

const configuration: SdkConfiguration = {
    appIdentifier: 'test-appIdentifier',
};

beforeEach(() => {
    service = new DefaultEncryptionService(sessionData, new CacheManager(), new TestApiClient(), configuration);
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe('DefaultEncryptionService', () => {
    const createValidPaymentRequest = () => {
        const paymentProduct = new DefaultPaymentProductFactory().createPaymentProduct(cardPaymentProductJson);
        const request = new PaymentRequest(paymentProduct);
        request.setValue('cvv', '123');
        request.setValue('expiryDate', '12/2036');
        request.setValue('cardNumber', '4242424242424242');
        return request;
    };

    const createValidTokenRequest = () => {
        const token = new CreditCardTokenRequest();
        token.setSecurityCode('123');
        token.setCardNumber('424242424242');
        token.setProductPaymentId(1);
        return token;
    };

    it('encryptPaymentRequest returns encrypted customer input', async () => {
        const request = createValidPaymentRequest();

        getTestApiSpy();

        const result = await service.encryptPaymentRequest(request);

        expect(result).toHaveProperty('encryptedCustomerInput');
        expect(result.encryptedCustomerInput).toBeDefined();
    });

    it('encryptTokenRequest returns encrypted customer input', async () => {
        const token = createValidTokenRequest();

        getTestApiSpy();
        const result = await service.encryptTokenRequest(token);

        expect(result).toHaveProperty('encryptedCustomerInput');
        expect(result.encryptedCustomerInput).toBeDefined();
    });

    it('getPublicKey returns from cache when available', async () => {
        const apiSpy = getTestApiSpy();
        const cacheHasSpy = vi.spyOn(CacheManager.prototype, 'has').mockReturnValue(true);
        const cacheGetSpy = vi.spyOn(CacheManager.prototype, 'get').mockReturnValue(publicKeyResponse);
        const result = await service.getPublicKey();

        expect(cacheHasSpy).toHaveBeenCalledWith('publicKey');
        expect(cacheGetSpy).toHaveBeenCalledWith('publicKey');
        expect(apiSpy).not.toHaveBeenCalled();
        expect(result).toBe(publicKeyResponse);
    });

    it('getPublicKey fetches from API when not cached', async () => {
        const publicKeyDto: PublicKeyResponse = {
            keyId: 'test-key-id',
            publicKey: 'test-public-key',
        };

        const cacheSetSpy = vi.spyOn(CacheManager.prototype, 'set');
        const apiSpy = getTestApiSpy(publicKeyDto);

        const result = await service.getPublicKey();

        expect(apiSpy).toHaveBeenCalledWith('/crypto/publickey');
        expect(cacheSetSpy).toHaveBeenCalledWith('publicKey', expect.any(Object));
        expect(result).toBeInstanceOf(Object);
        expect(result.keyId).toBe('test-key-id');
    });

    it('getPublicKey throws ResponseError when API response is invalid', async () => {
        vi.spyOn(TestApiClient.prototype, 'get').mockResolvedValue({ success: false, status: 400, data: undefined });

        const promise = service.getPublicKey();

        await expect(promise).rejects.toThrow(ResponseError);
        await expect(promise).rejects.toThrow('Error while trying to fetch the public key.');
    });

    it('encryptPaymentRequest returns encodedClientMetaInfo', async () => {
        const request = createValidPaymentRequest();
        getTestApiSpy();

        const result = await service.encryptPaymentRequest(request);

        expect(result.encodedClientMetaInfo).toBeDefined();
        expect(result.encodedClientMetaInfo).toBeTruthy();
    });

    it('encryptPaymentRequest uses Encryptor.encrypt when request is a PaymentRequest', async () => {
        const request = createValidPaymentRequest();
        const encryptSpy = vi.spyOn(Encryptor.prototype, 'encrypt');
        const encryptTokenSpy = vi.spyOn(Encryptor.prototype, 'encryptTokenRequest');
        getTestApiSpy();

        await service.encryptPaymentRequest(request);

        expect(encryptSpy).toHaveBeenCalledWith(publicKeyResponse, request);
        expect(encryptTokenSpy).not.toHaveBeenCalled();
    });

    it('encryptTokenRequest returns encodedClientMetaInfo', async () => {
        const token = createValidTokenRequest();
        getTestApiSpy();

        const result = await service.encryptTokenRequest(token);

        expect(result.encodedClientMetaInfo).toBeDefined();
        expect(result.encodedClientMetaInfo).toBeTruthy();
    });

    it('encryptPaymentRequest throws InvalidArgumentError when PaymentRequest is invalid', async () => {
        const paymentProduct = new DefaultPaymentProductFactory().createPaymentProduct(cardPaymentProductJson);
        const request = new PaymentRequest(paymentProduct);
        // Intentionally leave required fields unset so validation fails

        getTestApiSpy();

        await expect(service.encryptPaymentRequest(request)).rejects.toThrow('The payment request is not valid.');
    });

    it('encryptTokenRequest uses Encryptor.encryptTokenRequest when request is a CreditCardTokenRequest', async () => {
        const token = createValidTokenRequest();
        const encryptTokenSpy = vi.spyOn(Encryptor.prototype, 'encryptTokenRequest');
        const encryptSpy = vi.spyOn(Encryptor.prototype, 'encrypt');
        getTestApiSpy();

        await service.encryptTokenRequest(token);

        expect(encryptTokenSpy).toHaveBeenCalledWith(publicKeyResponse, token);
        expect(encryptSpy).not.toHaveBeenCalled();
    });
});

function getTestApiSpy(publicKeyJson: PublicKeyResponse = publicKeyResponse) {
    return vi.spyOn(TestApiClient.prototype, 'get').mockResolvedValue({
        success: true,
        status: 200,
        data: publicKeyJson,
    });
}
