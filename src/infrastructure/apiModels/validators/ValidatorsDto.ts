/*
 * Do not remove or alter the notices in this preamble.
 *
 * This software is owned by Worldline and may not be be altered, copied, reproduced, republished, uploaded, posted, transmitted or distributed in any way, without the prior written consent of Worldline.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import type { EmailAddressDto } from './ruleDefinitions/EmailAddressDto';
import type { ExpirationDateDto } from './ruleDefinitions/ExpirationDateDto';
import type { FixedListDto } from './ruleDefinitions/FixedListDto';
import type { IBANDto } from './ruleDefinitions/IBANDto';
import type { LengthDto } from './ruleDefinitions/LengthDto';
import type { LuhnDto } from './ruleDefinitions/LuhnDto';
import type { RangeDto } from './ruleDefinitions/RangeDto';
import type { RegularExpressionDto } from './ruleDefinitions/RegularExpressionDto';
import type { TermsAndConditionsDto } from './ruleDefinitions/TermsAndConditionsDto';

export interface ValidatorsDto {
    emailAddress?: EmailAddressDto;
    expirationDate?: ExpirationDateDto;
    fixedList?: FixedListDto;
    iban?: IBANDto;
    length?: LengthDto;
    luhn?: LuhnDto;
    range?: RangeDto;
    regularExpression?: RegularExpressionDto;
    termsAndConditions?: TermsAndConditionsDto;
}
