/*
 * Do not remove or alter the notices in this preamble.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import type { ValidationErrorMessage } from './ValidationErrorMessage';

export class ValidationResult {
    readonly isValid: boolean;
    readonly errors: ValidationErrorMessage[];

    constructor(isValid: boolean, errors?: ValidationErrorMessage[]) {
        this.isValid = isValid;
        this.errors = errors ?? [];
    }
}
