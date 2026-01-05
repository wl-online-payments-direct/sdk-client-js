/*
 * Do not remove or alter the notices in this preamble.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

export interface Metadata {
    readonly screenSize: string;
    readonly platformIdentifier: string;
    readonly sdkIdentifier: string;
    readonly sdkCreator: string;
}

export interface BrowserData {
    readonly javaScriptEnabled: true;
    readonly colorDepth: number;
    readonly screenHeight: number;
    readonly screenWidth: number;
    readonly innerHeight: number;
    readonly innerWidth: number;
}

export interface DeviceInformation {
    readonly timezoneOffsetUtcMinutes: number;
    readonly locale: string;
    readonly browserData: BrowserData;
}
