import type { SdkResponse } from '../types';

const defaultHeaders = {
    'Content-Type': 'application/json',
    Accept: ['text/javascript', 'application/json', 'text/html', 'application/xml', 'text/xml', '*/*'].join(', '),
};

/**
 * These status codes are considered "successful" by the SDK.
 */
async function isValidResponse({ ok, status }: Response, data: unknown) {
    return ok || status === 304 || (status === 0 && !!data);
}

/**
 * Get the response body as JSON or text.
 */
async function getResponseBody(response: Response) {
    const contentType = response.headers.get('content-type') || '';

    return contentType.includes('application/json') ? response.json() : response.text();
}

async function fetchCall<Options extends RequestInit>(url: string, { headers, ...options }: Options) {
    const response = await fetch(url, {
        ...options,
        headers: headers ? { ...defaultHeaders, ...headers } : defaultHeaders,
    });

    const data = await getResponseBody(response);

    return {
        status: response.status,
        success: await isValidResponse(response, data),
        data,
    };
}

export const Net = {
    /**
     * Wrapper around fetch method GET
     */
    async get<Data>(url: string, options: RequestInit = {}): Promise<SdkResponse<Data>> {
        return fetchCall(url, { method: 'GET', ...options });
    },

    /**
     * Wrapper around fetch method POST
     */
    async post<Data>(url: string, options: RequestInit = {}): Promise<SdkResponse<Data>> {
        return fetchCall(url, { method: 'POST', ...options });
    },
};
