import { describe, expect, it } from 'vitest';
import type { PaymentContext } from '../../../../src/types';
import { CacheManager } from '../../../../src/infrastructure/utils/CacheManager';

describe('createCacheKeyFromContext', () => {
    const baseContext = {
        countryCode: 'NL',
        isRecurring: true,
        amountOfMoney: {
            amount: 100,
            currencyCode: 'EUR',
        },
    } as PaymentContext;

    it('creates a cache key with prefix and context fields', () => {
        const cacheManager = new CacheManager();

        const key = cacheManager.createCacheKeyFromContext({
            prefix: 'payment',
            context: baseContext,
        });

        expect(key).toBe('payment-100_NL_true_EUR');
    });

    it('includes suffix when provided', () => {
        const cacheManager = new CacheManager();

        const key = cacheManager.createCacheKeyFromContext({
            prefix: 'payment',
            suffix: 'extra',
            context: baseContext,
        });

        expect(key).toBe('payment-100_NL_true_EUR_extra');
    });

    it('omits falsy suffix values because of filter(Boolean)', () => {
        const cacheManager = new CacheManager();

        const keyWithUndefinedSuffix = cacheManager.createCacheKeyFromContext({
            prefix: 'payment',
            context: baseContext,
        });

        const keyWithEmptySuffix = cacheManager.createCacheKeyFromContext({
            prefix: 'payment',
            suffix: '',
            context: baseContext,
        });

        expect(keyWithUndefinedSuffix).toBe('payment-100_NL_true_EUR');
        expect(keyWithEmptySuffix).toBe('payment-100_NL_true_EUR');
    });

    it('creates different keys for different contexts', () => {
        const cacheManager = new CacheManager();

        const context1 = {
            ...baseContext,
            amountOfMoney: { amount: 100, currencyCode: 'EUR' },
        } as PaymentContext;

        const context2 = {
            ...baseContext,
            amountOfMoney: { amount: 200, currencyCode: 'EUR' },
        } as PaymentContext;

        const key1 = cacheManager.createCacheKeyFromContext({
            prefix: 'payment',
            context: context1,
        });

        const key2 = cacheManager.createCacheKeyFromContext({
            prefix: 'payment',
            context: context2,
        });

        expect(key1).not.toBe(key2);
    });
});

describe('Cache operations', () => {
    it('returns false from hasCache for unknown keys', () => {
        const cacheManager = new CacheManager();

        expect(cacheManager.has('non-existent')).toBe(false);
    });

    it('setKey stores value and hasCache/getKey retrieve it', () => {
        const cacheManager = new CacheManager();
        const key = 'test-key';
        const value = { test: 'test' };

        cacheManager.set(key, value);

        expect(cacheManager.has(key)).toBe(true);
        expect(cacheManager.get(key)).toBe(value);
    });

    it('getKey returns undefined for missing key', () => {
        const cacheManager = new CacheManager();

        expect(cacheManager.get('missing-key')).toBeUndefined();
    });

    it('setKey overwrites existing value for same key', () => {
        const cacheManager = new CacheManager();
        const key = 'duplicate-key';

        cacheManager.set(key, 'first');
        cacheManager.set(key, 'second');

        expect(cacheManager.has(key)).toBe(true);
        expect(cacheManager.get(key)).toBe('second');
    });

    it('can store different value types', () => {
        const cacheManager = new CacheManager();
        const key1 = 'string-key';
        const key2 = 'number-key';
        const key3 = 'object-key';

        cacheManager.set(key1, 'test string');
        cacheManager.set(key2, 42);
        cacheManager.set(key3, { test: true });

        expect(cacheManager.get(key1)).toBe('test string');
        expect(cacheManager.get(key2)).toBe(42);
        expect(cacheManager.get(key3)).toEqual({ test: true });
    });
});
