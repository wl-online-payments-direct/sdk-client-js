define("onlinepaymentssdk.ValidationRuleFactory", ["onlinepaymentssdk.core", "onlinepaymentssdk.ValidationRuleEmailAddress", "onlinepaymentssdk.ValidationRuleTermsAndConditions", "onlinepaymentssdk.ValidationRuleExpirationDate", "onlinepaymentssdk.ValidationRuleFixedList", "onlinepaymentssdk.ValidationRuleLength", "onlinepaymentssdk.ValidationRuleLuhn", "onlinepaymentssdk.ValidationRuleRange", "onlinepaymentssdk.ValidationRuleRegularExpression", "onlinepaymentssdk.ValidationRuleIban"], function (onlinepaymentssdk, ValidationRuleEmailAddress, ValidationRuleTermsAndConditions, ValidationRuleExpirationDate, ValidationRuleFixedList, ValidationRuleLength, ValidationRuleLuhn, ValidationRuleRange, ValidationRuleRegularExpression, ValidationRuleIban) {

    var validationRules = {
        EmailAddress : ValidationRuleEmailAddress,
        TermsAndConditions: ValidationRuleTermsAndConditions,
        ExpirationDate : ValidationRuleExpirationDate,
        FixedList : ValidationRuleFixedList,
        Length : ValidationRuleLength,
        Luhn: ValidationRuleLuhn,
        Range: ValidationRuleRange,
        RegularExpression: ValidationRuleRegularExpression,
        Iban: ValidationRuleIban
    }

    var ValidationRuleFactory = function () {
        this.makeValidator = function (json) {
            try {
                var rule = json.type.charAt(0).toUpperCase() + json.type.slice(1);
                return new validationRules[rule](json);
            } catch (e) {
                console.warn('no validator for ', rule);
            }
            return null;
        };
    };

    onlinepaymentssdk.ValidationRuleFactory = ValidationRuleFactory;
    return ValidationRuleFactory;
});
