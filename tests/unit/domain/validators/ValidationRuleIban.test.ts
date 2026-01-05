/*
 * Do not remove or alter the notices in this preamble.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import { ValidationRuleIban } from '../../../../src/domain/validation/rules/ValidationRuleIban';
import { createValidationRuleTest } from './helpers/create-validation-rule-test';

const rule = new ValidationRuleIban();

createValidationRuleTest(rule, [
    ...['DE89370400440532013000', 'GB82WEST12345698765432', 'NL91ABNA0417164300', 'FR1420041010050500013M02606'].map(
        (value) => ({
            msg: 'should validate correct IBAN numbers',
            value,
            isValid: true,
        }),
    ),
    ...['DE89 3704 0044 0532 0130 00', 'GB82 WEST 1234 5698 7654 32'].map((value) => ({
        msg: 'should validate IBAN numbers with spaces',
        value,
        isValid: true,
    })),
    ...['DE89370400440532013001', 'DE8937040044', 'XX89370400440532013000'].map((value) => ({
        msg: 'should reject invalid IBAN numbers',
        value,
        isValid: false,
    })),
    ...['not-an-iban', '1234567890', ''].map((value) => ({
        msg: 'should reject non-IBAN values',
        value,
        isValid: false,
    })),
]);
