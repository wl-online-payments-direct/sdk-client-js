/*
 * Do not remove or alter the notices in this preamble.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import { BasicPaymentProduct } from './BasicPaymentProduct';
import { PaymentProductField } from './productField/PaymentProductField';
import { PaymentProduct302SpecificData } from './specificData/PaymentProduct302SpecificData';
import { PaymentProduct320SpecificData } from './specificData/PaymentProduct320SpecificData';
import { AccountOnFile } from '../accountOnFile/AccountOnFile';

export class PaymentProduct extends BasicPaymentProduct {
    private readonly fieldsById: Record<string, PaymentProductField>;

    constructor(
        id: number,
        paymentMethod: string,
        label?: string,
        logo?: string,
        allowsRecurring?: boolean,
        allowsTokenization?: boolean,
        displayOrder?: number,
        maxAmount?: number,
        minAmount?: number,
        usesRedirectionTo3rdParty?: boolean,
        paymentProduct302SpecificData?: PaymentProduct302SpecificData,
        paymentProduct320SpecificData?: PaymentProduct320SpecificData,
        accountsOnFile: AccountOnFile[] = [],
        readonly fields: PaymentProductField[] = [],
    ) {
        super(
            id,
            paymentMethod,
            label,
            logo,
            allowsRecurring,
            allowsTokenization,
            displayOrder,
            maxAmount,
            minAmount,
            usesRedirectionTo3rdParty,
            paymentProduct302SpecificData,
            paymentProduct320SpecificData,
            accountsOnFile,
        );

        this.fieldsById = this.fields.reduce(
            (result, field) => ({
                ...result,
                [field.id]: field,
            }),
            {},
        );
    }

    getFields(): PaymentProductField[] {
        return this.fields;
    }

    getRequiredFields(): PaymentProductField[] {
        return this.fields.filter((field) => field.isRequired());
    }

    getField(id: string): PaymentProductField | undefined {
        return this.fieldsById[id] ?? undefined;
    }
}
