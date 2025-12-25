import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cardPaymentProductJson } from '../../__fixtures__/payment-product-json';
import { publicKeyResponse } from '../../__fixtures__/public-key-response';
import { PaymentProduct } from '../../../src/domain/paymentProduct/PaymentProduct';
import { DefaultEncryptionService } from '../../../src/services/DefaultEncryptionService';
import { PaymentRequest } from '../../../src/domain/paymentRequest/PaymentRequest';
import { CreditCardTokenRequest } from '../../../src/domain/paymentRequest/CreditCardTokenRequest';
import { PublicKeyResponse } from '../../../src/dataModel';
import type { PublicKeyJson, SdkConfiguration, SessionData } from '../../../src/types';
import { CacheManager } from '../../../src/infrastructure/utils/CacheManager';
import { TestApiClient } from '../testUtils/TestApiClient';

let service: DefaultEncryptionService;
let sessionData: SessionData;
let configuration: SdkConfiguration;

beforeEach(() => {
    sessionData = {
        clientSessionId: 'test-session-id',
        customerId: 'test-customer-id',
        assetUrl: 'test-url',
        clientApiUrl: 'https://test-client-api',
    };

    configuration = {
        appIdentifier: 'test-appIdentifier',
    };

    service = new DefaultEncryptionService(sessionData, new CacheManager(), new TestApiClient(), configuration);
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe('DefaultEncryptionService (integration)', () => {
    it('encryptPaymentRequest returns encryptedFields', async () => {
        const paymentProduct = new PaymentProduct(cardPaymentProductJson);
        const request = new PaymentRequest(paymentProduct);

        request.setValue('cvv', '123');
        request.setValue('expiryDate', '12/2026');
        request.setValue('cardNumber', '4242424242424242');

        getTestApiSpy();
        const result = await service.encryptPaymentRequest(request);

        expect(result).toHaveProperty('encryptedCustomerInput');
        expect(result.encryptedCustomerInput).toBeDefined();
    });

    it('encryptTokenRequest returns encryptedFields', async () => {
        const token = new CreditCardTokenRequest();

        token.setSecurityCode('123');
        token.setCardNumber('424242424242');
        token.setProductPaymentId(1);

        getTestApiSpy();
        const result = await service.encryptTokenRequest(token);

        expect(result).toHaveProperty('encryptedCustomerInput');
        expect(result.encryptedCustomerInput).toBeDefined();
    });

    it('getPublicKey returns from cache when available', async () => {
        const apiSpy = getTestApiSpy();
        const cacheHasSpy = vi.spyOn(CacheManager.prototype, 'has').mockResolvedValue(true);
        const cacheGetSpy = vi.spyOn(CacheManager.prototype, 'get').mockResolvedValue(publicKeyResponse);
        const result = await service.getPublicKey();

        expect(cacheHasSpy).toHaveBeenCalledWith('publicKey');
        expect(cacheGetSpy).toHaveBeenCalledWith('publicKey');
        expect(apiSpy).not.toHaveBeenCalled();
        expect(result).toBe(publicKeyResponse);
    });

    it('getPublicKey fetches from API when not cached', async () => {
        const publicKeyJson: PublicKeyJson = {
            keyId: 'test-key-id',
            publicKey: 'test-public-key',
        };

        const cacheSetSpy = vi.spyOn(CacheManager.prototype, 'set');

        const apiSpy = getTestApiSpy(publicKeyJson);

        const result = await service.getPublicKey();

        expect(apiSpy).toHaveBeenCalledWith('/crypto/publickey');
        expect(cacheSetSpy).toHaveBeenCalledWith('publicKey', expect.any(Object));
        expect(result).toBeInstanceOf(Object);
        expect(result.keyId).toBe('test-key-id');
    });
});

function getTestApiSpy(publicKeyJson?: PublicKeyResponse) {
    return vi
        .spyOn(TestApiClient.prototype, 'get')
        .mockReturnValue(Promise.resolve({ success: true, status: 200, data: publicKeyJson ?? publicKeyResponse }));
}
