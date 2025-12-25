import {
    getRequiredFieldValidationMessage,
    PaymentProductFieldDisplayHints,
    type ValidationErrorMessage,
} from '../../dataModel';
import { Formatter } from '../../infrastructure/utils/Formatter';
import { DataRestrictions } from './DataRestrictions';
import type { PaymentProductFieldJson, PaymentProductFieldType } from '../../types';

export class PaymentProductField {
    readonly id: string;
    readonly type: PaymentProductFieldType;
    readonly displayHints?: PaymentProductFieldDisplayHints;
    readonly dataRestrictions: DataRestrictions;

    constructor(json: PaymentProductFieldJson) {
        this.id = json.id;
        this.type = json.type;
        this.displayHints = json.displayHints ? new PaymentProductFieldDisplayHints(json.displayHints) : undefined;
        this.dataRestrictions = new DataRestrictions(json.dataRestrictions);
    }

    getLabel(): string {
        return this.displayHints?.label ?? this.id;
    }

    getPlaceholder(): string | undefined {
        return this.displayHints?.placeholderLabel;
    }

    isRequired(): boolean {
        return this.dataRestrictions.isRequired;
    }

    getDisplayOrder(): number {
        return this.displayHints?.displayOrder ?? 0;
    }

    shouldObfuscate(): boolean {
        return this.displayHints?.obfuscate ?? false;
    }

    applyMask(value?: string): string | undefined {
        const mask = this.displayHints?.mask;

        return mask ? Formatter.applyMask(mask, value) : value;
    }

    removeMask(value: string): string {
        return Formatter.removeMask(this.displayHints?.mask, this.applyMask(value));
    }

    validate(value?: string): ValidationErrorMessage[] {
        const validators = this.dataRestrictions.getValidationRules();
        const errorMessages: ValidationErrorMessage[] = [];

        if (value) {
            validators.forEach((validator) => {
                const result = validator.validate(value);
                if (!result.valid) {
                    errorMessages.push({
                        errorMessage: result.message,
                        paymentProductFieldId: this.id,
                        type: validator.type,
                    });
                }
            });
        } else if (this.dataRestrictions.isRequired) {
            errorMessages.push(getRequiredFieldValidationMessage(this.id));
        }

        return errorMessages;
    }
}
