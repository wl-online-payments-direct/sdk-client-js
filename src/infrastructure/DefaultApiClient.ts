/*
 * Do not remove or alter the notices in this preamble.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import type { ApiClient } from './interfaces/ApiClient';
import { Util } from './utils/Util';
import { UrlUtil } from './utils/UrlUtil';
import { CommunicationError } from '../domain/errors/CommunicationError';
import { ApiVersion } from './models/ApiVersion';
import type { PaymentContext, SdkResponse } from '../domain';

const defaultHeaders = {
    'Content-Type': 'application/json',
    Accept: ['text/javascript', 'application/json', 'text/html', 'application/xml', 'text/xml', '*/*'].join(', '),
};

export class DefaultApiClient implements ApiClient {
    constructor(
        private readonly clientApiUrl: string,
        private readonly customerId: string,
        private readonly clientSessionId: string,
        private readonly appIdentifier?: string,
        private readonly apiVersion = ApiVersion.V1,
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

        if (!response.headers.get('content-type')?.startsWith('application/json')) {
            // if the API returned anything other than a JSON response, it indicates an error
            const responseData = await response.text();

            throw new CommunicationError(response.status, responseData);
        }

        const data = (await response.json()) as Data;
        const isValid = this.isValidResponse(response, data);

        return {
            status: response.status,
            success: isValid,
            data: data,
        };
    }

    /**
     * These status codes are considered "successful" by the SDK.
     */
    private isValidResponse({ ok, status }: Response, data: unknown) {
        return ok || status === 304 || (status === 0 && !!data);
    }
}
