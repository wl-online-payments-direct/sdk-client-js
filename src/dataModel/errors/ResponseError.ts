import { SDKError, type SdkErrorMetadata, SdkErrorType } from './SDKError';
import type { SdkResponse } from '../../types';

export class ResponseError extends SDKError {
    readonly httpStatusCode?: number;

    constructor(sdkResponse: SdkResponse, message?: string) {
        super(message ?? '', SdkErrorType.CLIENT_ERROR, sdkResponse.data as SdkErrorMetadata);

        this.httpStatusCode = sdkResponse.status;
    }
}
