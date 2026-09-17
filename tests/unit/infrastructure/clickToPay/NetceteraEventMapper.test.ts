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

import { describe, expect, it } from 'vitest';
import {
    mapCardSelection,
    mapManualCardDetails,
    mapNetceteraCallError,
    mapPaymentResult,
    mapCustomerStatus,
    mapNetceteraError,
} from '../../../../src/infrastructure/clickToPay/NetceteraEventMapper';
import { InvalidArgumentError, ClickToPayError } from '../../../../src';
import type {
    NetceteraCardSelectionEvent,
    NetceteraCheckoutError,
    NetceteraCheckoutResult,
    NetceteraCustomerStatusEvent,
    NetceteraPaymentError,
} from '../../../../src/infrastructure/clickToPay/NetceteraTypes';

describe('mapCustomerStatus', () => {
    it('maps all direct fields', () => {
        const detail: NetceteraCustomerStatusEvent = {
            isRecognized: true,
            hasProfile: true,
            hasCards: true,
            hasProfileInSchemes: ['Mastercard'],
            manualCardEntryMandatory: false,
            maskedEmailAddress: 't***@example.com',
            validationChannel: 'EMAIL_ADDRESS',
        };

        expect(mapCustomerStatus(detail)).toEqual({
            isRecognized: true,
            hasProfile: true,
            hasCards: true,
            hasProfileInSchemes: ['Mastercard'],
            manualCardEntryMandatory: false,
            maskedEmailAddress: 't***@example.com',
            validationChannel: 'EMAIL_ADDRESS',
        });
    });

    it('falls back to consumerIdentity.maskedEmailAddress when maskedEmailAddress is absent', () => {
        const detail: NetceteraCustomerStatusEvent = {
            isRecognized: false,
            consumerIdentity: { maskedEmailAddress: 'f***@example.com' },
        };

        expect(mapCustomerStatus(detail)).toEqual({
            isRecognized: false,
            hasProfile: false,
            hasCards: false,
            hasProfileInSchemes: [],
            manualCardEntryMandatory: undefined,
            maskedEmailAddress: 'f***@example.com',
            validationChannel: undefined,
        });
    });

    it('prefers top-level maskedEmailAddress over consumerIdentity fallback', () => {
        const detail: NetceteraCustomerStatusEvent = {
            maskedEmailAddress: 'direct@example.com',
            consumerIdentity: { maskedEmailAddress: 'nested@example.com' },
        };

        expect(mapCustomerStatus(detail).maskedEmailAddress).toBe('direct@example.com');
    });

    it('defaults required fields to false/empty array when absent from the raw event', () => {
        const result = mapCustomerStatus({});

        expect(result.isRecognized).toBe(false);
        expect(result.hasProfile).toBe(false);
        expect(result.hasCards).toBe(false);
        expect(result.hasProfileInSchemes).toEqual([]);
        expect(result.manualCardEntryMandatory).toBeUndefined();
        expect(result.maskedEmailAddress).toBeUndefined();
        expect(result.validationChannel).toBeUndefined();
    });
});

describe('mapPaymentResult', () => {
    it('maps all fields', () => {
        const detail: NetceteraCheckoutResult = {
            userAction: 'COMPLETE',
            checkoutResponseSignature: 'sig-abc',
            creditCardBrand: 'Visa',
            recognitionToken: 'token-xyz',
            performance: {
                correlationId: { visa: 'corr-id', mc: '' },
                totalLoadingTime: 500,
                sdkPerformance: { visa: [], mc: [] },
                userActions: [],
            },
        };

        const result = mapPaymentResult(detail);

        expect(result).toEqual({
            userAction: 'COMPLETE',
            checkoutResponseSignature: 'sig-abc',
            cardScheme: 'Visa',
            recognitionToken: 'token-xyz',
            performance: {
                correlationId: { visa: 'corr-id', mc: '' },
                totalLoadingTime: 500,
                sdkPerformance: { visa: [], mc: [] },
                userActions: [],
            },
        });
    });

    it('maps recognitionToken as undefined when absent (Visa has no recognitionToken)', () => {
        const detail: NetceteraCheckoutResult = {
            userAction: 'CANCEL',
            checkoutResponseSignature: 'sig',
            creditCardBrand: 'Visa',
            performance: {
                correlationId: { visa: 'corr-id', mc: '' },
                totalLoadingTime: 10,
                sdkPerformance: { visa: [], mc: [] },
                userActions: [],
            },
        };

        expect(mapPaymentResult(detail)).toEqual({
            userAction: 'CANCEL',
            checkoutResponseSignature: 'sig',
            cardScheme: 'Visa',
            recognitionToken: undefined,
            performance: {
                correlationId: { visa: 'corr-id', mc: '' },
                totalLoadingTime: 10,
                sdkPerformance: { visa: [], mc: [] },
                userActions: [],
            },
        });
    });
});

