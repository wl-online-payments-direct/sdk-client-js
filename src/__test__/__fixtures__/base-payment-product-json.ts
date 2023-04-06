import type { BasicPaymentProductJSON } from '../../types';

export const basePaymentProductJson: BasicPaymentProductJSON = {
  allowsInstallments: false,
  allowsRecurring: false,
  allowsTokenization: false,
  autoTokenized: false,
  deviceFingerprintEnabled: false,
  displayHints: { displayOrder: 0, logo: '' },
  id: 0,
  paymentMethod: '',
  mobileIntegrationLevel: '',
  usesRedirectionTo3rdParty: false,
  type: 'product',
};
