/*
 * Do not remove or alter the notices in this preamble.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import type { RateDetails } from './RateDetails';
import type { AmountOfMoney } from '../AmountOfMoney';

export interface DccProposal {
    baseAmount: AmountOfMoney;
    targetAmount: AmountOfMoney;
    rate: RateDetails;
    disclaimerReceipt?: string;
    disclaimerDisplay?: string;
}