describe('mapManualCardDetails', () => {
    it('splits a 4-digit expiryDate (MMYYYY) into month and 2-digit year fields', () => {
        const result = mapManualCardDetails({
            cardNumber: '4111111111111111',
            expiryDate: '122030',
            securityCode: '123',
        });

        expect(result).toEqual({
            primaryAccountNumber: '4111111111111111',
            panExpirationMonth: '12',
            panExpirationYear: '30',
            cardSecurityCode: '123',
        });
    });

    it('splits a 2-digit expiryDate (MMYY) into month and year fields', () => {
        const result = mapManualCardDetails({
            cardNumber: '4111111111111111',
            expiryDate: '1230',
            securityCode: '123',
        });

        expect(result).toEqual({
            primaryAccountNumber: '4111111111111111',
            panExpirationMonth: '12',
            panExpirationYear: '30',
            cardSecurityCode: '123',
        });
    });

    it('strips non-digit separators from expiryDate before splitting', () => {
        const result = mapManualCardDetails({
            cardNumber: '4111111111111111',
            expiryDate: '12/30',
            securityCode: '123',
        });

        expect(result.panExpirationMonth).toBe('12');
        expect(result.panExpirationYear).toBe('30');
    });

    const invalidExpiryDates = ['', '1', '123', '12305', 'abcd', '1330', '0030'] as const;

    it.each(invalidExpiryDates)('throws InvalidArgumentError for malformed expiryDate "%s"', (expiryDate) => {
        const call = () =>
            mapManualCardDetails({
                cardNumber: '4111111111111111',
                expiryDate,
                securityCode: '123',
            });

        expect(call).toThrow(InvalidArgumentError);
        expect(call).toThrow(`Invalid Click to Pay expiry date format: "${expiryDate}". Expected MMYY or MMYYYY.`);
    });
});

describe('mapCardSelection', () => {
    const buildDetail = (
        overrides: Partial<NetceteraCardSelectionEvent['maskedCard']> = {},
    ): NetceteraCardSelectionEvent => ({
        creditCardBrand: 'Mastercard',
        maskedCard: {
            srcDigitalCardId: 'card-id',
            panBin: '424242',
            panLastFour: 1234,
            dateOfCardCreated: 1700000000,
            digitalCardData: {
                status: 'ACTIVE',
                descriptorName: 'My Card',
            },
            ...overrides,
        },
    });

    it('maps cardScheme', () => {
        expect(mapCardSelection(buildDetail()).cardScheme).toBe('Mastercard');
    });

    it('coerces numeric panLastFour to string', () => {
        const result = mapCardSelection(buildDetail({ panLastFour: 5678 }));

        expect(result.maskedCard.panLastFour).toBe('5678');
    });

    it('coerces numeric dateOfCardCreated to string', () => {
        const result = mapCardSelection(buildDetail({ dateOfCardCreated: 1700000000 }));

        expect(result.maskedCard.dateOfCardCreated).toBe('1700000000');
    });

    it('coerces numeric panExpirationMonth and panExpirationYear to string', () => {
        const result = mapCardSelection(buildDetail({ panExpirationMonth: 12, panExpirationYear: 2030 }));

        expect(result.maskedCard.panExpirationMonth).toBe('12');
        expect(result.maskedCard.panExpirationYear).toBe('2030');
    });

    it('leaves panExpirationMonth and panExpirationYear undefined when absent', () => {
        const result = mapCardSelection(buildDetail());

        expect(result.maskedCard.panExpirationMonth).toBeUndefined();
        expect(result.maskedCard.panExpirationYear).toBeUndefined();
    });

    it('coerces numeric tokenLastFour to string', () => {
        const result = mapCardSelection(buildDetail({ tokenLastFour: 9999 }));

        expect(result.maskedCard.tokenLastFour).toBe('9999');
    });

    it('coerces numeric artHeight and artWidth in digitalCardData to string', () => {
        const result = mapCardSelection(
            buildDetail({
                digitalCardData: {
                    status: 'ACTIVE',
                    descriptorName: 'My Card',
                    artHeight: 40,
                    artWidth: 60,
                },
            }),
        );

        expect(result.maskedCard.digitalCardData.artHeight).toBe('40');
        expect(result.maskedCard.digitalCardData.artWidth).toBe('60');
    });

    it('coerces numeric pendingEvents to string[]', () => {
        const result = mapCardSelection(
            buildDetail({
                digitalCardData: {
                    status: 'ACTIVE',
                    descriptorName: 'My Card',
                    pendingEvents: [1, 'UPDATE'],
                },
            }),
        );

        expect(result.maskedCard.digitalCardData.pendingEvents).toEqual(['1', 'UPDATE']);
    });

    it('maps optional maskedBillingAddress when present', () => {
        const result = mapCardSelection(
            buildDetail({
                maskedBillingAddress: {
                    addressId: 'addr-1',
                    name: 'John',
                    city: 'Amsterdam',
                    countryCode: 'NL',
                },
            }),
        );

        expect(result.maskedCard.maskedBillingAddress).toEqual({
            addressId: 'addr-1',
            name: 'John',
            city: 'Amsterdam',
            countryCode: 'NL',
            line1: undefined,
            line2: undefined,
            line3: undefined,
            state: undefined,
            zip: undefined,
            createTime: undefined,
            lastUsedTime: undefined,
        });
    });

    it('maps optional dcf when present', () => {
        const result = mapCardSelection(
            buildDetail({
                dcf: { uri: 'https://dcf.example.com', logoUri: 'https://logo.example.com', name: 'DCF' },
            }),
        );

        expect(result.maskedCard.dcf).toEqual({
            uri: 'https://dcf.example.com',
            logoUri: 'https://logo.example.com',
            name: 'DCF',
        });
    });

    it('leaves maskedBillingAddress and dcf undefined when absent', () => {
        const result = mapCardSelection(buildDetail());

        expect(result.maskedCard.maskedBillingAddress).toBeUndefined();
        expect(result.maskedCard.dcf).toBeUndefined();
    });
});

