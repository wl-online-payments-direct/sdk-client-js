import { SDKError, type SdkErrorMetadata, SdkErrorType } from './SDKError';

export class InvalidArgumentError extends SDKError {
    constructor(message: string, metadata?: SdkErrorMetadata) {
        super(message, SdkErrorType.INVALID_ARGUMENT_ERROR, metadata);
    }
}
