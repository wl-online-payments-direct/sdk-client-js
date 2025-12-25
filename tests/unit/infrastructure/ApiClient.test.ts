import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cardPaymentProductJson } from '../../__fixtures__/payment-product-json';
import type { PaymentContext, SdkConfiguration } from '../../../src/types';
import { ApiVersion, type SdkResponse } from '../../../src/types';
import { DefaultApiClient } from '../../../src/infrastructure/DefaultApiClient';
import { Util } from '../../../src/infrastructure/utils/Util';
import { UrlUtil } from '../../../src/infrastructure/utils/UrlUtil';

describe('ApiClient', () => {
    let apiClient: DefaultApiClient;
    let fetchMock: ReturnType<typeof vi.fn>;
    let segmentsToPathSpy: ReturnType<typeof vi.spyOn>;
    let urlWithQueryStringSpy: ReturnType<typeof vi.spyOn>;

    const mockConfiguration: SdkConfiguration = {
        appIdentifier: 'test-app',
    };

    const mockContext: PaymentContext = {
        countryCode: 'US',
        amountOfMoney: {
            amount: 1000,
            currencyCode: 'USD',
        },
        isRecurring: false,
    };

    beforeEach(() => {
        segmentsToPathSpy = vi.spyOn(UrlUtil, 'segmentsToPath');
        urlWithQueryStringSpy = vi.spyOn(UrlUtil, 'urlWithQueryString');

        vi.spyOn(Util, 'getMetadata').mockReturnValue({
            sdkCreator: 'test-creator',
            sdkIdentifier: 'test-identifier',
            platformIdentifier: 'test-platform-identifier',
            screenSize: '1200x900',
        });

        apiClient = new DefaultApiClient(
            ApiVersion.V1,
            'https://api.test.com',
            'customer123',
            'session456',
            mockConfiguration.appIdentifier,
        );

        fetchMock = vi.fn();
        vi.stubGlobal('fetch', fetchMock);
        vi.stubGlobal('window', {
            btoa: (str: string) => Buffer.from(str).toString('base64'),
        });
        vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it('should handle GET requests', async () => {
        const mockData = { ...cardPaymentProductJson };
        const expectedUrl = 'https://api.test.com/v1/customer123/crypto/publickey';

        segmentsToPathSpy.mockReturnValueOnce(expectedUrl);

        fetchMock.mockResolvedValueOnce({
            ok: true,
            status: 200,
            headers: {
                get: vi.fn().mockReturnValue('application/json'),
            },
            json: vi.fn().mockResolvedValue(mockData),
            text: vi.fn(),
        });

        const result: SdkResponse<typeof cardPaymentProductJson> = await apiClient.get('/crypto/publickey');

        expect(segmentsToPathSpy).toHaveBeenCalledWith([
            'https://api.test.com',
            ApiVersion.V1,
            'customer123',
            '/crypto/publickey',
        ]);

        expect(fetchMock).toHaveBeenCalledWith(
            expectedUrl,
            expect.objectContaining({
                method: 'GET',
                headers: expect.objectContaining({
                    'X-GCS-ClientMetaInfo': expect.any(String),
                    Authorization: 'GCS v1Client:session456',
                }),
            }),
        );

        expect(result.status).toBe(200);
        expect(result.success).toBe(true);
        expect(result.data).toEqual(cardPaymentProductJson);
    });

    it('should handle POST requests', async () => {
        const mockData = { success: true };
        const expectedUrl = 'https://api.test.com/v1/customer123/create';

        segmentsToPathSpy.mockReturnValueOnce(expectedUrl);

        fetchMock.mockResolvedValueOnce({
            ok: true,
            status: 201,
            headers: {
                get: vi.fn().mockReturnValue('application/json'),
            },
            json: vi.fn().mockResolvedValue(mockData),
            text: vi.fn(),
        });

        const result = await apiClient.post('/create', {
            body: JSON.stringify({ data: 'test' }),
        });

        expect(segmentsToPathSpy).toHaveBeenCalledWith([
            'https://api.test.com',
            ApiVersion.V1,
            'customer123',
            '/create',
        ]);

        expect(fetchMock).toHaveBeenCalledWith(
            expectedUrl,
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({ data: 'test' }),
                headers: expect.objectContaining({
                    'X-GCS-ClientMetaInfo': expect.any(String),
                    Authorization: 'GCS v1Client:session456',
                }),
            }),
        );

        expect(result.status).toBe(201);
        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockData);
    });

    it('should handle GET with context', async () => {
        const mockData = { products: [] };
        const expectedBaseUrl = 'https://api.test.com/v1/customer123/products';
        const expectedFullUrl = `${expectedBaseUrl}?countryCode=US&isRecurring=false&amount=1000&currencyCode=USD`;

        segmentsToPathSpy.mockReturnValueOnce(expectedBaseUrl);
        urlWithQueryStringSpy.mockReturnValueOnce(expectedFullUrl);

        fetchMock.mockResolvedValueOnce({
            ok: true,
            status: 200,
            headers: {
                get: vi.fn().mockReturnValue('application/json'),
            },
            json: vi.fn().mockResolvedValue(mockData),
            text: vi.fn(),
        });

        const result = await apiClient.getWithContext('products', mockContext);

        expect(segmentsToPathSpy).toHaveBeenCalledWith([
            'https://api.test.com',
            ApiVersion.V1,
            'customer123',
            'products',
        ]);

        expect(urlWithQueryStringSpy).toHaveBeenCalledWith(expectedBaseUrl, {
            countryCode: 'US',
            isRecurring: 'false',
            amount: '1000',
            currencyCode: 'USD',
            cacheBust: undefined,
        });

        expect(fetchMock).toHaveBeenCalledWith(
            expectedFullUrl,
            expect.objectContaining({
                method: 'GET',
            }),
        );

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockData);
    });

    it('should handle POST with context', async () => {
        const mockData = { paymentId: '123' };
        const postData = { cardNumber: '4111111111111111' };
        const expectedBaseUrl = 'https://api.test.com/v1/customer123/payments';
        const expectedFullUrl = `${expectedBaseUrl}?countryCode=US&isRecurring=false&amount=1000&currencyCode=USD`;

        segmentsToPathSpy.mockReturnValueOnce(expectedBaseUrl);
        urlWithQueryStringSpy.mockReturnValueOnce(expectedFullUrl);

        fetchMock.mockResolvedValueOnce({
            ok: true,
            status: 201,
            headers: {
                get: vi.fn().mockReturnValue('application/json'),
            },
            json: vi.fn().mockResolvedValue(mockData),
            text: vi.fn(),
        });

        const result = await apiClient.postWithContext('payments', mockContext, {
            body: JSON.stringify(postData),
        });

        expect(fetchMock).toHaveBeenCalledWith(
            expectedFullUrl,
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify(postData),
                headers: expect.objectContaining({
                    Authorization: 'GCS v1Client:session456',
                }),
            }),
        );

        expect(result.status).toBe(201);
        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockData);
    });
});
