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

import { beforeEach, describe, expect, it } from 'vitest';
import { CacheManager } from '../../../../src/infrastructure/utils/CacheManager';
import type { PaymentContext } from '../../../../src';

let cacheManager: CacheManager;

beforeEach(() => {
    cacheManager = new CacheManager();
});

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
        const key = cacheManager.createCacheKeyFromContext({
            prefix: 'payment',
            context: baseContext,
        });

        expect(key).toBe('payment-100_NL_true_EUR');
    });

    it('includes suffix when provided', () => {
        const key = cacheManager.createCacheKeyFromContext({
            prefix: 'payment',
            suffix: 'extra',
            context: baseContext,
        });

        expect(key).toBe('payment-100_NL_true_EUR_extra');
    });

    it('omits undefined and empty-string suffix from key', () => {
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

    it('includes isRecurring=false in key as distinct from absent', () => {
        const key = cacheManager.createCacheKeyFromContext({
            prefix: 'payment',
            context: { ...baseContext, isRecurring: false },
        });

        expect(key).toBe('payment-100_NL_false_EUR');
    });

    it('omits isRecurring from key when value is undefined', () => {
        const key = cacheManager.createCacheKeyFromContext({
            prefix: 'payment',
            context: { ...baseContext, isRecurring: undefined },
        });

        expect(key).toBe('payment-100_NL_EUR');
    });

    it('includes amount=0 in key', () => {
        const key = cacheManager.createCacheKeyFromContext({
            prefix: 'payment',
            context: { ...baseContext, amountOfMoney: { amount: 0, currencyCode: 'EUR' } },
        });

        expect(key).toBe('payment-0_NL_true_EUR');
    });

    it('creates different keys for different contexts', () => {
        const firstContext = {
            ...baseContext,
            amountOfMoney: { amount: 100, currencyCode: 'EUR' },
        } as PaymentContext;

        const secondContext = {
            ...baseContext,
            amountOfMoney: { amount: 200, currencyCode: 'EUR' },
        } as PaymentContext;

        const firstKey = cacheManager.createCacheKeyFromContext({
            prefix: 'payment',
            context: firstContext,
        });

        const secondKey = cacheManager.createCacheKeyFromContext({
            prefix: 'payment',
            context: secondContext,
        });

        expect(firstKey).not.toBe(secondKey);
    });
});

describe('Cache operations', () => {
    it('returns false from has for unknown keys', () => {
        expect(cacheManager.has('non-existent')).toBe(false);
    });

    it('set stores value and has/get retrieve it', () => {
        const key = 'test-key';
        const value = { test: 'test' };

        cacheManager.set(key, value);

        expect(cacheManager.has(key)).toBe(true);
        expect(cacheManager.get(key)).toBe(value);
    });

    it('get returns undefined for missing key', () => {
        expect(cacheManager.get('missing-key')).toBeUndefined();
    });

    it('set overwrites existing value for same key', () => {
        const key = 'duplicate-key';

        cacheManager.set(key, 'first');
        cacheManager.set(key, 'second');

        expect(cacheManager.has(key)).toBe(true);
        expect(cacheManager.get(key)).toBe('second');
    });

    it('can store different value types', () => {
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
