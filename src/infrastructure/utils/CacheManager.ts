/*
 * Do not remove or alter the notices in this preamble.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import type { PaymentContext } from '../../domain';

export class CacheManager {
    private cache: Map<string, unknown>;

    constructor() {
        this.cache = new Map();
    }

    /**
     * Creates a unique cache key based on the given context and optional parameters.
     *
     * @param {Object} params - Parameters used to create the cache key.
     * @param {string} params.prefix - The prefix to prepend to the cache key.
     * @param {string} [params.suffix] - Optional suffix to append to the cache key.
     * @param {PaymentContext} params.context - The payment context providing data for the cache key generation.
     * @return {string} The generated cache key.
     */
    createCacheKeyFromContext({
        prefix,
        suffix,
        context,
    }: {
        context: PaymentContext;
        prefix: string;
        suffix?: string;
    }): string {
        const {
            countryCode,
            isRecurring,
            amountOfMoney: { amount, currencyCode },
        } = context;

        return `${prefix}-${[amount, countryCode, isRecurring, currencyCode, suffix].filter(Boolean).join('_')}`;
    }

    has(key: string): boolean {
        return this.cache.has(key);
    }

    get<T>(key: string): T | undefined {
        return this.cache.get(key) as T | undefined;
    }

    set<T>(key: string, value: T): void {
        this.cache.set(key, value);
    }
}
