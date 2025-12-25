export interface ValidationErrorMessage {
    errorMessage: string;
    paymentProductFieldId: string;
    type: string;
}

export const getRequiredFieldValidationMessage = (fieldId: string): ValidationErrorMessage => {
    return {
        errorMessage: 'Field required.',
        paymentProductFieldId: fieldId,
        type: 'RequiredField',
    };
};
