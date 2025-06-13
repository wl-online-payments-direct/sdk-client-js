export type SessionDetails = {
    customerId: string;
    /** @deprecated Use `assetUrl` instead. */
    assetsBaseUrl?: string;
    assetUrl: string;
    /** @deprecated Use `clientSessionId` instead. */
    clientSessionID?: string;
    clientSessionId: string;
    /** @deprecated Use `clientApiUrl` instead. */
    apiBaseUrl?: string;
    clientApiUrl: string;
};
