// noinspection JSUnusedGlobalSymbols

import type { AccountOnFile } from './models/AccountOnFile';
import type { PaymentProduct } from './models/PaymentProduct';
import type { PaymentProductField } from './models/PaymentProductField';

export class PaymentRequest {
    #fieldValues: Map<string, string | undefined>;
    #paymentProduct?: PaymentProduct;
    #accountOnFile?: AccountOnFile;
    #tokenize: boolean;

    /**
     * Creates and instance of the PaymentRequest.
     *
     */
    constructor() {
        this.#fieldValues = new Map();
        this.#tokenize = false;
    }

    /**
     * Sets the value for a given payment product field.
     *
     * @param {string} paymentProductFieldId - The ID of the payment product field.
     * @param {string?} value - The value to set.
     */
    setValue(paymentProductFieldId: string, value?: string): void {
        this.#fieldValues.set(paymentProductFieldId, value);
    }

    /**
     * Sets the values of the given payment product fields with the provided key-value pairs.
     *
     * @param {Record<string, string>} values - An object containing key-value pairs where the key is an ID of the
     *     payment product field and the value is a string representing field value.
     * @return {void} This method does not return a value.
     */
    setValues(values: Record<string, string | undefined>): void {
        for (const [key, value] of Object.entries(values)) {
            this.setValue(key, value);
        }
    }

    /**
     * Enables or disables tokenization for the payment request.
     *
     * @param {boolean} tokenize - A boolean indicating if tokenization is enabled.
     */
    setTokenize(tokenize: boolean): void {
        this.#tokenize = tokenize;
    }

    /**
     * Checks if tokenization is enabled for the payment request.
     *
     * @returns {boolean} A boolean indicating if tokenization is enabled.
     */
    getTokenize(): boolean {
        return this.#tokenize;
    }

    /**
     * Retrieves the error message IDs for all fields in the payment request.
     *
     * @returns {string[]} An array of error message IDs.
     */
    getErrorMessageIds(): string[] {
        return Array.from(this.#fieldValues.entries())
            .flatMap(([id, value]) => {
                const paymentProductField = this.#paymentProduct?.paymentProductFieldById[id];
                return paymentProductField?.getErrorCodes(value);
            })
            .filter(Boolean) as string[];
    }

    /**
     * Retrieves the value for a specific payment product field.
     *
     * @param {string} paymentProductFieldId - The ID of the payment product field.
     * @returns {string | undefined} The value of the field, or undefined if not set.
     */
    getValue(paymentProductFieldId: string): string | undefined {
        return this.#fieldValues.get(paymentProductFieldId);
    }

    /**
     * Retrieves all field values in the payment request as a record.
     *
     * @returns {Record<string, string | undefined>} A record of field IDs to their respective values.
     */
    getValues(): Record<string, string | undefined> {
        return Object.fromEntries(this.#fieldValues.entries());
    }

    /**
     * Retrieves the masked value for a specific payment product field.
     *
     * @param {string} paymentProductFieldId - The ID of the payment product field.
     * @returns {string | undefined} The masked value of the field, or undefined if not set.
     */
    getMaskedValue(paymentProductFieldId: string): string | undefined {
        const value = this.getValue(paymentProductFieldId);
        if (value === undefined) {
            return value;
        }

        const field = this.#paymentProduct?.paymentProductFieldById[paymentProductFieldId];
        if (!field) {
            return undefined;
        }

        return field.applyMask(value).formattedValue;
    }

    /**
     * Retrieves the masked values for all fields in the payment request.
     *
     * @returns {Record<string, string | undefined>} A record of field IDs to their masked values.
     */
    getMaskedValues(): Record<string, string | undefined> {
        return Object.fromEntries(Array.from(this.#fieldValues).map(([id]) => [id, this.getMaskedValue(id)]));
    }

    /**
     * Retrieves the unmasked value for a specific payment product field.
     *
     * @param {string} paymentProductFieldId - The ID of the payment product field.
     * @returns {string | undefined} The unmasked value of the field, or undefined if not set.
     */
    getUnmaskedValue(paymentProductFieldId: string): string | undefined {
        const value = this.getValue(paymentProductFieldId);
        if (value === undefined) {
            return value;
        }

        const field = this.#paymentProduct?.paymentProductFieldById[paymentProductFieldId];
        if (!field) {
            return undefined;
        }

        return field.removeMask(field.applyMask(value)?.formattedValue);
    }

    /**
     * Retrieves the unmasked values for all fields in the payment request.
     *
     * @returns {Record<string, string | undefined>} A record of field IDs to their unmasked values.
     */
    getUnmaskedValues(): Record<string, string | undefined> {
        return Object.fromEntries(Array.from(this.#fieldValues).map(([id]) => [id, this.getUnmaskedValue(id)]));
    }

    /**
     * Sets the payment product for the payment request.
     *
     * @param {PaymentProduct & { type?: string }} paymentProduct - The payment product to set.
     */
    setPaymentProduct(paymentProduct: PaymentProduct & { type?: string }) {
        if (paymentProduct.type === 'group') {
            return;
        }

        this.#paymentProduct = paymentProduct;
    }

    /**
     * Retrieves the currently set payment product for the payment request.
     *
     * @returns {PaymentProduct?} The payment product, or undefined if not set.
     */
    getPaymentProduct(): PaymentProduct | undefined {
        return this.#paymentProduct;
    }

    /**
     * Sets the account on file for the payment request. Clears any field values
     * associated with the account on file attributes.
     *
     * @param {AccountOnFile | null} accountOnFile - The account on file to set, or null/undefined to clear it.
     */
    setAccountOnFile(accountOnFile: AccountOnFile | null) {
        if (!accountOnFile) {
            return;
        }

        const attributes = accountOnFile.attributes;
        attributes.forEach(({ key }) => this.#fieldValues.delete(key));
        this.#accountOnFile = accountOnFile;
    }

    /**
     * Retrieves the currently set account on file for the payment request.
     *
     * @returns {AccountOnFile?} The account on file, or undefined if not set.
     */
    getAccountOnFile(): AccountOnFile | undefined {
        return this.#accountOnFile;
    }

    /**
     * Gets the payment product id.
     *
     * @returns {number}
     */
    getPaymentProductId(): number | undefined {
        return this.#paymentProduct?.id;
    }

    /**
     * Checks if the payment request is valid. Ensures that there are no error
     * messages and all mandatory fields are provided.
     *
     * @returns {boolean} A boolean indicating if the request is valid.
     */
    isValid(): boolean {
        const paymentProduct = this.getPaymentProduct();
        if (!paymentProduct) {
            return false;
        }

        if (!paymentProduct.paymentProductFields.length) {
            return true;
        }

        if (this.getErrorMessageIds().length) {
            return false;
        }

        // besides checking the fields for errors, check if
        // all mandatory fields are present as well
        const aof = this.getAccountOnFile();
        const hasValueInAof = (fieldId: PaymentProductField['id']): boolean => {
            if (aof?.paymentProductId !== paymentProduct.id) {
                return false;
            }

            const attribute = aof?.attributeByKey[fieldId];

            return !!attribute && attribute.status !== 'MUST_WRITE';
        };

        return paymentProduct.paymentProductFields.reduce((valid, field) => {
            if (!field.dataRestrictions.isRequired) {
                return valid && true;
            }

            // is this field present in the request?
            // if the account on file has the field, we can ignore it
            return valid && !!(this.getValue(field.id) || hasValueInAof(field.id));
        }, true);
    }
}
