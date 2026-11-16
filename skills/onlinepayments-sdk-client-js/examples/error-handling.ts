import {
    ClickToPayError,
    CommunicationError,
    ConfigurationError,
    EncryptionError,
    InvalidArgumentError,
    ResponseError,
    type ErrorResponse,
} from 'onlinepayments-sdk-client-js';

// [START handle-sdk-error]
export type ErrorAction =
    | 'show-validation-errors' // the customer can fix the input
    | 'retry' // a network problem; the same call can be tried again
    | 'restart-checkout' // get new session data from your backend and initialise the SDK again
    | 'offer-other-method' // Click to Pay failed; offer card entry
    | 'integration-error'; // a bug in the integration; fix the code

export function classifySdkError(error: unknown): ErrorAction {
    if (error instanceof InvalidArgumentError) {
        // Thrown for invalid input, for example by encryptPaymentRequest when the request does not
        // validate, or by setValue on a READ_ONLY field.
        return 'show-validation-errors';
    }
    if (error instanceof CommunicationError) {
        // No response, or a response that is not JSON. error.httpStatusCode may be set.
        return 'retry';
    }
    if (error instanceof ResponseError) {
        // The Client API returned an error, for example because the session is no longer valid.
        // Log only the error id and codes: never log payment data.
        const response = error.metadata as ErrorResponse | undefined;
        console.warn('Client API error', error.httpStatusCode, response?.errorId);
        return 'restart-checkout';
    }
    if (error instanceof EncryptionError) {
        return 'restart-checkout';
    }
    if (error instanceof ClickToPayError) {
        return 'offer-other-method';
    }
    if (error instanceof ConfigurationError) {
        // Wrong session data or SDK setup, or a Click to Pay method used at the wrong time.
        return 'integration-error';
    }
    throw error;
}
// [END handle-sdk-error]