describe('mapNetceteraError', () => {
    const paymentErrorReasons = [
        'REQUEST_TIMEOUT',
        'UNABLE_TO_CONNECT',
        'SERVER_ERROR',
        'SERVICE_ERROR',
        'RATE_LIMIT_EXCEEDED',
        'OTP_SEND_FAILED',
        'ISSUER_DECLINED',
        'UNKNOWN_REASON',
    ] as const;

    it.each(paymentErrorReasons)('maps "%s" reason to ClickToPayError, preserving reason and message', (reason) => {
        const error = mapNetceteraError({ reason, message: 'Some vendor message' });

        expect(error).toBeInstanceOf(ClickToPayError);
        expect(error.message).toBe('Some vendor message');
        expect(error.metadata).toStrictEqual({ reason, cardScheme: undefined });
    });

    it('maps a DCF payment failure to ClickToPayError, naming the scheme that reported it', () => {
        const error = mapNetceteraError({ creditCardBrand: 'Mastercard' });

        expect(error).toBeInstanceOf(ClickToPayError);
        expect(error.message).toBe('Click to Pay payment could not be completed. Mastercard returned an error.');
        expect(error.metadata).toEqual({ reason: '', cardScheme: 'Mastercard' });
    });

    it('names Visa when Visa reported the failure', () => {
        const error = mapNetceteraError({ creditCardBrand: 'Visa' });

        expect(error.message).toBe('Click to Pay payment could not be completed. Visa returned an error.');
    });

    it('prefers a vendor message over the payment-failed fallback', () => {
        const error = mapNetceteraError({
            creditCardBrand: 'Visa',
            message: 'Scheme declined the transaction',
        });

        expect(error.message).toBe('Scheme declined the transaction');
        expect(error.metadata).toEqual({ reason: '', cardScheme: 'Visa' });
    });

    it('maps a card-encryption failure to ClickToPayError, preserving its message', () => {
        const error = mapNetceteraError(new TypeError('JWK must be an object') as unknown as NetceteraPaymentError);

        expect(error).toBeInstanceOf(ClickToPayError);
        expect(error.message).toBe('JWK must be an object');
        expect(error.metadata).toStrictEqual({ reason: '', cardScheme: undefined });
    });

    it('falls back to the encryption message when neither a message nor a scheme is present', () => {
        const error = mapNetceteraError({ reason: 'UNKNOWN_REASON' } as NetceteraPaymentError);

        expect(error).toBeInstanceOf(ClickToPayError);
        expect(error.message).toBe('Click to Pay could not encrypt the card details.');
        expect(error.metadata).toStrictEqual({ reason: 'UNKNOWN_REASON', cardScheme: undefined });
    });

    it('maps missing reason and message to ClickToPayError with default message', () => {
        const error = mapNetceteraError({} as NetceteraPaymentError);

        expect(error).toBeInstanceOf(ClickToPayError);
        expect(error.message).toBe('Click to Pay could not encrypt the card details.');
        expect(error.metadata).toStrictEqual({ reason: '', cardScheme: undefined });
    });

    it('maps null/undefined detail gracefully', () => {
        const error = mapNetceteraError(null as unknown as NetceteraPaymentError);

        expect(error).toBeInstanceOf(ClickToPayError);
        expect(error.message).toBe('Click to Pay could not encrypt the card details.');
        expect(error.metadata).toStrictEqual({ reason: '', cardScheme: undefined });
    });
});

