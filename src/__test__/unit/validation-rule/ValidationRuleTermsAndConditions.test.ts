import { createValidationRuleTest } from '../helper';
import { ValidationRuleTermsAndConditions } from '../../../validation-rule';

const rule = new ValidationRuleTermsAndConditions({
    type: 'termsAndConditions',
    attributes: {},
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
        msg: 'should pass validation when value is "true"',
        validateValue: true,
        validate: true,
        value: 'true',
    },
    {
        msg: 'should fail validation when value is "false"',
        validateValue: false,
        validate: false,
        value: 'false',
    },
]);
