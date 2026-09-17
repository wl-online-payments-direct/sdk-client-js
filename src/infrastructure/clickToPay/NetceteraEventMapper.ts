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
    type ClickToPayCardSelection,
    type ClickToPayCustomerStatus,
    type ClickToPayManualCardDetails,
    type ClickToPayMaskedCard,
    type ClickToPayMaskedCardAddress,
    type ClickToPayMaskedCardDcf,
    type ClickToPayDigitalCardData,
    type ClickToPayPaymentResult,
    type ClickToPayPerformance,
    ClickToPayError,
    InvalidArgumentError,
} from '../../domain';
import type {
    NetceteraCardSelectionEvent,
    NetceteraCheckoutError,
    NetceteraCheckoutResult,
    NetceteraCustomerStatusEvent,
    NetceteraDigitalCardData,
    NetceteraManualCardDetails,
    NetceteraMaskedCard,
    NetceteraMaskedCardAddress,
    NetceteraMaskedCardDcf,
    NetceteraPaymentError,
    NetceteraPerformance,
} from './NetceteraTypes';

const EXPIRY_DATE_PATTERN = /^(0[1-9]|1[0-2])(\d{2}|\d{4})$/;

const INVALID_ARGUMENT_ERROR_TYPES = new Set([
    'CREDIT_CARD_NUMBER_REQUIRED',
    'CREDIT_CARD_CVV_REQUIRED',
    'CREDIT_CARD_EXPIRATION_YEAR_REQUIRED',
    'CREDIT_CARD_EXPIRATION_MONTH_REQUIRED',
    'CREDIT_CARD_NUMBER_INVALID',
    'CREDIT_CARD_NUMBER_UNSUPPORTED',
    'CREDIT_CARD_CVV_INVALID',
    'CREDIT_CARD_EXPIRED',
    'TERMS_AND_CONDITIONS_URL_REQUIRED',
    'PRIVACY_POLICY_URL_REQUIRED',
]);

const INVALID_CARD_ERROR_REASONS = new Set([
    'CARD_ADD_FAILED',
    'CARD_SECURITY_CODE_MISSING',
    'CARD_INVALID',
    'CARD_EXP_INVALID',
    'CARD_NOT_RECOGNIZED',
]);

export function mapCustomerStatus(detail: NetceteraCustomerStatusEvent): ClickToPayCustomerStatus {
    return {
        isRecognized: detail.isRecognized ?? false,
        hasProfile: detail.hasProfile ?? false,
        hasCards: detail.hasCards ?? false,
        hasProfileInSchemes: detail.hasProfileInSchemes ?? [],
        manualCardEntryMandatory: detail.manualCardEntryMandatory,
        maskedEmailAddress: detail.maskedEmailAddress ?? detail.consumerIdentity?.maskedEmailAddress,
        validationChannel: detail.validationChannel,
    };
}

export function mapPaymentResult(detail: NetceteraCheckoutResult): ClickToPayPaymentResult {
    return {
        userAction: detail.userAction,
        checkoutResponseSignature: detail.checkoutResponseSignature,
        cardScheme: detail.creditCardBrand,
        performance: detail.performance ? mapPerformance(detail.performance) : undefined,
        recognitionToken: detail.recognitionToken,
    };
}

export function mapManualCardDetails(card: ClickToPayManualCardDetails): NetceteraManualCardDetails {
    const expiryDate = card.expiryDate.replace(/\D/g, '');

    if (!EXPIRY_DATE_PATTERN.test(expiryDate)) {
        throw new InvalidArgumentError(
            `Invalid Click to Pay expiry date format: "${card.expiryDate}". Expected MMYY or MMYYYY.`,
        );
    }

    return {
        primaryAccountNumber: card.cardNumber,
        panExpirationMonth: expiryDate.substring(0, 2),
        panExpirationYear: expiryDate.slice(-2),
        cardSecurityCode: card.securityCode,
    };
}

export function mapCardSelection(detail: NetceteraCardSelectionEvent): ClickToPayCardSelection {
    return {
        cardScheme: detail.creditCardBrand,
        maskedCard: mapMaskedCard(detail.maskedCard),
    };
}

export function mapNetceteraError(detail: NetceteraPaymentError): ClickToPayError {
    return new ClickToPayError(resolveErrorMessage(detail), {
        reason: detail?.reason ?? '',
        cardScheme: detail?.creditCardBrand,
    });
}

