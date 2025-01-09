import type { PaymentProductJSON } from '../../types';

export const cardPaymentProductJson: PaymentProductJSON = {
    allowsInstallments: false,
    allowsRecurring: false,
    allowsTokenization: false,
    autoTokenized: false,
    deviceFingerprintEnabled: false,
    displayHints: { displayOrder: 0, logo: '' },
    fields: [],
    id: 1,
    mobileIntegrationLevel: '',
    paymentMethod: 'card',
    type: 'product',
    usesRedirectionTo3rdParty: false,
};
