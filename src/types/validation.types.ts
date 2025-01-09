import type { ValidatorJSON } from './payment-product.types';

export interface ValidatableRequest {
    getValue(paymentProductFieldId: string): string | undefined;

    getMaskedValue(paymentProductFieldId: string): string | undefined;

    getUnmaskedValue(paymentProductFieldId: string): string | undefined;
}

export interface ValidationRule<T extends ValidatorJSON = ValidatorJSON> {
    readonly json: ValidationRuleDefinition<T>;
    readonly type: string;
    readonly errorMessageId: string;

    validate(value: string): boolean;

    validateValue(request: ValidatableRequest, fieldId: string): boolean;
}

export interface ValidationRuleDefinition<T extends ValidatorJSON> {
    readonly type: string;
    readonly attributes: T;
}
