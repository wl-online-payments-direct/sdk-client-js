import type { PaymentRequest } from 'onlinepayments-sdk-client-js';

// [START set-field-value]
// Call on every input event. Returns the formatted value to show in the input.
export function onFieldInput(paymentRequest: PaymentRequest, fieldId: string, input: string): string {
    const field = paymentRequest.getField(fieldId);

    // setValue removes the mask before it stores the value, so "4111 1111" is stored as "41111111".
    // It throws an InvalidArgumentError for a READ_ONLY field of the selected account on file:
    // render those fields as read-only and never call setValue for them.
    field.setValue(input);

    return field.getMaskedValue() ?? '';
}
// [END set-field-value]

// [START validate-field]
// Call when a field loses focus. Returns the messages to show under the field.
export function fieldErrors(paymentRequest: PaymentRequest, fieldId: string): string[] {
    return paymentRequest
        .getField(fieldId)
        .validate()
        .errors.map((error) => error.errorMessage);
}
// [END validate-field]

// [START validate-payment-request]
// Call before encrypting. Returns the error messages per field id; empty when the request is valid.
export function validatePaymentRequest(paymentRequest: PaymentRequest): Record<string, string[]> {
    const result = paymentRequest.validate();
    const errorsByField: Record<string, string[]> = {};

    for (const error of result.errors) {
        (errorsByField[error.paymentProductFieldId] ??= []).push(error.errorMessage);
    }

    return errorsByField;
}
// [END validate-payment-request]
