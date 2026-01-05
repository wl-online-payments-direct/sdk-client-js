/*
 * Do not remove or alter the notices in this preamble.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import type { CacheManager } from '../infrastructure/utils/CacheManager';
import type { ApiClient } from '../infrastructure/interfaces/ApiClient';
import { type ErrorResponse, ResponseError, type SdkResponse } from '../domain';

export class BaseService {
    constructor(
        protected readonly cacheManager: CacheManager,
        protected readonly apiClient: ApiClient,
    ) {}

    validateResponse<T>(response: SdkResponse<T>, errorMessage: string) {
        if (!response.success || !response.data) {
            throw new ResponseError(response.data as ErrorResponse, response.status, errorMessage);
        }
    }
}
