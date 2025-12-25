import { SDKError, type SdkErrorMetadata, SdkErrorType } from './SDKError';

export class ConfigurationError extends SDKError {
    constructor(message: string, metadata?: SdkErrorMetadata) {
        super(message, SdkErrorType.CONFIGURATION_ERROR, metadata);
    }
}
