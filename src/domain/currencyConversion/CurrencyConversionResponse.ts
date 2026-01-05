/*
 * Do not remove or alter the notices in this preamble.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import type { CurrencyConversionResult } from './CurrencyConversionResult';
import type { DccProposal } from './DccProposal';

export interface CurrencyConversionResponse {
    docSessionId: string;
    result: CurrencyConversionResult;
    proposal: DccProposal;
}
