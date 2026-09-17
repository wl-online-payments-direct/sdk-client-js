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

import type { ClickToPayCustomerStatus } from './ClickToPayCustomerStatus';
import type { ClickToPayCorrelationId } from './ClickToPayCorrelationId';
import type { ClickToPaySdkPerformance } from './ClickToPaySdkPerformance';
import type { ClickToPayUserAction } from './ClickToPayUserAction';

export interface ClickToPayPerformance {
    readonly correlationId: ClickToPayCorrelationId;
    readonly referenceTimestamp?: Date;
    readonly totalLoadingTime: number;
    readonly customerStatus?: ClickToPayCustomerStatus;
    readonly sdkPerformance: ClickToPaySdkPerformance;
    readonly userActions: ClickToPayUserAction[];
}
