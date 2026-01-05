/*
 * Do not remove or alter the notices in this preamble.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import { ValidationRuleLuhn } from '../../../../src/domain/validation/rules/ValidationRuleLuhn';
import { createValidationRuleTest } from './helpers/create-validation-rule-test';

const rule = new ValidationRuleLuhn();

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
        msg: 'should pass validation when value is a valid Luhn number',
        isValid: true,
        value: '79927398713',
    },
    {
        msg: 'should fail validation when value is not a valid Luhn number',
        isValid: false,
        value: '79927398712',
    },
]);
