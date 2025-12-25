import type { ValidationErrorMessage } from './ValidationErrorMessage';

export class ValidationResult {
    readonly isValid: boolean;
    readonly errors: ValidationErrorMessage[];

    constructor(isValid: boolean, errors?: ValidationErrorMessage[]) {
        this.isValid = isValid;
        this.errors = errors ?? [];
    }
}
