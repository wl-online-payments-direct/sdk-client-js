import { createValidationRuleTest } from '../helper';
import { ValidationRuleIban } from '../../../validation-rule';

const rule = new ValidationRuleIban({ type: 'iban', attributes: {} });

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
        msg: 'should pass validation when value is a valid IBAN',
        validateValue: true,
        validate: true,
        value: 'DE89370400440532013000',
    },
    {
        msg: 'should fail validation when value is not a valid IBAN',
        validateValue: false,
        validate: false,
        value: 'DE89370400440532013001',
    },
]);