describe('mapNetceteraCallError', () => {
    const cardValidationTypes = [
        'CREDIT_CARD_NUMBER_REQUIRED',
        'CREDIT_CARD_CVV_REQUIRED',
        'CREDIT_CARD_EXPIRATION_YEAR_REQUIRED',
        'CREDIT_CARD_EXPIRATION_MONTH_REQUIRED',
        'CREDIT_CARD_NUMBER_INVALID',
        'CREDIT_CARD_NUMBER_UNSUPPORTED',
        'CREDIT_CARD_CVV_INVALID',
        'CREDIT_CARD_EXPIRED',
    ] as const;

    it.each(cardValidationTypes)('maps "%s" to InvalidArgumentError', (type) => {
        const error = mapNetceteraCallError({ type, message: 'Card details are invalid' });

        expect(error).toBeInstanceOf(InvalidArgumentError);
        expect(error.message).toBe('Card details are invalid');
        expect(error.metadata).toStrictEqual({ reason: type });
    });

    const complianceValidationTypes = ['TERMS_AND_CONDITIONS_URL_REQUIRED', 'PRIVACY_POLICY_URL_REQUIRED'] as const;

    it.each(complianceValidationTypes)('maps "%s" to InvalidArgumentError, preserving message and reason', (type) => {
        const error = mapNetceteraCallError({ type, message: 'Compliance resource URL is required' });

        expect(error).toBeInstanceOf(InvalidArgumentError);
        expect(error.message).toBe('Compliance resource URL is required');
        expect(error.metadata).toEqual({ reason: type });
    });

    it('maps a plain vendor Error (no type) to ClickToPayError, preserving its message', () => {
        const error = mapNetceteraCallError(
            new Error('Country "XX" is not supported by Visa.') as unknown as NetceteraCheckoutError,
        );

        expect(error).toBeInstanceOf(ClickToPayError);
        expect(error.message).toBe('Country "XX" is not supported by Visa.');
        expect(error.metadata).toStrictEqual({ reason: '' });
    });

    it('maps an SRC network error (reason, no type) to InvalidArgumentError for card-data reasons', () => {
        const error = mapNetceteraCallError({ reason: 'CARD_INVALID', message: 'Card is invalid' });

        expect(error).toBeInstanceOf(InvalidArgumentError);
        expect(error.message).toBe('Card is invalid');
        expect(error.metadata).toStrictEqual({ reason: 'CARD_INVALID' });
    });

    it('maps an SRC network error (reason, no type) to ClickToPayError for network reasons', () => {
        const error = mapNetceteraCallError({ reason: 'UNABLE_TO_CONNECT', message: 'Unable to connect' });

        expect(error).toBeInstanceOf(ClickToPayError);
        expect(error.message).toBe('Unable to connect');
        expect(error.metadata).toStrictEqual({ reason: 'UNABLE_TO_CONNECT' });
    });

    it('maps missing type/message gracefully to ClickToPayError with default message', () => {
        const error = mapNetceteraCallError({} as NetceteraCheckoutError);

        expect(error).toBeInstanceOf(ClickToPayError);
        expect(error.message).toBe('Click to Pay error');
        expect(error.metadata).toStrictEqual({ reason: '' });
    });

    it('maps null/undefined detail gracefully', () => {
        const error = mapNetceteraCallError(null as unknown as NetceteraCheckoutError);

        expect(error).toBeInstanceOf(ClickToPayError);
        expect(error.message).toBe('Click to Pay error');
        expect(error.metadata).toStrictEqual({ reason: '' });
    });
});
