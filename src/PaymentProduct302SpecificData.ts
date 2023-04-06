import type { PaymentProduct302SpecificDataJSON } from './types';

export class PaymentProduct302SpecificData {
  readonly networks: string[];

  constructor(readonly json: PaymentProduct302SpecificDataJSON) {
    this.networks = json.networks;
  }
}
