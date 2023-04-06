import type { Exclusive } from './common';

export interface PaymentProductSessionContext {
  displayName: string;
  domainName: string;
  validationURL: string;
}

export type SessionDetails = Record<'customerId', string> &
  Exclusive<{ assetsBaseUrl: string }, { assetUrl: string }> &
  Exclusive<{ clientSessionId: string }, { clientSessionID: string }> &
  Exclusive<{ apiBaseUrl: string }, { clientApiUrl: string }>;
