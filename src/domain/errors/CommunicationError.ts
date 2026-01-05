/*
 * Do not remove or alter the notices in this preamble.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import { SdkError, SdkErrorType } from './SdkError';

export class CommunicationError extends SdkError {
    readonly httpStatusCode?: number;
    readonly response?: string;

    constructor(statusCode?: number, response?: string) {
        super('', SdkErrorType.COMMUNICATION_ERROR);

        this.response = response;
        this.httpStatusCode = statusCode;
    }
}
