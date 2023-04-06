import { createValidationRuleTest } from '../helper';
import { ValidationRuleEmailAddress } from '../../../validation-rule';

const rule = new ValidationRuleEmailAddress({ type: 'email', attributes: {} });

createValidationRuleTest(rule, [
  {
    msg: 'should return fail validation when no value is provided',
    validateValue: false,
  },
  {
    msg: 'should fail validation when value is "" (= empty string)',
    validateValue: false,
    validate: false,
    value: '',
  },
  {
    msg: 'should pass validation when value is "aa@bb.com"',
    validateValue: true,
    validate: true,
    value: 'aa@bb.com',
  },
  {
    msg: 'should fail validation when value is "aa2bb.com"',
    validateValue: false,
    validate: false,
    value: 'aa2bb.com',
  },
]);
