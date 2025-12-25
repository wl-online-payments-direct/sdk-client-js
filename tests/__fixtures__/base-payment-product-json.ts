import { accountOnFileJson, accountOnFileJson2 } from './account-on-file-json';
import type { BasicPaymentProductJson } from '../../src/types';

const networks = ['test network 1', 'test network 2', 'test network 3'];

export const basePaymentProductJson: BasicPaymentProductJson = {
    allowsInstallments: false,
    allowsRecurring: false,
    allowsTokenization: false,
    displayHints: { displayOrder: 0, logo: 'test-logo', label: 'Test label' },
    id: 1,
    paymentMethod: '',
    usesRedirectionTo3rdParty: false,
    displayHintsList: [
        {
            displayOrder: 0,
            label: 'VISA',
            logo: 'logo',
        },
    ],
    accountsOnFile: [accountOnFileJson, accountOnFileJson2],
    paymentProduct302SpecificData: {
        networks: [...networks],
    },
    paymentProduct320SpecificData: {
        networks: [...networks],
        gateway: 'test gateway',
    },
};

export const basePaymentProductJson2: BasicPaymentProductJson = {
    allowsInstallments: false,
    allowsRecurring: false,
    allowsTokenization: false,
    displayHints: { displayOrder: 0, logo: 'test-logo', label: 'Test label' },
    id: 2,
    paymentMethod: '',
    usesRedirectionTo3rdParty: false,
    displayHintsList: [
        {
            displayOrder: 0,
            label: 'VISA',
            logo: 'logo',
        },
    ],
    accountsOnFile: [accountOnFileJson, accountOnFileJson2],
    paymentProduct302SpecificData: {
        networks: [...networks],
    },
    paymentProduct320SpecificData: {
        networks: [...networks],
        gateway: 'test gateway',
    },
};
