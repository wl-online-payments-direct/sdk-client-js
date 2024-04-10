import type { SessionDetails } from './types';

import { amdName as libName } from '../package.json';

export class C2SCommunicatorConfiguration {
  readonly clientSessionId: string;
  readonly customerId: string;
  readonly clientApiUrl: string;
  readonly assetUrl: string;

  constructor(sessionDetails: SessionDetails) {
    // clientSessionID, assetBaseUrl and apiBaseUrl are deprecated but still may be used.
    // Here we check for presence of new variables, use the old variables if they don't exist.
    if (!sessionDetails.clientSessionId) {
      sessionDetails.clientSessionId = sessionDetails.clientSessionID;
    } else if (sessionDetails.clientSessionID) {
      throw new Error(
        'You cannot use both the clientSessionId and the clientSessionID at the same time, please use the clientSessionId only.',
      );
    }

    if (!sessionDetails.assetUrl) {
      sessionDetails.assetUrl = sessionDetails.assetsBaseUrl;
    } else if (sessionDetails.assetsBaseUrl) {
      throw new Error(
        'You cannot use both the assetUrl and the assetsBaseUrl at the same time, please use the assetUrl only.',
      );
    }

    if (!sessionDetails.clientApiUrl) {
      sessionDetails.clientApiUrl = sessionDetails.apiBaseUrl;
    } else if (sessionDetails.apiBaseUrl) {
      throw new Error(
        'You cannot use both the clientApiUrl and the apiBaseUrl at the same time, please use the clientApiUrl only.',
      );
    }

    this.clientSessionId = sessionDetails.clientSessionId as string;
    this.customerId = sessionDetails.customerId;

    // ignore the region here
    this.clientApiUrl = sessionDetails.clientApiUrl as string;
    this.assetUrl = sessionDetails.assetUrl as string;
    if (!this.clientApiUrl) {
      throw new Error(
        `This version of the ${libName} requires an clientApiUrl, which you did not provide.`,
      );
    }
    if (!this.assetUrl) {
      throw new Error(
        `This version of the ${libName} requires an assetUrl, which you did not provide.`,
      );
    }

    try {
      this.clientApiUrl = this.#_sanitizeClientApiUrl(this.clientApiUrl);
    } catch (err) {
      throw new Error(
        `A valid URL is required for the clientApiUrl, you provided '${this.clientApiUrl}'`,
      );
    }
  }

  #_sanitizeClientApiUrl(inputUrl: string) {
    // url could be an absolute url or starts with `//`
    const url = new URL(inputUrl);
    const segments = url.pathname.split('/').filter(Boolean);

    // When no path segments are found, add 'client'
    if (!segments.length) segments.push('client');

    // Only allow a single path segment `client` or no segments at all
    if (segments.length > 1 || segments[0] !== 'client') {
      throw new Error(
        `The path is unexpected, you supplied: '${url.pathname}'. It should be empty or /client'.`,
      );
    }

    url.pathname = segments.join('/');
    return url.href;
  }
}
