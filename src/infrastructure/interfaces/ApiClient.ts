/*
 * Do not remove or alter the notices in this preamble.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import type { ApiVersion } from '../models/ApiVersion';
import type { PaymentContext, SdkResponse } from '../../domain';

export interface ApiClient {
    get<Data>(path: string, options?: RequestInit, apiVersion?: ApiVersion): Promise<SdkResponse<Data>>;

    post<Data>(path: string, options?: RequestInit, apiVersion?: ApiVersion): Promise<SdkResponse<Data>>;

    getWithContext<Data>(
        path: string,
        context: PaymentContext,
        options?: {
            queryParams?: Record<string, string | number | undefined>;
            useCacheBuster?: boolean;
            headers?: HeadersInit;
        },
        apiVersion?: ApiVersion,
    ): Promise<SdkResponse<Data>>;

    postWithContext<Data>(
        path: string,
        context: PaymentContext,
        options?: {
            body?: BodyInit;
            queryParams?: Record<string, string | number | undefined>;
            useCacheBuster?: boolean;
            headers?: HeadersInit;
        },
        apiVersion?: ApiVersion,
    ): Promise<SdkResponse<Data>>;
}
