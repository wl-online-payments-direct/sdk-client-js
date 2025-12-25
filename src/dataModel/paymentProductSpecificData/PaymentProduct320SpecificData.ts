import type { PaymentProduct320SpecificDataJson } from '../../types';

export class PaymentProduct320SpecificData {
    readonly networks: string[];
    readonly gateway: string;

    constructor(json: PaymentProduct320SpecificDataJson) {
        this.networks = json.networks;
        this.gateway = json.gateway;
    }
}
