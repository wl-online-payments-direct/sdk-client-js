/*
 * Do not remove or alter the notices in this preamble.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import { AccountOnFile } from '../accountOnFile/AccountOnFile';
import { PaymentProduct302SpecificData } from './specificData/PaymentProduct302SpecificData';
import { PaymentProduct320SpecificData } from './specificData/PaymentProduct320SpecificData';

export class BasicPaymentProduct {
    readonly accountsOnFile: AccountOnFile[] = [];

    constructor(
        readonly id: number,
        readonly paymentMethod: string,
        readonly label?: string,
        readonly logo?: string,
        readonly allowsRecurring?: boolean,
        readonly allowsTokenization?: boolean,
        readonly displayOrder?: number,
        readonly maxAmount?: number,
        readonly minAmount?: number,
        readonly usesRedirectionTo3rdParty?: boolean,
        readonly paymentProduct302SpecificData?: PaymentProduct302SpecificData,
        readonly paymentProduct320SpecificData?: PaymentProduct320SpecificData,
        accountsOnFile: AccountOnFile[] = [],
    ) {
        this.accountsOnFile = accountsOnFile.filter((aof) => aof.paymentProductId === this.id);
    }

    getAccountOnFile(id: string): AccountOnFile | undefined {
        return this.accountsOnFile.find((acc) => acc.id === id);
    }
}
