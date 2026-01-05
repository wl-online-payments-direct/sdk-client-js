/*
 * Do not remove or alter the notices in this preamble.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import type { ErrorResponse } from './ErrorResponse';

export enum SdkErrorType {
    INVALID_ARGUMENT_ERROR = 'INVALID_ARGUMENT_ERROR',
    CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
    COMMUNICATION_ERROR = 'COMMUNICATION_ERROR',
    CLIENT_ERROR = 'CLIENT_ERROR',
    ENCRYPTION_ERROR = 'ENCRYPTION_ERROR',
}

export type SdkErrorMetadata = Record<string, unknown> | ErrorResponse;

export abstract class SdkError extends Error {
    readonly code: SdkErrorType;
    readonly metadata?: SdkErrorMetadata;

    protected constructor(message: string, code: SdkErrorType, metadata?: SdkErrorMetadata) {
        super(message);

        this.name = code;
        this.code = code;
        this.metadata = metadata;
    }
}
