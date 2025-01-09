import { createValidationRuleTest } from '../helper';
import { ValidationRuleExpirationDate } from '../../../validation-rule';

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

const rule = new ValidationRuleExpirationDate({
    type: 'expirationDate',
    attributes: {},
});

createValidationRuleTest(rule, [
    {
        msg: 'should fail validation when no value is set',
        validateValue: false,
    },
    {
        msg: 'should pass validation with an expire date of 4 digits (MMYY) for current date',
        validateValue: true,
        validate: true,
        value: validExpireDate4Digits,
    },
    {
        msg: 'should pass validation with an expire date of 6 digits (MMYYYY) for current date',
        validateValue: true,
        validate: true,
        value: validExpireDate6Digits,
    },
    {
        msg: 'should fail validation with an expire date set in the past',
        validateValue: false,
        validate: false,
        value: '0122',
    },
    {
        msg: 'should fail validation with an invalid date format',
        validateValue: false,
        validate: false,
        value: '12345',
    },
]);
