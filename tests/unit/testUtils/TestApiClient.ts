import { type ApiClient } from '../../../src/infrastructure/interfaces/ApiClient';
import { ApiVersion, type SdkResponse } from '../../../src/types';
import { type PaymentContext } from '../../../src/types/context/PaymentContext';

export class TestApiClient implements ApiClient {
    /**
     * Wrapper around fetch method GET
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async get<Data>(_path: string, _options?: RequestInit, _apiVersion?: ApiVersion): Promise<SdkResponse<Data>> {
        return Promise.reject(new Error('TestApiClient.post method not mocked!'));
    }

    /**
     * Wrapper around fetch method POST
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async post<Data>(_path: string, _options?: RequestInit, _apiVersion?: ApiVersion): Promise<SdkResponse<Data>> {
        return Promise.reject(new Error('TestApiClient.post method not mocked!'));
    }

    /**
     * GET with payment context (includes context-specific query params)
     */
    async getWithContext<Data>(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _path: string,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _context: PaymentContext,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _options?: {
            queryParams?: Record<string, string | number | undefined>;
            useCacheBuster?: boolean;
            headers?: HeadersInit;
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _apiVersion?: ApiVersion,
    ): Promise<SdkResponse<Data>> {
        return Promise.reject(new Error('TestApiClient.getWithContext method not mocked!'));
    }

    /**
     * POST with payment context (includes context-specific query params)
     */
    async postWithContext<Data>(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _path: string,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _context: PaymentContext,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _options?: {
            body?: BodyInit;
            queryParams?: Record<string, string | number | undefined>;
            useCacheBuster?: boolean;
            headers?: HeadersInit;
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _apiVersion?: ApiVersion,
    ): Promise<SdkResponse<Data>> {
        return Promise.reject(new Error('TestApiClient.postWithContext method not mocked!'));
    }
}
