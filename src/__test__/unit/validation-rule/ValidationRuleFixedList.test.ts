import { createValidationRuleTest } from '../helper';
import { ValidationRuleFixedList } from '../../../validation-rule';

const rule = new ValidationRuleFixedList({
    type: 'fixedList',
    attributes: { allowedValues: ['a', 'b', 'c'] },
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
        msg: 'should pass validation when value is in allowed values',
        validateValue: true,
        validate: true,
        value: 'a',
    },
    {
        msg: 'should fail validation when value is not in allowed values',
        validateValue: false,
        validate: false,
        value: 'd',
    },
]);
