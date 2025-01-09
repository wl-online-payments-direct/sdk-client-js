import type { PublicKeyJSON } from '../types';

export class PublicKeyResponse {
    readonly keyId: string;
    readonly publicKey: string;

    constructor(readonly json: PublicKeyJSON) {
        this.keyId = json.keyId;
        this.publicKey = json.publicKey;
    }
}
