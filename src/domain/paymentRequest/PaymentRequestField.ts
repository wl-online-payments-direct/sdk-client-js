import { PaymentProductField } from '../paymentProduct/PaymentProductField';
import { InvalidArgumentError, ValidationResult } from '../../dataModel';
import type { PaymentProductFieldType } from '../../types';

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
