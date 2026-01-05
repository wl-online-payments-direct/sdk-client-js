/*
 * Do not remove or alter the notices in this preamble.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import type { AccountOnFileDto } from '../accountOnFile/AccountOnFile';
import type { PaymentProductDisplayHintsDto } from './displayHints/PaymentProductDisplayHintsDto';
import { PaymentProduct302SpecificData, PaymentProduct320SpecificData } from '../../../domain';

export interface BasicPaymentProductDto {
    accountsOnFile?: AccountOnFileDto[];
    allowsInstallments?: boolean;
    allowsRecurring?: boolean;
    allowsTokenization?: boolean;
    displayHints: PaymentProductDisplayHintsDto;
    id: number;
    isJavaScriptRequired?: boolean;
    maxAmount?: number;
    minAmount?: number;
    paymentMethod: string;
    paymentProduct302SpecificData?: PaymentProduct302SpecificData;
    paymentProduct320SpecificData?: PaymentProduct320SpecificData;
    paymentProductGroup?: string;
    usesRedirectionTo3rdParty?: boolean;
    allowsAuthentication?: boolean;
}
