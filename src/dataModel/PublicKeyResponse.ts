import type { PublicKeyJson } from '../types';

export class PublicKeyResponse {
    readonly keyId: string;
    readonly publicKey: string;

    constructor(json: PublicKeyJson) {
        this.keyId = json.keyId;
        this.publicKey = json.publicKey;
    }
}
