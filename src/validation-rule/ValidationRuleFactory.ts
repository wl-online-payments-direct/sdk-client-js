import type {
  ValidationRule,
  ValidationRuleDefinition,
  ValidatorJSON,
} from '../types';

import { ValidationRuleEmailAddress } from './ValidationRuleEmailAddress';
import { ValidationRuleExpirationDate } from './ValidationRuleExpirationDate';
import { ValidationRuleTermsAndConditions } from './ValidationRuleTermsAndConditions';
import { ValidationRuleFixedList } from './ValidationRuleFixedList';
import { ValidationRuleLength } from './ValidationRuleLength';
import { ValidationRuleRange } from './ValidationRuleRange';
import { ValidationRuleRegularExpression } from './ValidationRuleRegularExpression';
import { ValidationRuleLuhn } from './ValidationRuleLuhn';
import { ValidationRuleIban } from './ValidationRuleIban';

const validationRules = {
  EmailAddress: ValidationRuleEmailAddress,
  TermsAndConditions: ValidationRuleTermsAndConditions,
  ExpirationDate: ValidationRuleExpirationDate,
  FixedList: ValidationRuleFixedList,
  Length: ValidationRuleLength,
  Luhn: ValidationRuleLuhn,
  Range: ValidationRuleRange,
  RegularExpression: ValidationRuleRegularExpression,
  Iban: ValidationRuleIban,
};

type ValidationRuleKey = keyof typeof validationRules;
type ValidationRuleValue = typeof validationRules[ValidationRuleKey];

function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export class ValidationRuleFactory {
  makeValidator(
    json: ValidationRuleDefinition<ValidatorJSON>,
  ): ValidationRule | null {
    const ruleKey = capitalizeFirstLetter(json.type) as ValidationRuleKey;
    const Rule = validationRules[ruleKey] as ValidationRuleValue | undefined;

    if (!Rule) {
      console.warn('no validator for ', Rule);
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new Rule(json as any);
  }
}
