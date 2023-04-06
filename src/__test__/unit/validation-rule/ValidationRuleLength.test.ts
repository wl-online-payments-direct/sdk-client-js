import { createValidationRuleTest } from '../helper';
import { ValidationRuleLength } from '../../../validation-rule';

const rule = new ValidationRuleLength({
  type: 'length',
  attributes: { minLength: 2, maxLength: 5 },
});

createValidationRuleTest(rule, [
  {
    msg: 'should fail validation when no value is set',
    validateValue: false,
  },
  {
    msg: 'should fail validation when value is empty',
    validateValue: false,
    validate: false,
    value: '',
  },
  {
    msg: 'should pass validation when value is at minLength',
    validateValue: true,
    validate: true,
    value: '12',
  },
  {
    msg: 'should pass validation when value is at maxLength',
    validateValue: true,
    validate: true,
    value: '12345',
  },
  {
    msg: 'should fail validation when value is below minLength',
    validateValue: false,
    validate: false,
    value: '1',
  },
  {
    msg: 'should fail validation when value is above maxLength',
    validateValue: false,
    validate: false,
    value: '123456',
  },
]);
