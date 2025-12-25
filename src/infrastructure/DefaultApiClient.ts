import type { ApiClient } from './interfaces/ApiClient';
import { ApiVersion, type PaymentContext, type SdkResponse } from '../types';
import { Util } from './utils/Util';
import { UrlUtil } from './utils/UrlUtil';

const defaultHeaders = {
    'Content-Type': 'application/json',
    Accept: ['text/javascript', 'application/json', 'text/html', 'application/xml', 'text/xml', '*/*'].join(', '),
};

export class DefaultApiClient implements ApiClient {
    constructor(
        private readonly apiVersion: ApiVersion,
        private readonly clientApiUrl: string,
        private readonly customerId: string,
        private readonly clientSessionId: string,
        private readonly appIdentifier?: string,
    ) {}

    /**
     * Wrapper around fetch method GET
     */
    async get<Data>(path: string, options?: RequestInit, apiVersion?: ApiVersion): Promise<SdkResponse<Data>> {
        const url = this.getBasePath(path, apiVersion ?? this.apiVersion);
        const headers = {
            ...this.getRequestHeaders(),
            ...(options?.headers ?? {}),
        };

        return this.fetchCall<Data>(url, { method: 'GET', ...options, headers });
    }

    /**
     * Wrapper around fetch method POST
     */
    async post<Data>(path: string, options?: RequestInit, apiVersion?: ApiVersion): Promise<SdkResponse<Data>> {
        const url = this.getBasePath(path, apiVersion ?? this.apiVersion);
        const headers = {
            ...this.getRequestHeaders(),
            ...(options?.headers ?? {}),
        };

        return this.fetchCall<Data>(url, { method: 'POST', ...options, headers });
    }

    /**
     * GET with payment context (includes context-specific query params)
     */
    async getWithContext<Data>(
        path: string,
        context: PaymentContext,
        options?: {
            queryParams?: Record<string, string | number | undefined>;
            useCacheBuster?: boolean;
            headers?: HeadersInit;
        },
        apiVersion?: ApiVersion,
    ): Promise<SdkResponse<Data>> {
        const url = this.getUrlFromContext({
            path,
            apiVersion,
            context,
            queryParams: options?.queryParams,
            useCacheBuster: options?.useCacheBuster,
        });

        const headers = {
            ...this.getRequestHeaders(),
            ...(options?.headers ?? {}),
        };

        return this.fetchCall<Data>(url, { method: 'GET', headers });
    }

    /**
     * POST with payment context (includes context-specific query params)
     */
    async postWithContext<Data>(
        path: string,
        context: PaymentContext,
        options?: {
            body?: BodyInit;
            queryParams?: Record<string, string | number | undefined>;
            useCacheBuster?: boolean;
            headers?: HeadersInit;
        },
        apiVersion?: ApiVersion,
    ): Promise<SdkResponse<Data>> {
        const url = this.getUrlFromContext({
            path,
            apiVersion,
            context,
            queryParams: options?.queryParams,
            useCacheBuster: options?.useCacheBuster,
        });

        const headers = {
            ...this.getRequestHeaders(),
            ...(options?.headers ?? {}),
        };

        return this.fetchCall<Data>(url, { method: 'POST', body: options?.body, headers });
    }

    getBasePath(path: string, apiVersion: ApiVersion): string {
        return UrlUtil.segmentsToPath([this.clientApiUrl, apiVersion, this.customerId, path]);
    }

    getRequestHeaders(): HeadersInit {
        const metadata = Util.getMetadata(this.appIdentifier);

        return {
            'X-GCS-ClientMetaInfo': window.btoa(JSON.stringify(metadata)),
            Authorization: `GCS v1Client:${this.clientSessionId}`,
        };
    }

    getUrlFromContext({
        path,
        apiVersion,
        context,
        queryParams = {},
        useCacheBuster = false,
    }: {
        path: string;
        apiVersion?: ApiVersion;
        context: PaymentContext;
        queryParams?: Record<string, string | number | undefined>;
        useCacheBuster?: boolean;
    }): string {
        return UrlUtil.urlWithQueryString(this.getBasePath(path, apiVersion ?? this.apiVersion), {
            countryCode: context.countryCode,
            isRecurring: context.isRecurring?.toString(),
            amount: context.amountOfMoney.amount?.toString() ?? undefined,
            currencyCode: context.amountOfMoney.currencyCode,
            cacheBust: useCacheBuster ? new Date().getTime().toString() : undefined,
            ...queryParams,
        });
    }

    private async fetchCall<Data, Options extends RequestInit = RequestInit>(
        url: string,
        { headers, ...options }: Options,
    ) {
        const response = await fetch(url, {
            ...options,
            headers: headers ? { ...defaultHeaders, ...headers } : defaultHeaders,
        });

        const data = (await this.getResponseBody(response)) as Data;

        return {
            status: response.status,
            success: this.isValidResponse(response, data),
            data: data,
        };
    }

    /**
     * These status codes are considered "successful" by the SDK.
     */
    private isValidResponse({ ok, status }: Response, data: unknown) {
        return ok || status === 304 || (status === 0 && !!data);
    }

    /**
     * Get the response body as JSON or text.
     */
    private getResponseBody(response: Response): Promise<unknown> {
        const contentType = response.headers.get('content-type') ?? '';

        return contentType.includes('application/json') ? response.json() : response.text();
    }
}
