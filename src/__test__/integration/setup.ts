import type { SessionDetails } from '../../types';

import { beforeAll } from 'vitest';
import path from 'path';
import fs from 'fs';
import { getEnvVar, getSessionFromSdk } from './utils';

const SDK_MERCHANT_ID = getEnvVar('VITE_ONLINEPAYMENTS_SDK_MERCHANT_ID');
const CACHE_ENABLED = !process.env.CI;
const CACHE_DIR = path.join(__dirname, '.cache');
const SESSION_DETAILS_CACHE_FILE = path.join(CACHE_DIR, 'session-details.json');
const SESSION_EXPIRATION_IN_MINUTES = 30;

let sessionDetails: SessionDetails;

const getMinutesFromNow = (date: Date) => {
    const diff = Date.now() - date.getTime();
    return Math.floor(diff / 1_000 / 60);
};

const getSessionFromCache = (): SessionDetails | undefined => {
    if (!CACHE_ENABLED) {
        return;
    }

    const fromCache = fs.statSync(SESSION_DETAILS_CACHE_FILE, {
        throwIfNoEntry: false,
    });

    if (!fromCache) {
        return;
    }

    const isExpired = getMinutesFromNow(fromCache.mtime) > SESSION_EXPIRATION_IN_MINUTES;
    if (isExpired) {
        return;
    }

    return JSON.parse(fs.readFileSync(SESSION_DETAILS_CACHE_FILE, { encoding: 'utf8' }));
};

export const getSessionDetails = () => sessionDetails;

beforeAll(async () => {
    if (!CACHE_ENABLED) {
        sessionDetails = await getSessionFromSdk({
            merchantId: SDK_MERCHANT_ID,
        });

        return;
    }

    // check if we can get the session from cache
    if (!fs.existsSync(CACHE_DIR)) {
        fs.mkdirSync(CACHE_DIR);
    }

    const sessionDetailsFromCache = getSessionFromCache();
    if (sessionDetailsFromCache) {
        sessionDetails = { ...sessionDetailsFromCache };
        return;
    }

    sessionDetails = await getSessionFromSdk({
        merchantId: SDK_MERCHANT_ID,
    });
    fs.writeFileSync(SESSION_DETAILS_CACHE_FILE, JSON.stringify(sessionDetails));
});

const realFetch = globalThis.fetch;

globalThis.fetch = (input: RequestInfo | URL, init: RequestInit = {}) => {
    // Only set if not already provided:
    //if (init.method === 'GET') {
    init.credentials = 'include';
    //} else {
    //init.referrer = 'https://localhost';
    //}

    return realFetch(input, init).catch((e) => {
        console.log(e);
        throw e;
    });
};
