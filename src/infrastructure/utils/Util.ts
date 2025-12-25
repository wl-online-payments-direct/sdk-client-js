import { version } from '../../../package.json';
import type { DeviceInformation, Metadata } from '../../types';

export const Util = {
    getMetadata(appIdentifier?: string): Metadata {
        const rppEnabledPage = (
            document as typeof document & {
                GC?: { rppEnabledPage: boolean };
            }
        ).GC?.rppEnabledPage;
        const sdkIdentifierPrefix = rppEnabledPage ? 'rpp-' : '';

        return {
            screenSize: `${window.innerWidth}x${window.innerHeight}`,
            platformIdentifier: window.navigator.userAgent,
            sdkIdentifier: `${sdkIdentifierPrefix}JavaScriptClientSDK/v${version}`,
            sdkCreator: appIdentifier ?? '',
        };
    },

    base64UrlEncode(data: string): string {
        const encoder = new TextEncoder();
        const bytes = encoder.encode(data);

        const base64 = btoa(String.fromCharCode(...bytes));

        return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    },

    collectDeviceInformation(): DeviceInformation {
        return {
            timezoneOffsetUtcMinutes: new Date().getTimezoneOffset(),
            locale: window.navigator.language,
            browserData: {
                javaScriptEnabled: true,
                colorDepth: screen.colorDepth,
                screenHeight: screen.height,
                screenWidth: screen.width,
                innerHeight: window.innerHeight,
                innerWidth: window.innerWidth,
            },
        };
    },
};