export function mapNetceteraCallError(error: NetceteraCheckoutError): InvalidArgumentError | ClickToPayError {
    const type = error?.type ?? '';
    const reason = error?.reason ?? '';
    const message = error?.message ?? 'Click to Pay error';

    if (INVALID_ARGUMENT_ERROR_TYPES.has(type)) {
        return new InvalidArgumentError(message, { reason: type });
    }

    if (INVALID_CARD_ERROR_REASONS.has(reason)) {
        return new InvalidArgumentError(message, { reason });
    }

    return new ClickToPayError(message, { reason: type || reason });
}

function resolveErrorMessage(detail: NetceteraPaymentError): string {
    if (detail?.message) {
        return detail.message;
    }

    return detail?.creditCardBrand
        ? `Click to Pay payment could not be completed. ${detail.creditCardBrand} returned an error.`
        : 'Click to Pay could not encrypt the card details.';
}

function mapPerformance(performance: NetceteraPerformance): ClickToPayPerformance {
    return {
        correlationId: performance.correlationId,
        referenceTimestamp: performance.referenceTimestamp,
        totalLoadingTime: performance.totalLoadingTime,
        customerStatus: performance.consumerStatus ? mapCustomerStatus(performance.consumerStatus) : undefined,
        sdkPerformance: performance.sdkPerformance,
        userActions: performance.userActions,
    };
}

function mapMaskedCard(maskedCard: NetceteraMaskedCard): ClickToPayMaskedCard {
    return {
        srcDigitalCardId: maskedCard.srcDigitalCardId,
        panBin: maskedCard.panBin,
        panLastFour: String(maskedCard.panLastFour),
        panExpirationMonth: maskedCard.panExpirationMonth != null ? String(maskedCard.panExpirationMonth) : undefined,
        panExpirationYear: maskedCard.panExpirationYear != null ? String(maskedCard.panExpirationYear) : undefined,
        tokenBinRange: maskedCard.tokenBinRange,
        tokenLastFour: maskedCard.tokenLastFour != null ? String(maskedCard.tokenLastFour) : undefined,
        tokenId: maskedCard.tokenId,
        paymentCardType: maskedCard.paymentCardType,
        paymentCardDescriptor: maskedCard.paymentCardDescriptor,
        paymentAccountReference: maskedCard.paymentAccountReference,
        srcPaymentCardId: maskedCard.srcPaymentCardId,
        serviceId: maskedCard.serviceId,
        countryCode: maskedCard.countryCode,
        dateOfCardCreated: String(maskedCard.dateOfCardCreated),
        dateOfCardLastUsed: maskedCard.dateOfCardLastUsed != null ? String(maskedCard.dateOfCardLastUsed) : undefined,
        maskedBillingAddress: maskedCard.maskedBillingAddress
            ? mapMaskedCardAddress(maskedCard.maskedBillingAddress)
            : undefined,
        dcf: maskedCard.dcf ? mapMaskedCardDcf(maskedCard.dcf) : undefined,
        digitalCardData: mapDigitalCardData(maskedCard.digitalCardData),
    };
}

function mapMaskedCardAddress(address: NetceteraMaskedCardAddress): ClickToPayMaskedCardAddress {
    return {
        addressId: address.addressId,
        name: address.name,
        line1: address.line1,
        line2: address.line2,
        line3: address.line3,
        city: address.city,
        state: address.state,
        countryCode: address.countryCode,
        zip: address.zip,
        createTime: address.createTime != null ? String(address.createTime) : undefined,
        lastUsedTime: address.lastUsedTime != null ? String(address.lastUsedTime) : undefined,
    };
}

function mapMaskedCardDcf(dcf: NetceteraMaskedCardDcf): ClickToPayMaskedCardDcf {
    return {
        uri: dcf.uri,
        logoUri: dcf.logoUri,
        name: dcf.name,
    };
}

function mapDigitalCardData(data: NetceteraDigitalCardData): ClickToPayDigitalCardData {
    return {
        status: data.status,
        descriptorName: data.descriptorName,
        presentationName: data.presentationName,
        artUri: data.artUri,
        artHeight: data.artHeight != null ? String(data.artHeight) : undefined,
        artWidth: data.artWidth != null ? String(data.artWidth) : undefined,
        pendingEvents: data.pendingEvents?.map(String),
        authenticationMethods: data.authenticationMethods,
    };
}
