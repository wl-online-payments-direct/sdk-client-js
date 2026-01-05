/*
 * Do not remove or alter the notices in this preamble.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import { ValidationRuleLength } from '../../../../src/domain/validation/rules/ValidationRuleLength';
import { createValidationRuleTest } from './helpers/create-validation-rule-test';

const rule = new ValidationRuleLength(2, 5);

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
        msg: 'should pass validation when value is at minLength',
        isValid: true,
        value: '12',
    },
    {
        msg: 'should pass validation when value is at maxLength',
        isValid: true,
        value: '12345',
    },
    {
        msg: 'should fail validation when value is below minLength',
        isValid: false,
        value: '1',
    },
    {
        msg: 'should fail validation when value is above maxLength',
        isValid: false,
        value: '123456',
    },
]);
