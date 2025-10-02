import { vi } from 'vitest';
import type { SdkResponse } from '../../../types';
import { Net } from '../../../utils/Net';

/**
 * Returns a SpyInstance for `Net.get` or `Net.post`
 */
export function getNetSpyMock<Method extends keyof typeof Net, Data>(method: Method, data: Data) {
    const stub: SdkResponse<Data> = { success: true, status: 200, data };

    // @ts-expect-error The error should be triggered if the `stub` is not of a proper type.
    return vi.spyOn(Net, method).mockReturnValue(stub);
}
