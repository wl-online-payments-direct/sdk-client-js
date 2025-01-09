import { createValidationRuleTest } from '../helper';
import { ValidationRuleRegularExpression } from '../../../validation-rule';

const rule = new ValidationRuleRegularExpression({
    type: 'regularExpression',
    attributes: { regularExpression: '\\d{2}[a-z]{2}[A-Z]{3}' },
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
        msg: 'should pass validation when value matches regular expression',
        validateValue: true,
        validate: true,
        value: '12abABC',
    },
    {
        msg: 'should fail validation when value does not match regular expression',
        validateValue: false,
        validate: false,
        value: '12abAB',
    },
]);
