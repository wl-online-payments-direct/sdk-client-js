/*
 * Do not remove or alter the notices in this preamble.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import type { PaymentProductFieldType } from '../../../domain/paymentProduct/productField/PaymentProductFieldType';
import type { ProductFieldDisplayHintsDto } from './displayHints/ProductFieldDisplayHintsDto';
import type { DataRestrictionsDto } from './DataRestrictionsDto';

export interface PaymentProductFieldDto {
    displayHints?: ProductFieldDisplayHintsDto;
    id: string;
    type: PaymentProductFieldType;
    usedForLookup?: boolean;
    dataRestrictions: DataRestrictionsDto;
}
