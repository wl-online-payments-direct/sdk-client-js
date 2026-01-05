/*
 * Do not remove or alter the notices in this preamble.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

export enum ValidationRuleType {
    EXPIRATION_DATE = 'expirationDate',
    EMAIL_ADDRESS = 'emailAddress',
    FIXED_LIST = 'fixedList',
    IBAN = 'iban',
    LENGTH = 'length',
    LUHN = 'luhn',
    RANGE = 'range',
    REGULAR_EXPRESSION = 'regularExpression',
    TERMS_AND_CONDITIONS = 'termsAndConditions',
    REQUIRED_FIELD = 'requiredField',
}
