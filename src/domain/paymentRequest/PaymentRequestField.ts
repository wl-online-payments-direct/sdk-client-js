/*
 * Do not remove or alter the notices in this preamble.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import { PaymentProductField } from '../paymentProduct/productField/PaymentProductField';
import { InvalidArgumentError } from '../errors/InvalidArgumentError';
import type { PaymentProductFieldType } from '../paymentProduct/productField/PaymentProductFieldType';
import { ValidationResult } from '../validation/ValidationResult';

export class PaymentRequestField {
    private value?: string;
    private readonly field: PaymentProductField;

    constructor(
        paymentProductField: PaymentProductField,
        private readonly readOnly: boolean,
    ) {
        this.field = paymentProductField;
    }

    setValue(newValue: string) {
        if (this.readOnly) {
            throw new InvalidArgumentError(`Cannot write "READ_ONLY" field: ${this.field.id}`);
        }

        this.value = newValue ? this.field.removeMask(newValue) : undefined;

        return this;
    }

    getValue(): string | undefined {
        return this.value;
    }

    getMaskedValue(): string | undefined {
        return this.field.applyMask(this.value);
    }

    getId(): string {
        return this.field.id;
    }

    getLabel(): string {
        return this.field.getLabel();
    }

    getPlaceholder(): string | undefined {
        return this.field.getPlaceholder();
    }

    isRequired(): boolean {
        return this.field.isRequired();
    }

    shouldObfuscate(): boolean {
        return this.field.shouldObfuscate();
    }

    getType(): PaymentProductFieldType {
        return this.field.type;
    }

    clearValue() {
        this.value = undefined;

        return this;
    }

    validate(): ValidationResult {
        const errors = this.field.validate(this.value);

        return new ValidationResult(errors.length === 0, errors);
    }
}
