/*
 * Do not remove or alter the notices in this preamble.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import { SdkError, type SdkErrorMetadata, SdkErrorType } from './SdkError';

export class EncryptionError extends SdkError {
    constructor(message: string, metadata?: SdkErrorMetadata) {
        super(message, SdkErrorType.ENCRYPTION_ERROR, metadata);
    }
}
