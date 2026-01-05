/*
 * Do not remove or alter the notices in this preamble.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

export enum AccountOnFileAttributeStatus {
    READ_ONLY = 'READ_ONLY',
    CAN_WRITE = 'CAN_WRITE',
    MUST_WRITE = 'MUST_WRITE',
}

export class AccountOnFileAttribute {
    constructor(
        readonly key: string,
        readonly value: string,
        readonly status: AccountOnFileAttributeStatus,
    ) {}
}
