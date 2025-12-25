import type { FormElementJson } from '../../types';

export class FormElement {
    readonly type: string;

    constructor(json: FormElementJson) {
        this.type = json.type;
    }
}
