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
