/*
 * Do not remove or alter the notices in this preamble.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import { ValidationRuleExpirationDate } from '../../../../src/domain/validation/rules/ValidationRuleExpirationDate';
import { createValidationRuleTest } from './helpers/create-validation-rule-test';

function getFormattedDate(date: Date, opts: Intl.DateTimeFormatOptions) {
    return new Intl.DateTimeFormat('en-US', opts).format(date).replace('/', '');
}

const validExpireDate4Digits = getFormattedDate(new Date(), {
    month: '2-digit',
    year: '2-digit',
});

const validExpireDate6Digits = getFormattedDate(new Date(), {
    month: '2-digit',
    year: 'numeric',
});

const rule = new ValidationRuleExpirationDate();

createValidationRuleTest(rule, [
    {
        msg: 'should fail validation when no value is set',
        isValid: false,
    },
    {
        msg: 'should pass validation with an expire date of 4 digits (MMYY) for current date',
        isValid: true,
        value: validExpireDate4Digits,
    },
    {
        msg: 'should pass validation with an expire date of 6 digits (MMYYYY) for current date',
        isValid: true,
        value: validExpireDate6Digits,
    },
    {
        msg: 'should fail validation with an expire date set in the past',
        isValid: false,
        value: '0122',
    },
    {
        msg: 'should fail validation with an invalid date format',
        isValid: false,
        value: '12345',
    },
]);
