import { describe, expect, it } from 'vitest';
import { type SessionData } from '../../../src';
import { normalize } from '../../../src/facade/SessionDataNormalizer';
import { ConfigurationError } from '../../../src/dataModel';

describe('normalize SessionData', () => {
    const getValidSessionData = (): SessionData => ({
        customerId: 'customer123',
        assetUrl: 'https://assets.example.com',
        clientSessionId: 'session456',
        clientApiUrl: 'https://api.example.com/client',
    });

    it('should throw ConfigurationError when customerId is empty', () => {
        const sessionData = {
            ...getValidSessionData(),
            customerId: '',
        };

        expect(() => normalize(sessionData)).toThrow(ConfigurationError);
        expect(() => normalize(sessionData)).toThrow("The SessionDetails parameter 'customerId' is mandatory.");
    });

    it('should throw ConfigurationError when assetUrl is empty', () => {
        const sessionData = {
            ...getValidSessionData(),
            assetUrl: '',
        };

        expect(() => normalize(sessionData)).toThrow(ConfigurationError);
        expect(() => normalize(sessionData)).toThrow("The SessionDetails parameter 'assetUrl' is mandatory.");
    });

    it('should throw ConfigurationError when clientSessionId is empty', () => {
        const sessionData = {
            ...getValidSessionData(),
            clientSessionId: '',
        };

        expect(() => normalize(sessionData)).toThrow(ConfigurationError);
        expect(() => normalize(sessionData)).toThrow("The SessionDetails parameter 'clientSessionId' is mandatory.");
    });

    it('should throw ConfigurationError when clientApiUrl is empty', () => {
        const sessionData = {
            ...getValidSessionData(),
            clientApiUrl: '',
        };

        expect(() => normalize(sessionData)).toThrow(ConfigurationError);
        expect(() => normalize(sessionData)).toThrow("The SessionDetails parameter 'clientApiUrl' is mandatory.");
    });

    it('should throw ConfigurationError when clientApiUrl is invalid', () => {
        const sessionData = {
            ...getValidSessionData(),
            clientApiUrl: 'not-a-valid-url',
        };

        expect(() => normalize(sessionData)).toThrow(ConfigurationError);
        expect(() => normalize(sessionData)).toThrow(/A valid URL is required for the 'clientApiUrl'/);
    });

    it('should throw ConfigurationError when clientApiUrl has unexpected path', () => {
        const sessionData = {
            ...getValidSessionData(),
            clientApiUrl: 'https://api.example.com/wrong/path',
        };

        expect(() => normalize(sessionData)).toThrow(ConfigurationError);
        expect(() => normalize(sessionData)).toThrow(
            "The path is unexpected, you supplied: '/wrong/path'. It should be empty or '/client'.",
        );
    });

    it('should throw ConfigurationError when clientApiUrl has multiple path segments', () => {
        const sessionData = {
            ...getValidSessionData(),
            clientApiUrl: 'https://api.example.com/client/extra',
        };

        expect(() => normalize(sessionData)).toThrow(ConfigurationError);
        expect(() => normalize(sessionData)).toThrow(
            "The path is unexpected, you supplied: '/client/extra'. It should be empty or '/client'",
        );
    });

    it('should add /client path when clientApiUrl has no path', () => {
        const sessionData = {
            ...getValidSessionData(),
            clientApiUrl: 'https://api.example.com',
        };

        const result = normalize(sessionData);
        expect(result.clientApiUrl).toBe('https://api.example.com/client');
    });

    it('should accept clientApiUrl with /client path', () => {
        const sessionData = {
            ...getValidSessionData(),
            clientApiUrl: 'https://api.example.com/client',
        };

        const result = normalize(sessionData);
        expect(result.clientApiUrl).toBe('https://api.example.com/client');
    });

    it('should successfully normalize valid SessionData', () => {
        const sessionData = getValidSessionData();

        const result = normalize(sessionData);

        expect(result).toEqual({
            customerId: 'customer123',
            assetUrl: 'https://assets.example.com',
            clientSessionId: 'session456',
            clientApiUrl: 'https://api.example.com/client',
        });
    });

    it('should not mutate original SessionData object', () => {
        const sessionData = getValidSessionData();
        const original = { ...sessionData };

        normalize(sessionData);

        expect(sessionData).toEqual(original);
    });
});
