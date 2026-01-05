/*
 * Do not remove or alter the notices in this preamble.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import { ValidationRuleRegularExpression } from '../../../../src/domain/validation/rules/ValidationRuleRegularExpression';
import { createValidationRuleTest } from './helpers/create-validation-rule-test';

const rule = new ValidationRuleRegularExpression('\\d{2}[a-z]{2}[A-Z]{3}');

createValidationRuleTest(rule, [
    {
        msg: 'should fail validation when no value is set',
        isValid: false,
    },
    {
        msg: 'should fail validation when value is empty',
        isValid: false,
        value: '',
    },
    {
        msg: 'should pass validation when value matches regular expression',
        isValid: true,
        value: '12abABC',
    },
    {
        msg: 'should fail validation when value does not match regular expression',
        isValid: false,
        value: '12abAB',
    },
]);
