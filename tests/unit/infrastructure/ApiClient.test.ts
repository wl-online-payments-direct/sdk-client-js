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
import type { PaymentContext, SdkConfiguration, SdkResponse } from '../../../src';
import { DefaultApiClient } from '../../../src/infrastructure/DefaultApiClient';
import { Util } from '../../../src/infrastructure/utils/Util';
import { ApiVersion } from '../../../src/infrastructure/models/ApiVersion';
import { CommunicationError } from '../../../src';

describe('ApiClient', () => {
    let apiClient: DefaultApiClient;
    let fetchMock: ReturnType<typeof vi.fn>;

    const configuration: SdkConfiguration = {
        appIdentifier: 'test-app',
    };

    const paymentContext: PaymentContext = {
        countryCode: 'US',
        amountOfMoney: {
            amount: 1000,
            currencyCode: 'USD',
        },
        isRecurring: false,
    };

    beforeEach(() => {
        vi.spyOn(Util, 'getMetadata').mockReturnValue({
            sdkCreator: 'test-creator',
            sdkIdentifier: 'test-identifier',
            platformIdentifier: 'test-platform-identifier',
            screenSize: '1200x900',
        });

        apiClient = new DefaultApiClient(
            'https://api.test.com',
            'customer123',
            'session456',
            configuration.appIdentifier,
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

        fetchMock.mockResolvedValueOnce(createJsonResponse(mockData));

        const result: SdkResponse<typeof cardPaymentProductJson> = await apiClient.get('/crypto/publickey');

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

        fetchMock.mockResolvedValueOnce(createJsonResponse(mockData, 201));

        const result = await apiClient.post('/create', {
            body: JSON.stringify({ data: 'test' }),
        });

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
        const expectedUrl =
            'https://api.test.com/v1/customer123/products?countryCode=US&isRecurring=false&amount=1000&currencyCode=USD';

        fetchMock.mockResolvedValueOnce(createJsonResponse(mockData));

        const result = await apiClient.getWithContext('products', paymentContext);

        expect(fetchMock).toHaveBeenCalledWith(
            expectedUrl,
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
        const expectedUrl =
            'https://api.test.com/v1/customer123/payments?countryCode=US&isRecurring=false&amount=1000&currencyCode=USD';

        fetchMock.mockResolvedValueOnce(createJsonResponse(mockData, 201));

        const result = await apiClient.postWithContext('payments', paymentContext, {
            body: JSON.stringify(postData),
        });

        expect(fetchMock).toHaveBeenCalledWith(
            expectedUrl,
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

    it('get throws CommunicationError when response is not JSON', async () => {
        fetchMock.mockResolvedValueOnce(createTextResponse('Not Found', 404));

        const error = await apiClient.get('/some-path').catch((e) => e);

        expect(error).toBeInstanceOf(CommunicationError);
        expect(error.httpStatusCode).toBe(404);
        expect(error.response).toBe('Not Found');
    });

    it('post throws CommunicationError when response is not JSON', async () => {
        fetchMock.mockResolvedValueOnce(createTextResponse('Internal Server Error', 500));

        const error = await apiClient.post('/some-path').catch((e) => e);

        expect(error).toBeInstanceOf(CommunicationError);
        expect(error.httpStatusCode).toBe(500);
        expect(error.response).toBe('Internal Server Error');
    });

    it('get returns success when response status is 304', async () => {
        fetchMock.mockResolvedValueOnce(createJsonResponse({}, 304, false));

        const result = await apiClient.get('/some-path');

        expect(result.success).toBe(true);
        expect(result.status).toBe(304);
    });

    it('getRequestHeaders returns authorization and client meta info', () => {
        const headers = apiClient.getRequestHeaders() as Record<string, string>;

        expect(headers['Authorization']).toBe('GCS v1Client:session456');
        expect(headers['X-GCS-ClientMetaInfo']).toBeDefined();
        expect(typeof headers['X-GCS-ClientMetaInfo']).toBe('string');
    });

    it('getWithContext adds cacheBust query param when cache buster is enabled', async () => {
        fetchMock.mockResolvedValueOnce(createJsonResponse({}));

        await apiClient.getWithContext('products', paymentContext, { useCacheBuster: true });

        const calledUrl: string = fetchMock.mock.calls[0][0] as string;
        expect(calledUrl).toContain('cacheBust=');
        expect(calledUrl).toContain('https://api.test.com/v1/customer123/products');
    });

    it('getWithContext appends additional query params to URL', async () => {
        fetchMock.mockResolvedValueOnce(createJsonResponse({}));

        await apiClient.getWithContext('products', paymentContext, { queryParams: { paymentProductId: 1 } });

        const calledUrl: string = fetchMock.mock.calls[0][0] as string;
        expect(calledUrl).toContain('paymentProductId=1');
        expect(calledUrl).toContain('https://api.test.com/v1/customer123/products');
    });

    it('getWithContext uses provided API version', async () => {
        fetchMock.mockResolvedValueOnce(createJsonResponse({}));

        await apiClient.getWithContext('products', paymentContext, {}, ApiVersion.V2);

        const calledUrl: string = fetchMock.mock.calls[0][0] as string;
        expect(calledUrl).toContain('https://api.test.com/v2/customer123/products');
    });

    it('get returns success:false with JSON body on 4xx response', async () => {
        const errorBody = { errorId: 'abc', errors: [{ code: '21000020', message: 'Refused' }] };
        fetchMock.mockResolvedValueOnce(createJsonResponse(errorBody, 400, false));

        const result = await apiClient.get('/some-path');

        expect(result.success).toBe(false);
        expect(result.status).toBe(400);
        expect(result.data).toEqual(errorBody);
    });

    it('get returns success:false with JSON body on 5xx response', async () => {
        const errorBody = { errorId: 'xyz', errors: [{ code: '500', message: 'Server Error' }] };
        fetchMock.mockResolvedValueOnce(createJsonResponse(errorBody, 500, false));

        const result = await apiClient.get('/some-path');

        expect(result.success).toBe(false);
        expect(result.status).toBe(500);
        expect(result.data).toEqual(errorBody);
    });

    it('get propagates error when fetch rejects (network failure)', async () => {
        fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));

        await expect(apiClient.get('/some-path')).rejects.toThrow('Failed to fetch');
    });

    it('post propagates error when fetch rejects (network failure)', async () => {
        fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));

        await expect(apiClient.post('/some-path', {})).rejects.toThrow('Failed to fetch');
    });

    it('get sends default Content-Type and Accept headers', async () => {
        fetchMock.mockResolvedValueOnce(createJsonResponse({}));

        await apiClient.get('/some-path');

        const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
        const headers = options.headers as Record<string, string>;
        expect(headers['Content-Type']).toBe('application/json');
        expect(headers['Accept']).toContain('application/json');
    });

    it('post merges caller headers with defaults and caller wins', async () => {
        fetchMock.mockResolvedValueOnce(createJsonResponse({}));

        await apiClient.post('/some-path', {
            headers: { 'X-Custom-Header': 'custom-value', 'Content-Type': 'text/plain' },
        });

        const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
        const headers = options.headers as Record<string, string>;
        expect(headers['X-Custom-Header']).toBe('custom-value');
        expect(headers['Content-Type']).toBe('text/plain');
    });
});

function createJsonResponse(data: unknown, status = 200, ok = true) {
    return {
        ok,
        status,
        headers: { get: vi.fn().mockReturnValue('application/json') },
        json: vi.fn().mockResolvedValue(data),
        text: vi.fn(),
    };
}

function createTextResponse(text: string, status = 400, ok = false) {
    return {
        ok,
        status,
        headers: { get: vi.fn().mockReturnValue('text/html') },
        json: vi.fn(),
        text: vi.fn().mockResolvedValue(text),
    };
}
