/*
 * Do not remove or alter the notices in this preamble.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import type { AmountOfMoney } from '../AmountOfMoney';
import type { SurchargeResult } from './SurchargeResult';
import type { SurchargeRate } from './SurchargeRate';

export interface Surcharge {
    paymentProductId: number;
    result: SurchargeResult;
    netAmount: AmountOfMoney;
    surchargeAmount: AmountOfMoney;
    totalAmount: AmountOfMoney;
    surchargeRate?: SurchargeRate;
}
