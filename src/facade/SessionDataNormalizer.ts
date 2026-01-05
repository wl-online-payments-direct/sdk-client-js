/*
 * Do not remove or alter the notices in this preamble.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import { ConfigurationError, type SessionData } from '../domain';

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
