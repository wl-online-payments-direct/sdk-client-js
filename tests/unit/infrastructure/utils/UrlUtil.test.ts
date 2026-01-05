/*
 * Do not remove or alter the notices in this preamble.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import { describe, expect, it } from 'vitest';
import { UrlUtil } from '../../../../src/infrastructure/utils/UrlUtil';

describe('UrlUtil', () => {
    describe('segmentsToPath', () => {
        it('should join path segments with slashes', () => {
            const result = UrlUtil.segmentsToPath(['a', 'b', 'c']);
            expect(result).toBe('a/b/c');
        });

        it('should remove leading and trailing slashes from segments', () => {
            const result = UrlUtil.segmentsToPath(['a/', '/b/', 'c']);
            expect(result).toBe('a/b/c');
        });

        it('should handle empty segments', () => {
            const result = UrlUtil.segmentsToPath([]);
            expect(result).toBe('');
        });

        it('should handle single segment', () => {
            const result = UrlUtil.segmentsToPath(['api']);
            expect(result).toBe('api');
        });

        it('should handle segments with multiple slashes', () => {
            const result = UrlUtil.segmentsToPath(['//a//', '//b//', '//c//']);
            expect(result).toBe('a/b/c');
        });
    });

    describe('objectToQueryString', () => {
        it('should convert object to query string', () => {
            const result = UrlUtil.objectToQueryString({ a: 1, b: 2 });
            expect(result).toBe('a=1&b=2');
        });

        it('should filter out falsy values', () => {
            const result = UrlUtil.objectToQueryString({
                a: 1,
                b: 2,
                c: 0,
                d: undefined,
                e: '',
            });
            expect(result).toBe('a=1&b=2');
        });

        it('should handle empty object', () => {
            const result = UrlUtil.objectToQueryString({});
            expect(result).toBe('');
        });

        it('should handle string values', () => {
            const result = UrlUtil.objectToQueryString({ key: 'value', another: 'test' });
            expect(result).toBe('key=value&another=test');
        });

        it('should URL encode special characters', () => {
            const result = UrlUtil.objectToQueryString({ test: 'value with spaces' });
            expect(result).toBe('test=value+with+spaces');
        });
    });

    describe('urlWithQueryString', () => {
        it('should construct URL with query string', () => {
            const result = UrlUtil.urlWithQueryString('https://example.com', { a: 1, b: 2 });
            expect(result).toBe('https://example.com/?a=1&b=2');
        });

        it('should construct URL without query string for empty object', () => {
            const result = UrlUtil.urlWithQueryString('https://example.com', {});
            expect(result).toBe('https://example.com/');
        });

        it('should construct URL with path and query string', () => {
            const result = UrlUtil.urlWithQueryString('https://example.com/api/products', { page: 1, limit: 10 });
            expect(result).toBe('https://example.com/api/products?page=1&limit=10');
        });

        it('should filter out falsy values in query string', () => {
            const result = UrlUtil.urlWithQueryString('https://example.com', {
                a: 1,
                b: undefined,
                c: '',
                d: 0,
            });
            expect(result).toBe('https://example.com/?a=1');
        });

        it('should encode special characters in query parameters', () => {
            const result = UrlUtil.urlWithQueryString('https://example.com', {
                query: 'hello world',
                filter: 'type=test',
            });
            expect(result).toContain('query=hello+world');
            expect(result).toContain('filter=type%3Dtest');
        });
    });
});
