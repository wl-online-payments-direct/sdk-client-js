import { createValidationRuleTest } from '../helper';
import { ValidationRuleLuhn } from '../../../validation-rule';

const rule = new ValidationRuleLuhn({ type: 'luhn', attributes: {} });

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
        msg: 'should pass validation when value is a valid Luhn number',
        validateValue: true,
        validate: true,
        value: '79927398713',
    },
    {
        msg: 'should fail validation when value is not a valid Luhn number',
        validateValue: false,
        validate: false,
        value: '79927398712',
    },
]);
