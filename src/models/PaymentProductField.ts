import type { PaymentProductFieldJSON } from '../types';
import type { MaskedString } from './MaskedString';

import { MaskingUtil } from '../MaskingUtil';
import { DataRestrictions } from './DataRestrictions';
import { PaymentProductFieldDisplayHints } from './PaymentProductFieldDisplayHints';

export class PaymentProductField {
    #_errorCodes: string[];
    readonly displayHints?: PaymentProductFieldDisplayHints;
    readonly id: string;
    readonly type: string;
    readonly dataRestrictions: DataRestrictions;

    constructor(readonly json: PaymentProductFieldJSON) {
        this.#_errorCodes = [];
        this.id = json.id;
        this.type = json.type;
        this.dataRestrictions = new DataRestrictions(json.dataRestrictions);
        this.displayHints = json.displayHints ? new PaymentProductFieldDisplayHints(json.displayHints) : undefined;
    }

    getErrorCodes(value?: string): string[] {
        if (value) {
            this.#_errorCodes = [];
            this.isValid(value);
        }

        return this.#_errorCodes;
    }

    isValid(value: string): boolean {
        // isValid checks all dataRestrictions
        const validators = this.dataRestrictions.validationRules;
        let hasError = false;

        // Apply masking value first
        const maskedValue = this.applyMask(value);
        value = this.removeMask(maskedValue.formattedValue);
        for (const validator of validators) {
            if (!validator.validate(value)) {
                hasError = true;
                this.#_errorCodes.push(validator.errorMessageId);
            }
        }

        return !hasError;
    }

    applyMask(newValue: string, oldValue?: string): MaskedString {
        const maskingUtil = new MaskingUtil();

        return maskingUtil.applyMask(this.displayHints?.mask, newValue, oldValue);
    }

    applyWildcardMask(newValue: string, oldValue?: string): MaskedString {
        const maskingUtil = new MaskingUtil();

        return maskingUtil.applyMask(this.displayHints?.wildcardMask, newValue, oldValue);
    }

    removeMask(value: string): string {
        const maskingUtil = new MaskingUtil();

        return maskingUtil.removeMask(this.displayHints?.mask, value);
    }
}
