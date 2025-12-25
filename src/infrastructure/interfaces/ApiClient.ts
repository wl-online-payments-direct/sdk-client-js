import { ApiVersion, type PaymentContext, type SdkResponse } from '../../types';

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
