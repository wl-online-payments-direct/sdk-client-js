import type { AccountOnFileAttributeJson } from '../types';

export class Attribute {
    readonly key: string;
    readonly value: string;
    readonly status: string; //ENUM

    constructor(json: AccountOnFileAttributeJson) {
        this.key = json.key;
        this.value = json.value;
        this.status = json.status;
    }
}
