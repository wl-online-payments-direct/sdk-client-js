import type { AccountOnFileJSON } from '../types';
import type { MaskedString } from './MaskedString';

import { MaskingUtil } from '../MaskingUtil';
import { AccountOnFileDisplayHints } from './AccountOnFileDisplayHints';
import { Attribute } from './Attribute';

function _parseJSON(
    _json: AccountOnFileJSON,
    _attributes: Attribute[],
    _attributeByKey: { [key: string]: Attribute | undefined },
): void {
    if (_json.attributes) {
        for (const attr of _json.attributes) {
            const attribute = new Attribute(attr);
            _attributes.push(attribute);
            _attributeByKey[attribute.key] = attribute;
        }
    }
}

export class AccountOnFile {
    readonly attributes: Attribute[];
    readonly attributeByKey: { [key: string]: Attribute | undefined };
    readonly displayHints: AccountOnFileDisplayHints;
    readonly id: string;
    readonly paymentProductId: number;

    constructor(readonly json: AccountOnFileJSON) {
        this.attributes = [];
        this.attributeByKey = {};
        this.displayHints = new AccountOnFileDisplayHints(json.displayHints);
        this.id = json.id;
        this.paymentProductId = json.paymentProductId;

        _parseJSON(json, this.attributes, this.attributeByKey);
    }

    // noinspection JSUnusedGlobalSymbols
    getLabel(): MaskedString | undefined {
        return this.getMaskedValueByAttributeKey('alias');
    }

    getMaskedValueByAttributeKey(attributeKey: string): MaskedString | undefined {
        const value = this.attributeByKey[attributeKey]?.value;
        const wildcardMask = this.displayHints.labelTemplateElementByAttributeKey[attributeKey]?.wildcardMask;

        if (value === undefined || wildcardMask === undefined) {
            return undefined;
        }

        return new MaskingUtil().applyMask(wildcardMask, value);
    }
}
