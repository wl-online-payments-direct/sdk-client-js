/*
 * Do not remove or alter the notices in this preamble.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import type { IinDetail } from './IinDetail';
import type { IinDetailStatus } from './IinDetailStatus';

export class IinDetailsResponse {
    constructor(
        readonly status: IinDetailStatus,
        readonly countryCode?: string,
        readonly paymentProductId?: number,
        readonly isAllowedInContext?: boolean,
        readonly coBrands?: IinDetail[],
    ) {}
}
