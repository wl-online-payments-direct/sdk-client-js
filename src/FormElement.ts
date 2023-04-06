import type { PaymentProductFieldFormElementJSON } from './types';

import { ValueMappingElement } from './ValueMappingElement';

function _parseJSON(
  _json: PaymentProductFieldFormElementJSON,
  _valueMapping: ValueMappingElement[],
) {
  if (!_json.valueMapping) return;
  for (const mapping of _json.valueMapping) {
    _valueMapping.push(new ValueMappingElement(mapping));
  }
}

export class FormElement {
  readonly type: string;
  readonly valueMapping: ValueMappingElement[];

  constructor(readonly json: PaymentProductFieldFormElementJSON) {
    this.type = json.type;
    this.valueMapping = [];

    _parseJSON(json, this.valueMapping);
  }
}
