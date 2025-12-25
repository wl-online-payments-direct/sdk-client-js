export enum SdkErrorType {
    INVALID_ARGUMENT_ERROR = 'INVALID_ARGUMENT_ERROR',
    CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
    CLIENT_ERROR = 'CLIENT_ERROR',
    ENCRYPTION_ERROR = 'ENCRYPTION_ERROR',
}

export type SdkErrorMetadata = Record<string, unknown>;

export abstract class SDKError extends Error {
    readonly code: SdkErrorType;
    readonly metadata?: SdkErrorMetadata;

    protected constructor(message: string, code: SdkErrorType, metadata?: SdkErrorMetadata) {
        super(message);

        this.name = code;
        this.code = code;
        this.metadata = metadata;
    }
}
