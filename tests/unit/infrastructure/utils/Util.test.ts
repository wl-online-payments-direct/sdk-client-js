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

import { afterEach, describe, expect, it, vi } from 'vitest';
import { Util } from '../../../../src/infrastructure/utils/Util';
import { version } from '../../../../package.json';

describe('getMetadata', () => {
    afterEach(() => {
        delete (document as any).GC;
    });

    it('returns metadata with the appIdentifier as sdkCreator', () => {
        const metadata = Util.getMetadata('my-app');

        expect(metadata.sdkCreator).toBe('my-app');
    });

    it('uses an empty string as sdkCreator when no appIdentifier is provided', () => {
        const metadata = Util.getMetadata();

        expect(metadata.sdkCreator).toBe('');
    });

    it("prefixes sdkIdentifier with 'rpp-' when document.GC.rppEnabledPage is true", () => {
        (document as any).GC = { rppEnabledPage: true };

        const metadata = Util.getMetadata();

        expect(metadata.sdkIdentifier).toBe(`rpp-JavaScriptClientSDK/v${version}`);
    });

    it('uses the default sdkIdentifier when document.GC.rppEnabledPage is absent', () => {
        const metadata = Util.getMetadata();

        expect(metadata.sdkIdentifier).toBe(`JavaScriptClientSDK/v${version}`);
    });
});

describe('base64UrlEncode', () => {
    it('returns a Base64 URL-encoded string with no padding characters', () => {
        const result = Util.base64UrlEncode('hello world');

        expect(result).toBe('aGVsbG8gd29ybGQ');
        expect(result).not.toContain('+');
        expect(result).not.toContain('/');
        expect(result).not.toContain('=');
    });
});

describe('collectDeviceInformation', () => {
    it('returns a DeviceInformation object with browser environment fields', () => {
        const info = Util.collectDeviceInformation();

        expect(info).toMatchObject({
            timezoneOffsetUtcMinutes: expect.any(Number),
            locale: expect.any(String),
            browserData: {
                javaScriptEnabled: true,
                colorDepth: expect.any(Number),
                screenHeight: expect.any(Number),
                screenWidth: expect.any(Number),
                innerHeight: expect.any(Number),
                innerWidth: expect.any(Number),
            },
        });
    });
});

describe('invokeSafely', () => {
    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('calls the handler with the arguments bound by the operation', () => {
        const handler = vi.fn();

        Util.invokeSafely(() => handler('a', 1), 'Click to Pay');

        expect(handler).toHaveBeenCalledWith('a', 1);
    });

    it('does not log or throw when the operation succeeds', () => {
        const handler = vi.fn();
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        expect(() => Util.invokeSafely(handler, 'Click to Pay')).not.toThrow();
        expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('returns normally and logs when the operation throws', () => {
        vi.useFakeTimers();

        const error = new Error('handler failed');
        const handler = vi.fn(() => {
            throw error;
        });
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        expect(() => Util.invokeSafely(handler, 'Click to Pay')).not.toThrow();
        expect(consoleErrorSpy).toHaveBeenCalledWith('Click to Pay: a registered event handler threw an error.', error);
    });

    it('re-throws the handler error asynchronously on a later tick', () => {
        vi.useFakeTimers();

        const error = new Error('handler failed');
        const handler = vi.fn(() => {
            throw error;
        });
        vi.spyOn(console, 'error').mockImplementation(() => {});

        Util.invokeSafely(handler, 'Click to Pay');

        expect(() => vi.runAllTimers()).toThrow('handler failed');
    });
});
