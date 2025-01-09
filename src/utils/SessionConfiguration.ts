import type { SessionDetails } from '../types';

import { amdName as libName } from '../../package.json';

export class SessionConfiguration {
    readonly clientSessionId: string;
    readonly customerId: string;
    readonly clientApiUrl: string;
    readonly assetUrl: string;

    constructor(sessionDetails: SessionDetails) {
        const details = { ...sessionDetails };
        // clientSessionID, assetBaseUrl and apiBaseUrl are deprecated but still may be used.
        // Here we check for presence of new variables, use the old variables only if the new ones don't exist.
        const props: [keyof SessionDetails, keyof SessionDetails][] = [
            ['clientSessionID', 'clientSessionId'],
            ['assetsBaseUrl', 'assetUrl'],
            ['apiBaseUrl', 'clientApiUrl'],
        ];

        props.forEach(([deprecated, used]) => {
            if (!details[used]) {
                details[used] = details[deprecated];
            } else if (details[deprecated]) {
                throw new Error(
                    `You cannot use both the ${used} and the ${deprecated} properties. Please use the ${used} only.`,
                );
            }
        });

        this.clientSessionId = details.clientSessionId;
        this.customerId = details.customerId;

        // ignore the region here
        this.clientApiUrl = details.clientApiUrl as string;
        this.assetUrl = details.assetUrl as string;
        if (!this.clientApiUrl) {
            throw new Error(`This version of the ${libName} requires an 'clientApiUrl', which you did not provide.`);
        }

        if (!this.assetUrl) {
            throw new Error(`This version of the ${libName} requires an 'assetUrl', which you did not provide.`);
        }

        try {
            this.clientApiUrl = this.#sanitizeClientApiUrl(this.clientApiUrl);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            throw new Error(`A valid URL is required for the 'clientApiUrl', you provided '${this.clientApiUrl}'`);
        }
    }

    #sanitizeClientApiUrl(inputUrl: string) {
        // url could be an absolute url or starts with `//`
        const url = new URL(inputUrl);
        const segments = url.pathname.split('/').filter(Boolean);

        // When no path segments are found, add 'client'
        if (!segments.length) {
            segments.push('client');
        }

        // Only allow a single path segment `client` or no segments at all
        if (segments.length > 1 || segments[0] !== 'client') {
            throw new Error(`The path is unexpected, you supplied: '${url.pathname}'. It should be empty or /client'.`);
        }

        url.pathname = segments.join('/');

        return url.href;
    }
}
