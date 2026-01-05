/*
 * Do not remove or alter the notices in this preamble.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import { ValidationRuleEmailAddress } from '../../../../src/domain/validation/rules/ValidationRuleEmailAddress';
import { createValidationRuleTest } from './helpers/create-validation-rule-test';

const rule = new ValidationRuleEmailAddress();

createValidationRuleTest(rule, [
    {
        msg: 'should validate correct email addresses',
        value: 'test@example.com',
        isValid: true,
    },
    {
        msg: 'should validate correct email address with dot in name',
        value: 'user.name@example.com',
        isValid: true,
    },
    {
        msg: 'should validate correct email address with plus in name',
        value: 'user+name@example.com',
        isValid: true,
    },
    {
        msg: 'should reject invalid email address',
        value: 'user',
        isValid: false,
    },
    {
        msg: 'should reject invalid email address',
        value: '@example.com',
        isValid: false,
    },
    {
        msg: 'should reject invalid email address',
        value: 'user@',
        isValid: false,
    },
    {
        msg: 'should reject invalid email address',
        value: 'user@.com',
        isValid: false,
    },
]);
