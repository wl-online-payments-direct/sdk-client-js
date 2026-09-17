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

import { ConfigurationError } from '../../domain';

export function formatNetceteraTransactionAmount(amount: number, currencyCode: string): string {
    if (!Number.isInteger(amount) || amount < 0) {
        throw new ConfigurationError('Transaction amount must be a non-negative integer.');
    }

    let fractionDigits: number | undefined;

    try {
        fractionDigits = new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency: currencyCode,
        }).resolvedOptions().maximumFractionDigits;
    } catch {
        throw new ConfigurationError(`Malformed currency code: ${currencyCode}.`);
    }

    if (fractionDigits == null) {
        throw new ConfigurationError(`Unable to determine fraction digits for currency: ${currencyCode}.`);
    }

    const amountString = String(amount).padStart(fractionDigits + 1, '0');

    if (fractionDigits === 0) {
        return amountString;
    }

    const decimalPosition = amountString.length - fractionDigits;

    return `${amountString.slice(0, decimalPosition)}.${amountString.slice(decimalPosition)}`;
}
