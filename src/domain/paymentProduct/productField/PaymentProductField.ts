/*
 * Do not remove or alter the notices in this preamble.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import { Formatter } from '../../../infrastructure/utils/Formatter';
import { DataRestrictions } from './DataRestrictions';
import type { ProductFieldDisplayHints } from './ProductFieldDisplayHints';
import type { PaymentProductFieldType } from './PaymentProductFieldType';
import {
    getRequiredFieldValidationMessage,
    type ValidationErrorMessage,
} from '../../validation/ValidationErrorMessage';

export class PaymentProductField {
    constructor(
        readonly id: string,
        readonly type: PaymentProductFieldType,
        readonly dataRestrictions: DataRestrictions,
        readonly displayHints?: ProductFieldDisplayHints,
    ) {}

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
