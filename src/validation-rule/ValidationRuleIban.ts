import type { EmptyValidatorJSON, ValidatableRequest, ValidationRule, ValidationRuleDefinition } from '../types';

/**
 * Sanitize value by remove all unwanted chars of an Iban format
 */
function _sanitizeValue(value: string): string {
    return value.replace(/[^\d\w]+/g, '').toUpperCase();
}

/**
 * Get state if given value is a valid Iban format
 */
function _isValidFormat(value: unknown): boolean {
    return (
        typeof value === 'string' &&
        /^[A-Z]{2}[0-9]{2}[A-Z0-9]{4}[0-9]{7}([A-Z0-9]?){0,16}$/.test(_sanitizeValue(value))
    );
}

function toComputedString(value: string): string {
    return (
        _sanitizeValue(value)
            // place the first 4 chars to the end
            .replace(/(^.{4})(.*)/, '$2$1')

            // replace letters by corresponding numbers A=10 / Z=35
            .replace(/[A-Z]/g, (d) => {
                return (d.charCodeAt(0) - 55).toString();
            })
    );
}

export class ValidationRuleIban implements ValidationRule {
    readonly type: string;
    readonly errorMessageId: string;

    constructor(readonly json: ValidationRuleDefinition<EmptyValidatorJSON>) {
        this.type = json.type;
        this.errorMessageId = json.type;
    }

    /**
     * Validate Iban rule
     *
     * @see https://github.com/arhs/iban.js/blob/master/iban.js
     */
    validate(value: string): boolean {
        if (!_isValidFormat(value)) {
            return false;
        }

        // Check if reminder module 97 equals 1
        // only then it should pass the validation
        let remainder = toComputedString(value);

        while (remainder.length > 2) {
            const block = remainder.slice(0, 9);
            remainder = (parseInt(block, 10) % 97) + remainder.slice(block.length);
        }

        return parseInt(remainder, 10) % 97 === 1;
    }

    validateValue(request: ValidatableRequest, fieldId: string): boolean {
        const value = request.getUnmaskedValue(fieldId);
        return !!value && this.validate(value);
    }
}
