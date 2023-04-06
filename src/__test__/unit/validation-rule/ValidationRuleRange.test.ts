import { createValidationRuleTest } from '../helper';
import { ValidationRuleRange } from '../../../validation-rule';

const rule = new ValidationRuleRange({
  type: 'length',
  attributes: {
    minValue: 2,
    maxValue: 5,
  },
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
    msg: 'should pass validation when value is at minValue',
    validateValue: true,
    validate: true,
    value: '2',
  },
  {
    msg: 'should pass validation when value is at maxValue',
    validateValue: true,
    validate: true,
    value: '5',
  },
  {
    msg: 'should fail validation when value is below minValue',
    validateValue: false,
    validate: false,
    value: '1',
  },
  {
    msg: 'should fail validation when value is above maxValue',
    validateValue: false,
    validate: false,
    value: '6',
  },
]);
