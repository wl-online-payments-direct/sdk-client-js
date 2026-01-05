/*
 * Do not remove or alter the notices in this preamble.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import { ValidationRuleType } from './rules/ValidationRuleType';

export interface ValidationErrorMessage {
    errorMessage: string;
    paymentProductFieldId: string;
    type: ValidationRuleType;
}

export const getRequiredFieldValidationMessage = (fieldId: string): ValidationErrorMessage => {
    return {
        errorMessage: 'Field is required.',
        paymentProductFieldId: fieldId,
        type: ValidationRuleType.REQUIRED_FIELD,
    };
};
