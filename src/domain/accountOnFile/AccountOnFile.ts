/*
 * Do not remove or alter the notices in this preamble.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import { AccountOnFileAttribute, AccountOnFileAttributeStatus } from './AccountOnFileAttribute';

export class AccountOnFile {
    private readonly attributeByKey: Record<string, AccountOnFileAttribute | undefined>;

    constructor(
        readonly id: string,
        readonly paymentProductId: number,
        readonly label?: string,
        private readonly attributes: AccountOnFileAttribute[] = [],
    ) {
        this.attributeByKey = this.attributes.reduce(
            (result, attribute) => ({
                ...result,
                [attribute.key]: attribute,
            }),
            {},
        );
    }

    getValue(fieldId: string): string | undefined {
        return this.attributeByKey[fieldId]?.value;
    }

    getRequiredAttributes(): AccountOnFileAttribute[] {
        return this.attributes.filter((attribute) => attribute.status === AccountOnFileAttributeStatus.MUST_WRITE);
    }

    isWritable(fieldId: string): boolean {
        return this.attributeByKey[fieldId]?.status !== AccountOnFileAttributeStatus.READ_ONLY;
    }
}
