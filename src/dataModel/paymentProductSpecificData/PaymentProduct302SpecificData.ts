import type { PaymentProduct302SpecificDataJson } from '../../types';

export class PaymentProduct302SpecificData {
    readonly networks: string[];

    constructor(json: PaymentProduct302SpecificDataJson) {
        this.networks = json.networks;
    }
}
