import type { BasicPaymentProductJSON, DeviceInformation, Metadata, PaymentProductsJSON } from '../types';

import { creator as sdkCreator, version } from '../../package.json';

const applePayPaymentProductId = 302;
const maestroPaymentProductId = 117;
const intersolvePaymentProductId = 5700;
const sodexoSportAndCulturePaymentProductId = 5772;
const vvvGiftCardPaymentProductId = 5784;

export const Util = {
    applePayPaymentProductId: applePayPaymentProductId,
    paymentProductsThatAreNotSupportedInThisBrowser: [] as number[],
    paymentProductsThatAreNotSupportedBySDK: [
        maestroPaymentProductId,
        intersolvePaymentProductId,
        sodexoSportAndCulturePaymentProductId,
        vvvGiftCardPaymentProductId,
    ],

    isSupportedPaymentProductInBrowser(id: BasicPaymentProductJSON['id']): boolean {
        return !this.paymentProductsThatAreNotSupportedInThisBrowser.includes(id);
    },

    isSupportedPaymentProductBySdk(id: BasicPaymentProductJSON['id']): boolean {
        return !this.paymentProductsThatAreNotSupportedBySDK.includes(id);
    },

    getMetadata(): Metadata {
        const rppEnabledPage = (
            document as typeof document & {
                GC?: { rppEnabledPage: boolean };
            }
        ).GC?.rppEnabledPage;
        const sdkIdentifierPrefix = rppEnabledPage ? 'rpp-' : '';

        return {
            screenSize: `${window.innerWidth}x${window.innerHeight}`,
            platformIdentifier: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:97.0) Gecko/20100101 Firefox/97.0', //window.navigator.userAgent,
            sdkIdentifier: `${sdkIdentifierPrefix}JavaScriptClientSDK/v${version}`,
            sdkCreator,
        };
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

    filterOutProductsThatAreNotSupportedInThisBrowser<Json extends Partial<PaymentProductsJSON>>(json: Json) {
        if (!json.paymentProducts) {
            return;
        }

        json.paymentProducts = json.paymentProducts.filter(({ id }) => this.isSupportedPaymentProductInBrowser(id));
    },

    filterOutProductsThatAreNotSupportedBySdk<Json extends Partial<PaymentProductsJSON>>(json: Json) {
        if (!json.paymentProducts) {
            return;
        }

        json.paymentProducts = json.paymentProducts.filter(({ id }) => this.isSupportedPaymentProductBySdk(id));
    },

    url: {
        /**
         * Convert multiple segments of a path into a single path
         *
         * @example:
         * ```ts
         * joinPathSegments('a/', 'b', 'c') => 'a/b/c'
         * ```
         */
        segmentsToPath(segments: string[]): string {
            return segments.map((str) => str.replace(/^\/+|\/+$/g, '')).join('/');
        },

        /**
         * Convert an object into a query string
         * Filter out falsy values
         *
         * @example:
         * ```ts
         * objectToQueryString({ a: 1, b: 2, c: false, d: null, e: undefined, f: 0, g: '' }) // => 'a=1&b=2'
         * ```
         */
        objectToQueryString(obj: Record<string, string | number | undefined>): string {
            const params = new URLSearchParams();
            for (const key of Object.keys(obj)) {
                const value = obj[key];
                if (!value) {
                    continue;
                }

                params.set(key, value.toString());
            }

            return params.toString();
        },

        /**
         * Construct url with optional query string
         *
         * @example:
         *
         * ```ts
         * const url = urlWithQueryString('https://example.com', { a: 1, b: 2 }) // => 'https://example.com?a=1&b=2'
         * ```
         */
        urlWithQueryString(basePath: string, query: Record<string, string | number | undefined>) {
            const url = new URL(basePath);
            url.search = this.objectToQueryString(query);
            return url.href;
        },
    },
};
