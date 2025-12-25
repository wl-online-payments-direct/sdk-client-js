import { SDKError, type SdkErrorMetadata, SdkErrorType } from './SDKError';

export class EncryptionError extends SDKError {
    constructor(message: string, metadata?: SdkErrorMetadata) {
        super(message, SdkErrorType.ENCRYPTION_ERROR, metadata);
    }
}
