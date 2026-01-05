/*
 * Do not remove or alter the notices in this preamble.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

export const UrlUtil = {
    /**
     * Convert multiple segments of a path into a single path
     *
     * @example:
     * ```ts
     * joinPathSegments('a/', 'b', 'c') => 'a/b/c'
     * ```
     */
    segmentsToPath(segments: string[]): string {
        return segments.map((str) => str.replace(/^\/+|\/+$/g, '')).join('/');
    },

    /**
     * Convert an object into a query string
     * Filter out falsy values
     *
     * @example:
     * ```ts
     * objectToQueryString({ a: 1, b: 2, c: false, d: null, e: undefined, f: 0, g: '' }) // => 'a=1&b=2'
     * ```
     */
    objectToQueryString(obj: Record<string, string | number | undefined>): string {
        const params = new URLSearchParams();
        for (const key of Object.keys(obj)) {
            const value = obj[key];
            if (!value) {
                continue;
            }

            params.set(key, value.toString());
        }

        return params.toString();
    },

    /**
     * Construct url with optional query string
     *
     * @example:
     *
     * ```ts
     * const url = urlWithQueryString('https://example.com', { a: 1, b: 2 }) // => 'https://example.com?a=1&b=2'
     * ```
     */
    urlWithQueryString(basePath: string, query: Record<string, string | number | undefined>) {
        const url = new URL(basePath);
        url.search = this.objectToQueryString(query);

        return url.href;
    },
};
