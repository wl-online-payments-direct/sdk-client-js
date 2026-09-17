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

import {
    type ClickToPayConfig,
    CLICK_TO_PAY_LOCALES,
    ConfigurationError,
    type PaymentContextWithAmount,
    type PaymentProduct5002SpecificData,
} from '../../domain';
import type { NetceteraConfig } from './NetceteraTypes';
import { formatNetceteraTransactionAmount } from './NetceteraAmountFormatter';

export function buildNetceteraConfig(
    specificData: PaymentProduct5002SpecificData,
    context: PaymentContextWithAmount,
    config: ClickToPayConfig,
): NetceteraConfig {
    const netceteraConfig: NetceteraConfig = {};
    const { mastercard, visa } = specificData.apiParameters ?? {};
    const availableSchemes = Object.entries({ mastercard, visa })
        .filter(([, credentials]) => credentials)
        .map(([scheme]) => scheme);
    const { amount, currencyCode } = context.amountOfMoney;
    const transactionAmount = formatNetceteraTransactionAmount(amount, currencyCode);

    if (config.locale && !(CLICK_TO_PAY_LOCALES as readonly string[]).includes(config.locale)) {
        throw new ConfigurationError(`Unsupported Click to Pay locale "${config.locale}".`);
    }

    if (mastercard && config.mastercard && config.locale) {
        netceteraConfig.mastercard = {
            srcInitiatorId: mastercard.srcInitiatorId,
            srciDpaId: mastercard.srciDpaId,
            ...(config.mastercard.recognitionToken ? { recognitionToken: config.mastercard.recognitionToken } : {}),
            ...(config.mastercard.dpaData ? { dpaData: config.mastercard.dpaData } : {}),
            dpaTransactionOptions: {
                dpaLocale: config.locale,
                transactionAmount: {
                    transactionAmount: Number(transactionAmount),
                    transactionCurrencyCode: currencyCode,
                },
            },
        };

        if (mastercard.authenticationOptions) {
            netceteraConfig.mastercard.authenticationOptions = {
                acquirerMerchantId: mastercard.authenticationOptions.acquirerMerchantId,
                acquirerBIN: mastercard.authenticationOptions.acquirerBIN,
                merchantCategoryCode: mastercard.authenticationOptions.merchantCategoryCode,
                merchantCountryCode: mastercard.authenticationOptions.merchantCountryCode,
            };
        }
    }

    if (visa && config.visa) {
        netceteraConfig.visa = {
            srcInitiatorId: visa.srcInitiatorId,
            srciDpaId: visa.srciDpaId,
            encryptionKey: visa.encryptionKey,
            nModulus: visa.nModulus,
            ...(config.visa.dpaData ? { dpaData: config.visa.dpaData } : {}),
            dpaTransactionOptions: {
                ...(config.locale ? { dpaLocale: config.locale } : {}),
                transactionAmount: {
                    transactionAmount,
                    transactionCurrencyCode: currencyCode,
                },
            },
        };

        if (visa.authenticationOptions && config.visa.authenticationOptions) {
            netceteraConfig.visa.authenticationOptions = {
                payloadRequested: config.visa.authenticationOptions.payloadRequested,
                acquirerMerchantId: visa.authenticationOptions.acquirerMerchantId,
                acquirerBIN: visa.authenticationOptions.acquirerBIN,
                merchantName: visa.authenticationOptions.merchantName,
                challengeIndicator: config.visa.authenticationOptions.challengeIndicator,
            };
        }
    }

    if (availableSchemes.length > 0 && Object.keys(netceteraConfig).length === 0) {
        throw new ConfigurationError(
            `No Click to Pay scheme is configured. Schemes available for this session: ${availableSchemes.join(', ')}. Provide the configuration required by at least one of them.`,
        );
    }

    return netceteraConfig;
}
