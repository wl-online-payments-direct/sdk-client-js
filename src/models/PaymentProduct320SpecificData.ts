import type { PaymentProduct320SpecificDataJSON } from '../types';

export class PaymentProduct320SpecificData {
    readonly networks: string[];
    readonly gateway: string;

    constructor(readonly json: PaymentProduct320SpecificDataJSON) {
        this.networks = json.networks;
        this.gateway = json.gateway;
    }
}
