import type { AccountOnFile } from './AccountOnFile';
import type { PaymentProduct } from './PaymentProduct';
import type { PaymentProductField } from './PaymentProductField';

export class PaymentRequest {
  #_fieldValues: Map<string, string | undefined>;
  #_paymentProduct?: PaymentProduct;
  #_accountOnFile?: AccountOnFile;
  #_tokenize: boolean;

  constructor() {
    this.#_fieldValues = new Map();
    this.#_tokenize = false;
  }

  setValue(paymentProductFieldId: string, value: string): void {
    this.#_fieldValues.set(paymentProductFieldId, value);
  }

  setTokenize(tokenize: boolean): void {
    this.#_tokenize = tokenize;
  }

  getTokenize(): boolean {
    return this.#_tokenize;
  }

  getErrorMessageIds(): string[] {
    return Array.from(this.#_fieldValues.entries())
      .flatMap(([id, value]) => {
        const paymentProductField =
          this.#_paymentProduct?.paymentProductFieldById[id];
        return paymentProductField?.getErrorCodes(value);
      })
      .filter(Boolean) as string[];
  }

  getValue(paymentProductFieldId: string): string | undefined {
    return this.#_fieldValues.get(paymentProductFieldId);
  }

  getValues(): Record<string, string | undefined> {
    return Object.fromEntries(this.#_fieldValues.entries());
  }

  getMaskedValue(paymentProductFieldId: string): string | undefined {
    const field =
      this.#_paymentProduct?.paymentProductFieldById[paymentProductFieldId];
    if (!field) return undefined;

    const value = this.getValue(paymentProductFieldId);
    if (value === undefined) return undefined;

    return field.applyMask(value).formattedValue;
  }

  getMaskedValues(): Record<string, string | undefined> {
    return Object.fromEntries(
      Array.from(this.#_fieldValues).map(([id]) => [
        id,
        this.getMaskedValue(id),
      ]),
    );
  }

  getUnmaskedValue(paymentProductFieldId: string): string | undefined {
    const field =
      this.#_paymentProduct?.paymentProductFieldById[paymentProductFieldId];
    if (!field) return undefined;

    const value = this.getValue(paymentProductFieldId);
    if (value === undefined) return undefined;

    return field.removeMask(field.applyMask(value)?.formattedValue);
  }

  getUnmaskedValues(): Record<string, string | undefined> {
    return Object.fromEntries(
      Array.from(this.#_fieldValues).map(([id]) => [
        id,
        this.getUnmaskedValue(id),
      ]),
    );
  }

  setPaymentProduct(paymentProduct: PaymentProduct & { type?: string }) {
    if (paymentProduct.type === 'group') return;
    this.#_paymentProduct = paymentProduct;
  }

  getPaymentProduct(): PaymentProduct | undefined {
    return this.#_paymentProduct;
  }

  setAccountOnFile(accountOnFile?: AccountOnFile | null) {
    if (!accountOnFile) return;
    const attributes = accountOnFile.attributes;
    attributes.forEach(({ key }) => this.#_fieldValues.delete(key));
    this.#_accountOnFile = accountOnFile;
  }

  getAccountOnFile(): AccountOnFile | undefined {
    return this.#_accountOnFile;
  }

  isValid(): boolean {
    const paymentProduct = this.getPaymentProduct();
    if (!paymentProduct) return false;

    if (this.getErrorMessageIds().length) return false;

    if (!paymentProduct.paymentProductFields.length) return true;

    // besides checking the fields for errors check if
    // all mandatory fields are present as well
    const aof = this.getAccountOnFile();
    const hasValueInAof = (fieldId: PaymentProductField['id']): boolean => {
      if (aof?.paymentProductId !== paymentProduct.id) return false;
      const attribute = aof?.attributeByKey[fieldId];
      return !!attribute && attribute.status !== 'MUST_WRITE';
    };

    return paymentProduct.paymentProductFields.some((field) => {
      if (!field.dataRestrictions.isRequired) return true;

      // is this field present in the request?
      // if the account on file has the field we can ignore it
      return this.getValue(field.id) || hasValueInAof(field.id);
    });
  }
}
