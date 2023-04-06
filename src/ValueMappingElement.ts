import type { ValueMappingElementJSON } from './types';

export class ValueMappingElement {
  readonly displayName?: string;
  readonly value: string;

  constructor(json: ValueMappingElementJSON) {
    this.displayName = json.displayName;
    this.value = json.value;
  }
}
