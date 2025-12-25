export type ValidatorJson =
    | EmptyValidatorJson
    | FixedListValidatorJson
    | LengthValidatorJson
    | RangeValidatorJson
    | RegularExpressionValidatorJson;

export interface ValidationRuleDefinition<T extends ValidatorJson> {
    readonly type: string;
    readonly attributes: T;
}

export interface BoletoBancarioRequirednessValidatorJson {
    fiscalNumberLength: number;
}

export type EmptyValidatorJson = object;

export interface FixedListValidatorJson {
    allowedValues: string[];
}

export interface LengthValidatorJson {
    minLength: number;
    maxLength: number;
}

export interface RangeValidatorJson {
    minValue: number;
    maxValue: number;
}

export interface RegularExpressionValidatorJson {
    regularExpression: string;
}

export interface RuleValidationResult {
    valid: boolean;
    message: string;
}
