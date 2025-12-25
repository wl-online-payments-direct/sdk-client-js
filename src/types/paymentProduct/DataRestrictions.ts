import type {
    BoletoBancarioRequirednessValidatorJson,
    EmptyValidatorJson,
    FixedListValidatorJson,
    LengthValidatorJson,
    RangeValidatorJson,
    RegularExpressionValidatorJson,
} from '../ValidationRules';

export interface PaymentProductFieldDataRestrictionsJson {
    isRequired: boolean;
    validators: PaymentProductFieldValidatorsJson;
}

export interface PaymentProductFieldValidatorsJson {
    boletoBancarioRequiredness?: BoletoBancarioRequirednessValidatorJson;
    emailAddress?: EmptyValidatorJson;
    expirationDate?: EmptyValidatorJson;
    fixedList?: FixedListValidatorJson;
    iban?: EmptyValidatorJson;
    length?: LengthValidatorJson;
    luhn?: EmptyValidatorJson;
    range?: RangeValidatorJson;
    regularExpression?: RegularExpressionValidatorJson;
    residentIdNumber?: EmptyValidatorJson;
    termsAndConditions?: EmptyValidatorJson;
}
