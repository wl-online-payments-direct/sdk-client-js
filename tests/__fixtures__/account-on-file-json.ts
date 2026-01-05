/*
 * Do not remove or alter the notices in this preamble.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import type { AccountOnFileDto } from '../../src/infrastructure/apiModels/accountOnFile/AccountOnFile';
import { AccountOnFileAttributeStatus } from '../../src';

export const accountOnFileJson: AccountOnFileDto = {
    attributes: [
        {
            key: 'alias',
            status: AccountOnFileAttributeStatus.READ_ONLY,
            value: '411111XXXXXX1111',
        },
        {
            key: 'cardNumber',
            status: AccountOnFileAttributeStatus.READ_ONLY,
            value: '9999-9999-9999-9999',
        },
        {
            key: 'cvv',
            status: AccountOnFileAttributeStatus.MUST_WRITE,
            value: '',
        },
    ],
    displayHints: {
        labelTemplate: [
            {
                attributeKey: 'alias',
                mask: '{{9999}} {{9999}} {{9999}} {{9999}} {{999}}',
            },
        ],
        logo: 'test-logo',
    },
    id: '1234',
    paymentProductId: 1,
};

export const accountOnFileJson2: AccountOnFileDto = {
    attributes: [
        {
            key: 'alias',
            status: AccountOnFileAttributeStatus.READ_ONLY,
            value: 'test label',
        },
        {
            key: 'cardNumber',
            status: AccountOnFileAttributeStatus.CAN_WRITE,
            value: '9999-9999-9999-9999',
        },
    ],
    displayHints: {
        labelTemplate: [
            {
                attributeKey: 'alias',
                mask: '',
            },
        ],
        logo: 'test-logo',
    },
    id: '5678',
    paymentProductId: 2,
};
