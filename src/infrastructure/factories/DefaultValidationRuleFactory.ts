import { ValidationRuleEmailAddress } from '../../domain/validators/ValidationRuleEmailAddress';
import { ValidationRuleTermsAndConditions } from '../../domain/validators/ValidationRuleTermsAndConditions';
import { ValidationRuleExpirationDate } from '../../domain/validators/ValidationRuleExpirationDate';
import { ValidationRuleFixedList } from '../../domain/validators/ValidationRuleFixedList';
import { ValidationRuleLength } from '../../domain/validators/ValidationRuleLength';
import { ValidationRuleLuhn } from '../../domain/validators/ValidationRuleLuhn';
import { ValidationRuleRange } from '../../domain/validators/ValidationRuleRange';
import { ValidationRuleRegularExpression } from '../../domain/validators/ValidationRuleRegularExpression';
import { ValidationRuleIban } from '../../domain/validators/ValidationRuleIban';
import type { ValidationRuleFactory } from '../interfaces/ValidationRuleFactory';
import type { ValidationRuleDefinition, ValidatorJson } from '../../types';
import type { ValidationRule } from '../../domain/validators/ValidationRule';

const validationRules = {
    emailAddress: ValidationRuleEmailAddress,
    termsAndConditions: ValidationRuleTermsAndConditions,
    expirationDate: ValidationRuleExpirationDate,
    fixedList: ValidationRuleFixedList,
    length: ValidationRuleLength,
    luhn: ValidationRuleLuhn,
    range: ValidationRuleRange,
    regularExpression: ValidationRuleRegularExpression,
    iban: ValidationRuleIban,
};

type ValidationRuleKey = keyof typeof validationRules;
type ValidationRuleValue = (typeof validationRules)[ValidationRuleKey];

export class DefaultValidationRuleFactory implements ValidationRuleFactory {
    makeValidator(json: ValidationRuleDefinition<ValidatorJson>): ValidationRule | null {
        const Rule = validationRules[json.type as ValidationRuleKey] as ValidationRuleValue | undefined;

        if (!Rule) {
            return null;
        }

        // @ts-expect-error JSON must be in the expected format or an error should be thrown
        return new Rule(json);
    }
}
