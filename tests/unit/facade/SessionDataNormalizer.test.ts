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

import { describe, expect, it } from 'vitest';
import { ConfigurationError, type SessionData } from '../../../src';
import { normalize } from '../../../src/facade/SessionDataNormalizer';

describe('normalize SessionData', () => {
    const createValidSessionData = (): SessionData => ({
        customerId: 'customer123',
        assetUrl: 'https://assets.example.com',
        clientSessionId: 'session456',
        clientApiUrl: 'https://api.example.com/client',
    });

    const createSessionData = (overrides: Partial<SessionData> = {}): SessionData => ({
        ...createValidSessionData(),
        ...overrides,
    });

    it('should throw ConfigurationError when customerId is empty', () => {
        const sessionData = createSessionData({ customerId: '' });

        const action = () => normalize(sessionData);

        expect(action).toThrow(ConfigurationError);
        expect(action).toThrow("The SessionDetails parameter 'customerId' is mandatory.");
    });

    it('should throw ConfigurationError when assetUrl is empty', () => {
        const sessionData = createSessionData({ assetUrl: '' });

        const action = () => normalize(sessionData);

        expect(action).toThrow(ConfigurationError);
        expect(action).toThrow("The SessionDetails parameter 'assetUrl' is mandatory.");
    });

    it('should throw ConfigurationError when clientSessionId is empty', () => {
        const sessionData = createSessionData({ clientSessionId: '' });

        const action = () => normalize(sessionData);

        expect(action).toThrow(ConfigurationError);
        expect(action).toThrow("The SessionDetails parameter 'clientSessionId' is mandatory.");
    });

    it('should throw ConfigurationError when clientApiUrl is empty', () => {
        const sessionData = createSessionData({ clientApiUrl: '' });

        const action = () => normalize(sessionData);

        expect(action).toThrow(ConfigurationError);
        expect(action).toThrow("The SessionDetails parameter 'clientApiUrl' is mandatory.");
    });

    it('should throw ConfigurationError when clientApiUrl is invalid', () => {
        const sessionData = createSessionData({ clientApiUrl: 'not-a-valid-url' });

        const action = () => normalize(sessionData);

        expect(action).toThrow(ConfigurationError);
        expect(action).toThrow(/A valid URL is required for the 'clientApiUrl'/);
    });

    it('should throw ConfigurationError when clientApiUrl has unexpected path', () => {
        const sessionData = createSessionData({ clientApiUrl: 'https://api.example.com/wrong/path' });

        const action = () => normalize(sessionData);

        expect(action).toThrow(ConfigurationError);
        expect(action).toThrow("The path is unexpected, you supplied: '/wrong/path'. It should be empty or '/client'.");
    });

    it('should throw ConfigurationError when clientApiUrl has multiple path segments', () => {
        const sessionData = createSessionData({ clientApiUrl: 'https://api.example.com/client/extra' });

        const action = () => normalize(sessionData);

        expect(action).toThrow(ConfigurationError);
        expect(action).toThrow(
            "The path is unexpected, you supplied: '/client/extra'. It should be empty or '/client'",
        );
    });

    it('should add /client path when clientApiUrl has no path', () => {
        const sessionData = createSessionData({ clientApiUrl: 'https://api.example.com' });

        const result = normalize(sessionData);
        expect(result.clientApiUrl).toBe('https://api.example.com/client');
    });

    it('should accept clientApiUrl with /client path', () => {
        const sessionData = createSessionData({ clientApiUrl: 'https://api.example.com/client' });

        const result = normalize(sessionData);
        expect(result.clientApiUrl).toBe('https://api.example.com/client');
    });

    it('should strip trailing slash from /client/ path', () => {
        const sessionData = createSessionData({ clientApiUrl: 'https://api.example.com/client/' });

        const result = normalize(sessionData);
        expect(result.clientApiUrl).toBe('https://api.example.com/client');
    });

    it('should successfully normalize valid SessionData', () => {
        const sessionData = createValidSessionData();

        const result = normalize(sessionData);

        expect(result).toEqual({
            customerId: 'customer123',
            assetUrl: 'https://assets.example.com',
            clientSessionId: 'session456',
            clientApiUrl: 'https://api.example.com/client',
        });
    });

    it('should not mutate original SessionData object', () => {
        const sessionData = createValidSessionData();
        const original = { ...sessionData };

        normalize(sessionData);

        expect(sessionData).toEqual(original);
    });

    it('should accept http:// clientApiUrl and normalize correctly', () => {
        const sessionData = createSessionData({ clientApiUrl: 'http://api.example.com/client' });

        const result = normalize(sessionData);

        expect(result.clientApiUrl).toBe('http://api.example.com/client');
    });

    it('should throw ConfigurationError when clientApiUrl is whitespace-only', () => {
        const sessionData = createSessionData({ clientApiUrl: '   ' });

        const action = () => normalize(sessionData);

        expect(action).toThrow(ConfigurationError);
    });

    it('should throw ConfigurationError when clientApiUrl contains a query string', () => {
        const sessionData = createSessionData({ clientApiUrl: 'https://api.example.com/client?foo=bar' });

        const action = () => normalize(sessionData);

        expect(action).toThrow(ConfigurationError);
        expect(action).toThrow("The 'clientApiUrl' must not contain a query string");
    });

    it('should throw ConfigurationError when clientApiUrl contains a fragment', () => {
        const sessionData = createSessionData({ clientApiUrl: 'https://api.example.com/client#section' });

        const action = () => normalize(sessionData);

        expect(action).toThrow(ConfigurationError);
        expect(action).toThrow("The 'clientApiUrl' must not contain a fragment");
    });
});
