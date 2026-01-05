/*
 * Do not remove or alter the notices in this preamble.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import { accountOnFileJson, accountOnFileJson2 } from './account-on-file-json';
import type { BasicPaymentProductDto } from '../../src/infrastructure/apiModels/paymentProduct/BasicPaymentProductDto';

const networks = ['test network 1', 'test network 2', 'test network 3'];

export const basePaymentProductJson: BasicPaymentProductDto = {
    allowsInstallments: false,
    allowsRecurring: false,
    allowsTokenization: false,
    displayHints: { displayOrder: 0, logo: 'test-logo', label: 'Test label' },
    id: 1,
    paymentMethod: '',
    usesRedirectionTo3rdParty: false,
    accountsOnFile: [accountOnFileJson, accountOnFileJson2],
    paymentProduct302SpecificData: {
        networks: [...networks],
    },
    paymentProduct320SpecificData: {
        networks: [...networks],
        gateway: 'test gateway',
    },
};

export const basePaymentProductJson2: BasicPaymentProductDto = {
    allowsInstallments: false,
    allowsRecurring: false,
    allowsTokenization: false,
    displayHints: { displayOrder: 0, logo: 'test-logo', label: 'Test label' },
    id: 2,
    paymentMethod: '',
    usesRedirectionTo3rdParty: false,
    accountsOnFile: [accountOnFileJson, accountOnFileJson2],
    paymentProduct302SpecificData: {
        networks: [...networks],
    },
    paymentProduct320SpecificData: {
        networks: [...networks],
        gateway: 'test gateway',
    },
};
