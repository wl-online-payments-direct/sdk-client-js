/*
 * Do not remove or alter the notices in this preamble.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import { vi } from 'vitest';
import type { SdkResponse } from '../../../src';
import type { ApiClient } from '../../../src/infrastructure/interfaces/ApiClient';
import { DefaultApiClient } from '../../../src/infrastructure/DefaultApiClient';

/**
 * Returns a SpyInstance for `ApiClient.get` or `ApiClient.post`
 */
export function getApiClientSpyMock<Method extends keyof ApiClient, Data>(method: Method, data: Data) {
    const stub: SdkResponse<Data> = { success: true, status: 200, data };

    // @ts-expect-error The error should be triggered if the `stub` is not of a proper type.
    return vi.spyOn(DefaultApiClient.prototype, method).mockReturnValue(Promise.resolve(stub));
}
