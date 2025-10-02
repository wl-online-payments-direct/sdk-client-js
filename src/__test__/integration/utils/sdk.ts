import type { SessionDetails } from '../../../types';

import sdk from 'onlinepayments-sdk-nodejs';
import { getEnvVar } from './env';
import type { CreatePaymentResponse } from 'onlinepayments-sdk-nodejs/lib/esm/src/generated/model/domain';

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
}): Promise<SessionDetails> {
    const sdkResponse = await client.sessions.createSession(merchantId, sessionRequest, paymentContext);
    if (!sdkResponse?.isSuccess) {
        console.error('sdkResponse', JSON.stringify(sdkResponse, null, 2));
        throw new Error('Cannot create session');
    }

    return sdkResponse.body as SessionDetails;
}

/**
 * Create payment from Connect Node.js SDK
 */
export async function createPaymentFromSdk({
    merchantId,
    client = defaultSdkClient,
    postData = {},
    paymentContext = null,
}: {
    merchantId: string;
    client?: Client;
    postData: CreatePaymentRequest;
    paymentContext?: PaymentContext | null;
}): Promise<CreatePaymentResponse> {
    const sdkResponse = await client.payments.createPayment(merchantId, postData, paymentContext);
    if (!sdkResponse?.body) {
        console.error('sdkResponse', JSON.stringify(sdkResponse, null, 2));
        throw new Error('Can not create payment');
    }

    return sdkResponse.body as CreatePaymentResponse;
}
