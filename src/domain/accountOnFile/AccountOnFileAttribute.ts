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
