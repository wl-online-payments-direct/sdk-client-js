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

import type {
    ClickToPayCardScheme,
    ClickToPayCorrelationId,
    ClickToPayManualCardEntryOptions,
    ClickToPayComplianceResourceURLs,
    ClickToPaySdkPerformance,
    ClickToPayUiCustomizations,
    ClickToPayUserAction,
} from '../../domain';

export interface NetceteraConfig {
    mastercard?: {
        srcInitiatorId: string;
        srciDpaId: string;
        recognitionToken?: string;
        dpaData?: {
            dpaName: string;
            dpaPresentationName?: string;
            dpaUri?: string;
        };
        authenticationOptions?: {
            acquirerMerchantId: string;
            acquirerBIN: string;
            merchantCategoryCode: string;
            merchantCountryCode: string;
        };
        dpaTransactionOptions: {
            dpaLocale: string;
            transactionAmount?: {
                transactionAmount: number;
                transactionCurrencyCode: string;
            };
        };
    };
    visa?: {
        srcInitiatorId: string;
        srciDpaId: string;
        encryptionKey: string;
        nModulus: string;
        dpaData?: {
            srciDpaId?: string;
            dpaPresentationName?: string;
            dpaUri?: string;
        };
        authenticationOptions?: {
            payloadRequested: 'AUTHENTICATED' | 'NON_AUTHENTICATED';
            acquirerMerchantId: string;
            acquirerBIN: string;
            merchantName: string;
            challengeIndicator: '01' | '02' | '03' | '04' | '05' | '06' | '07' | '08' | '09';
        };
        dpaTransactionOptions: {
            dpaLocale?: string;
            transactionAmount?: {
                transactionAmount: string;
                transactionCurrencyCode: string;
            };
        };
    };
}

export interface NetceteraElement extends HTMLElement {
    config: NetceteraConfig;
    transactionamount?: { amount: string; currencyCode: string };
    buttonstyle?: string;
    uicustomizations?: ClickToPayUiCustomizations;
    triggerPayButton(): void;
    displayClickToPayExplanationModal(): void;
    checkout(params: NetceteraCheckoutParams): Promise<NetceteraCheckoutResult>;
    getComplianceResourceURLsForVisa(country: string): Promise<ClickToPayComplianceResourceURLs>;
    getComplianceResourceURLsForMastercard(): Promise<ClickToPayComplianceResourceURLs>;
}

export interface NetceteraManualCardDetails {
    primaryAccountNumber: string;
    panExpirationMonth: string;
    panExpirationYear: string;
    cardSecurityCode: string;
}

export interface NetceteraCheckoutParams extends ClickToPayManualCardEntryOptions {
    card: NetceteraManualCardDetails;
}

export interface NetceteraCustomerStatusEvent {
    isRecognized?: boolean;
    hasProfile?: boolean;
    hasCards?: boolean;
    hasProfileInSchemes?: ClickToPayCardScheme[];
    manualCardEntryMandatory?: boolean;
    maskedEmailAddress?: string;
    consumerIdentity?: { maskedEmailAddress?: string };
    validationChannel?: 'EMAIL_ADDRESS' | 'MOBILE_PHONE_NUMBER';
}

export interface NetceteraPerformance {
    correlationId: ClickToPayCorrelationId;
    referenceTimestamp?: Date;
    totalLoadingTime: number;
    consumerStatus?: NetceteraCustomerStatusEvent;
    sdkPerformance: ClickToPaySdkPerformance;
    userActions: ClickToPayUserAction[];
}

export interface NetceteraCheckoutResult {
    userAction: 'COMPLETE' | 'CANCEL' | 'ERROR';
    checkoutResponseSignature: string;
    creditCardBrand: ClickToPayCardScheme;
    performance?: NetceteraPerformance;
    recognitionToken?: string;
}

export interface NetceteraCardSelectionEvent {
    creditCardBrand: ClickToPayCardScheme;
    maskedCard: NetceteraMaskedCard;
}

export interface NetceteraMaskedCard {
    srcDigitalCardId: string;
    panBin: string;
    panLastFour: string | number;
    panExpirationMonth?: string | number;
    panExpirationYear?: string | number;
    tokenBinRange?: string;
    tokenLastFour?: string | number;
    tokenId?: string;
    paymentCardType?: string | string[];
    paymentCardDescriptor?: string;
    paymentAccountReference?: string;
    srcPaymentCardId?: string;
    serviceId?: string;
    countryCode?: string;
    dateOfCardCreated: string | number;
    dateOfCardLastUsed?: string | number;
    maskedBillingAddress?: NetceteraMaskedCardAddress;
    dcf?: NetceteraMaskedCardDcf;
    digitalCardData: NetceteraDigitalCardData;
}

export interface NetceteraMaskedCardAddress {
    addressId: string;
    name?: string;
    line1?: string;
    line2?: string;
    line3?: string;
    city?: string;
    state?: string;
    countryCode?: string;
    zip?: string;
    createTime?: string | number;
    lastUsedTime?: string | number;
}

export interface NetceteraMaskedCardDcf {
    uri?: string;
    logoUri?: string;
    name?: string;
}

export interface NetceteraDigitalCardData {
    status: string;
    descriptorName: string;
    presentationName?: string;
    artUri?: string;
    artHeight?: string | number;
    artWidth?: string | number;
    pendingEvents?: (string | number)[];
    authenticationMethods?: unknown[];
}

export interface NetceteraPaymentError {
    reason?: string;
    message?: string;
    creditCardBrand?: ClickToPayCardScheme;
}

export interface NetceteraCheckoutError {
    type?: string;
    reason?: string;
    message?: string;
}
