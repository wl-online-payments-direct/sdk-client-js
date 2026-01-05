/*
 * Do not remove or alter the notices in this preamble.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import type { SessionData } from '../../../src';

import sdk from 'onlinepayments-sdk-nodejs';
import { getEnvVar } from './env';
// @ts-ignore
import type { CreatePaymentResponse, Order } from 'onlinepayments-sdk-nodejs/lib/esm/src/generated/model/domain';

const HOST = getEnvVar('VITE_ONLINEPAYMENTS_SDK_HOST');
const API_ID = getEnvVar('VITE_ONLINEPAYMENTS_SDK_API_ID');
const API_SECRET = getEnvVar('VITE_ONLINEPAYMENTS_SDK_API_SECRET');

const defaultOptions = {
    host: HOST,
    apiKeyId: API_ID,
    secretApiKey: API_SECRET,
    integrator: 'test',
};

export const defaultSdkClient = sdk.init(defaultOptions);

type Client = ReturnType<typeof createSdkClient>;
type SessionRequest = Parameters<typeof defaultSdkClient.sessions.createSession>[1];
type PaymentContext = Parameters<typeof defaultSdkClient.sessions.createSession>[2];
type CreatePaymentRequest = Parameters<typeof defaultSdkClient.payments.createPayment>[1];

export function createSdkClient(options: Partial<Parameters<typeof sdk.init>[0]> = {}) {
    return sdk.init({ ...options, ...defaultOptions });
}

/**
 * Create a session from Connect Node.js SDK
 */
export async function getSessionFromSdk({
    merchantId,
    client = defaultSdkClient,
    sessionRequest = {},
    paymentContext = null,
}: {
    merchantId: string;
    client?: Client;
    sessionRequest?: SessionRequest | Record<string, unknown>;
    paymentContext?: PaymentContext | null;
}): Promise<SessionData> {
    try {
        const sdkResponse = await client.sessions.createSession(merchantId, sessionRequest, paymentContext);
        if (!sdkResponse?.isSuccess) {
            console.error('sdkResponse', JSON.stringify(sdkResponse, null, 2));
            // noinspection ExceptionCaughtLocallyJS
            throw new Error('Cannot create session');
        }

        return sdkResponse.body as SessionData;
    } catch (error) {
        throw new Error('Cannot create session: ' + JSON.stringify(error));
    }
}

/**
 * Create payment from Connect Node.js SDK
 */
export async function createPaymentFromSdk(
    merchantId: string,
    postData: CreatePaymentRequest,
    paymentContext?: PaymentContext | null,
    client: Client = defaultSdkClient,
): Promise<CreatePaymentResponse> {
    const request: CreatePaymentRequest = {
        ...postData,
        order: getOrderDetails(),
    };
    const sdkResponse = await client.payments.createPayment(merchantId, request, paymentContext);
    if (!sdkResponse?.body) {
        console.error('sdkResponse', JSON.stringify(sdkResponse, null, 2));
        throw new Error('Can not create payment');
    }

    return sdkResponse.body as CreatePaymentResponse;
}

export async function createTokenRequest(
    merchantId: string,
    postData: Record<string, unknown> = {},
    client = defaultSdkClient,
): Promise<string> {
    const sdkResponse = await client.tokens.createToken(merchantId, postData);
    // @ts-expect-error - the response is not typed correctly
    const result = sdkResponse?.body?.token;
    if (!result) {
        console.error('sdkResponse', JSON.stringify(sdkResponse, null, 2));

        throw new Error('Can not create token');
    }

    return result;
}

function getOrderDetails(): Order {
    return {
        amountOfMoney: {
            amount: 1000,
            currencyCode: 'EUR',
        },
        customer: {
            billingAddress: {
                countryCode: 'BE',
            },
            contactDetails: {
                emailAddress: 'wile.e.coyote@acmelabs.com',
                phoneNumber: '+321234567890',
            },
            device: {
                acceptHeader: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                browserData: {
                    colorDepth: 99,
                    javaEnabled: true,
                    javaScriptEnabled: true,
                    screenHeight: '768',
                    screenWidth: '1024',
                },
                ipAddress: '123.123.123.123',
                locale: 'en_GB',
                userAgent:
                    'Mozilla/5.0(WindowsNT10.0;Win64;x64)AppleWebKit/537.36(KHTML,likeGecko)Chrome/75.0.3770.142Safari/537.36',
                timezoneOffsetUtcMinutes: '-180',
            },
        },
        shipping: {
            addressIndicator: 'same-as-billing',
            emailAddress: 'wile.e.coyote@acmelabs.com',
            firstUsageDate: '20100101',
            isFirstUsage: false,
            method: {
                details: 'quickshipment',
                name: 'fast-delivery',
                speed: 24,
                type: 'carrier-low-cost',
            },
            type: 'overnight',
            shippingCost: 0,
            shippingCostTax: 0,
        },
    };
}
