import { describe, expect, it } from 'vitest';
import { Session } from '../../Session';
import type { SessionDetails } from '../../types';

const expectError = (details: SessionDetails, errorMessage: string) => {
    let error: Error | null = null;

    try {
        new Session(details as SessionDetails);
    } catch (e) {
        error = e as Error;
    }

    expect(error?.message).toEqual(errorMessage);
};

describe('Validate input parameters', () => {
    const test1: [string, object] = [
        'clientSessionId',
        {
            assetUrl: 'https://example.com',
            clientApiUrl: 'https://example.com',
        },
    ];
    const test2: [string, object] = [
        'assetUrl',
        {
            clientSessionId: '972354',
            clientApiUrl: 'https://example.com',
        },
    ];
    const test3: [string, object] = [
        'clientApiUrl',
        {
            clientSessionId: '972354',
            assetUrl: 'https://example.com',
        },
    ];

    it.each([test1, test2, test3])('should throw error if %s parameter is not set.', (param, sessionDetails) => {
        expectError(sessionDetails as SessionDetails, `The SessionDetails parameter '${param}' is mandatory.`);
    });

    it.each([
        ['clientSessionID', 'clientSessionId'],
        ['assetsBaseUrl', 'assetUrl'],
        ['apiBaseUrl', 'clientApiUrl'],
    ])('should throw error if both deprecated `%s` and regular `%s` parameters are used.', (deprecated, used) => {
        const sessionDetails: SessionDetails = {
            clientSessionId: '972354',
            customerId: '972354',
            clientApiUrl: 'https://example.com',
            assetUrl: 'https://example.com',
        };

        // @ts-expect-error if regular parameter is not set
        sessionDetails[deprecated] = sessionDetails[used];

        expectError(
            sessionDetails as SessionDetails,
            `You cannot use both the ${used} and the ${deprecated} properties. Please use the ${used} only.`,
        );
    });

    it.each([['bad url'], ['example.com'], ['https://example.com/wrongPath']])(
        'should throw error when bad URL is provided (`%s`)',
        (url) => {
            const sessionDetails: SessionDetails = {
                clientSessionId: '972354',
                customerId: '972354',
                clientApiUrl: url,
                assetUrl: 'https://example.com',
            };

            expectError(
                sessionDetails as SessionDetails,
                `A valid URL is required for the 'clientApiUrl', you provided '${url}'`,
            );
        },
    );
});
