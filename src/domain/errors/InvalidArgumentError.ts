/*
 * Do not remove or alter the notices in this preamble.
 *
 * This software is owned by Worldline and may not be be altered, copied, reproduced, republished, uploaded, posted, transmitted or distributed in any way, without the prior written consent of Worldline.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import { SdkError, type SdkErrorMetadata, SdkErrorType } from './SdkError';

export class InvalidArgumentError extends SdkError {
    constructor(message: string, metadata?: SdkErrorMetadata) {
        super(message, SdkErrorType.INVALID_ARGUMENT_ERROR, metadata);
    }
}
