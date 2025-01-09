import type { AccountOnFileDisplayHintsJSON } from '../types';

import { LabelTemplateElement } from './LabelTemplateElement';

type LabelTemplateElementByAttributeKey = Record<string, LabelTemplateElement | undefined>;

function _parseJSON(
    _json: AccountOnFileDisplayHintsJSON,
    _labelTemplate: LabelTemplateElement[],
    _labelTemplateElementByAttributeKey: LabelTemplateElementByAttributeKey,
) {
    if (!_json.labelTemplate) {
        return;
    }

    for (const element of _json.labelTemplate) {
        const labelTemplateElement = new LabelTemplateElement(element);
        _labelTemplate.push(labelTemplateElement);
        _labelTemplateElementByAttributeKey[labelTemplateElement.attributeKey] = labelTemplateElement;
    }
}

export class AccountOnFileDisplayHints {
    readonly logo: string;
    readonly labelTemplate: LabelTemplateElement[];
    readonly labelTemplateElementByAttributeKey: LabelTemplateElementByAttributeKey;

    constructor(readonly json: AccountOnFileDisplayHintsJSON) {
        this.logo = json.logo;
        this.labelTemplate = [];
        this.labelTemplateElementByAttributeKey = {};

        _parseJSON(json, this.labelTemplate, this.labelTemplateElementByAttributeKey);
    }
}
