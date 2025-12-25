import { ConfigurationError } from '../dataModel';
import type { SessionData } from '../types';

export function normalize(sessionData: SessionData): SessionData {
    const data = { ...sessionData };
    const keys: (keyof SessionData)[] = ['customerId', 'assetUrl', 'clientSessionId', 'clientApiUrl'];
    keys.forEach((key) => {
        if (!data[key]) {
            throw new ConfigurationError(`The SessionDetails parameter '${key}' is mandatory.`);
        }
    });

    try {
        data.clientApiUrl = sanitizeClientApiUrl(data.clientApiUrl);
    } catch (err) {
        if (err instanceof ConfigurationError) {
            throw err;
        }

        throw new ConfigurationError(
            `A valid URL is required for the 'clientApiUrl', you provided '${data.clientApiUrl}'`,
        );
    }

    return data;
}

function sanitizeClientApiUrl(inputUrl: string) {
    const url = new URL(inputUrl);
    const segments = url.pathname.split('/').filter(Boolean);

    // When no path segments are found, add 'client'
    if (!segments.length) {
        segments.push('client');
    }

    // Only allow a single path segment `client` or no segments at all
    if (segments.length > 1 || segments[0] !== 'client') {
        throw new ConfigurationError(
            `The path is unexpected, you supplied: '${url.pathname}'. It should be empty or '/client'.`,
        );
    }

    url.pathname = segments.join('/');

    return url.href;
}
