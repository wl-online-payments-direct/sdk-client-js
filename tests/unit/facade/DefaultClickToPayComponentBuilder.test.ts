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

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    ClickToPayError,
    type ClickToPayInstance,
    type ClickToPayConfig,
    type ClickToPayManualCardDetails,
    type ClickToPayPaymentResult,
    ConfigurationError,
    InvalidArgumentError,
} from '../../../src';
import { DefaultClickToPayComponentBuilder } from '../../../src/facade/clickToPay/DefaultClickToPayComponentBuilder';
import { DefaultClickToPayInstance } from '../../../src/facade/clickToPay/DefaultClickToPayInstance';
import type { ClickToPayService } from '../../../src/services/interfaces/ClickToPayService';

describe('DefaultClickToPayComponentBuilder', () => {
    const CONTAINER_ID = 'c2p-container';

    let mockClickToPayService: ClickToPayService;
    let loadClickToPayServiceSpy: ReturnType<typeof vi.fn<(config: ClickToPayConfig) => Promise<ClickToPayService>>>;

    const createCard = (): ClickToPayManualCardDetails => ({
        cardNumber: '4111111111111111',
        expiryDate: '1230',
        securityCode: '123',
    });

    const createCheckoutResult = (): ClickToPayPaymentResult => ({
        userAction: 'COMPLETE',
        checkoutResponseSignature: 'signature',
        cardScheme: 'Mastercard',
        performance: {
            correlationId: { visa: '', mc: 'correlation-id' },
            totalLoadingTime: 100,
            sdkPerformance: { visa: [], mc: [] },
            userActions: [],
        },
    });

    const createComponent = () => new DefaultClickToPayComponentBuilder(loadClickToPayServiceSpy);

    /** Builds a component, mounts it, and returns the resolved post-mount handle. */
    const mountComponent = async (): Promise<ClickToPayInstance> => createComponent().mount(CONTAINER_ID);

    beforeEach(() => {
        document.body.innerHTML = `<div id="${CONTAINER_ID}"></div>`;

        mockClickToPayService = {
            on: vi.fn().mockReturnThis(),
            mount: vi.fn().mockResolvedValue(undefined),
            unmount: vi.fn(),
            processManualCardEntry: vi.fn().mockResolvedValue(createCheckoutResult()),
            processSavedCard: vi.fn(),
            displayClickToPayExplanationModal: vi.fn(),
            getComplianceResourceURLsForVisa: vi.fn().mockResolvedValue({}),
            getComplianceResourceURLsForMastercard: vi.fn().mockResolvedValue({}),
        };

        loadClickToPayServiceSpy = vi.fn().mockResolvedValue(mockClickToPayService);
    });

    afterEach(() => {
        vi.restoreAllMocks();
        document.body.innerHTML = '';
    });

    describe('construction and configuration', () => {
        it('should be constructed synchronously without loading the ClickToPayService', () => {
            const component = createComponent();

            expect(component).toBeInstanceOf(DefaultClickToPayComponentBuilder);
            expect(loadClickToPayServiceSpy).not.toHaveBeenCalled();
        });

        it('should return this from config() and on() to support chaining', () => {
            const component = createComponent();

            expect(component.config({ locale: 'en_US' })).toBe(component);
            expect(component.on('paymentError', vi.fn())).toBe(component);
        });
    });

    describe('mount()', () => {
        it('should load the service with the configuration, delegate to it, and resolve to a handle', async () => {
            const component = createComponent();
            const config: ClickToPayConfig = { locale: 'nl_NL', sandbox: true };

            component.config(config);

            const api = await component.mount(CONTAINER_ID);

            expect(loadClickToPayServiceSpy).toHaveBeenCalledWith(config);
            expect(mockClickToPayService.mount).toHaveBeenCalledWith(document.getElementById(CONTAINER_ID));
            // The handle is a distinct object, not the builder itself.
            expect(api).not.toBe(component);
            expect(api).toBeInstanceOf(DefaultClickToPayInstance);
        });

        it('should register handlers added before mount on the resolved service', async () => {
            const component = createComponent();
            const handler = vi.fn();

            component.on('customerStatus', handler);
            await component.mount(CONTAINER_ID);

            expect(mockClickToPayService.on).toHaveBeenCalledWith('customerStatus', handler);
        });

        it('should emit paymentError and reject when the container id is not found', async () => {
            const component = createComponent();
            const paymentErrorHandler = vi.fn();

            component.on('paymentError', paymentErrorHandler);

            const rejection = await component.mount('does-not-exist').catch((error) => error);

            expect(rejection).toBeInstanceOf(InvalidArgumentError);
            expect(rejection.message).toBe('Click to Pay: no element found with id "does-not-exist".');
            expect(paymentErrorHandler).toHaveBeenCalledWith(rejection);
            expect(paymentErrorHandler).toHaveBeenCalledTimes(1);
            expect(loadClickToPayServiceSpy).not.toHaveBeenCalled();
        });

        it('should wrap a non-SdkError failure as ClickToPayError for the paymentError handler', async () => {
            const error = new Error('factory failed');

            loadClickToPayServiceSpy.mockReset().mockRejectedValue(error);

            const component = createComponent();
            const paymentErrorHandler = vi.fn();

            component.on('paymentError', paymentErrorHandler);

            // mount() rejects with the original error so the caller keeps its stack, while the
            // paymentError handler always receives an SdkError, as its signature guarantees.
            await expect(component.mount(CONTAINER_ID)).rejects.toBe(error);
            expect(paymentErrorHandler).toHaveBeenCalledTimes(1);
            expect(paymentErrorHandler.mock.calls[0][0]).toBeInstanceOf(ClickToPayError);
            expect(paymentErrorHandler.mock.calls[0][0].message).toBe('factory failed');
        });

        it('should pass an SdkError failure through to both channels unchanged', async () => {
            const error = new ConfigurationError('Click to Pay is not available for this session.');

            loadClickToPayServiceSpy.mockReset().mockRejectedValue(error);

            const component = createComponent();
            const paymentErrorHandler = vi.fn();

            component.on('paymentError', paymentErrorHandler);

            await expect(component.mount(CONTAINER_ID)).rejects.toBe(error);
            expect(paymentErrorHandler).toHaveBeenCalledWith(error);
        });

        it('should allow retrying mount after a failed attempt', async () => {
            loadClickToPayServiceSpy
                .mockReset()
                .mockRejectedValueOnce(new Error('temporary failure'))
                .mockResolvedValueOnce(mockClickToPayService);

            const component = createComponent();

            await expect(component.mount(CONTAINER_ID)).rejects.toThrow('temporary failure');
            await expect(component.mount(CONTAINER_ID)).resolves.toBeInstanceOf(DefaultClickToPayInstance);
            expect(loadClickToPayServiceSpy).toHaveBeenCalledTimes(2);
        });

        it('should reject with ConfigurationError when mounting an already mounted component', async () => {
            const component = createComponent();

            await component.mount(CONTAINER_ID);

            await expect(component.mount(CONTAINER_ID)).rejects.toThrow(
                'Click to Pay configuration cannot be changed after mounting has started.',
            );
        });
    });

    describe('configuration after mounting has started', () => {
        it('should throw ConfigurationError when config() is called after mount', async () => {
            const component = createComponent();

            await component.mount(CONTAINER_ID);

            expect(() => component.config({ locale: 'en_US' })).toThrow(
                'Click to Pay configuration cannot be changed after mounting has started.',
            );
        });

        it('should throw ConfigurationError when on() is called after mount', async () => {
            const component = createComponent();

            await component.mount(CONTAINER_ID);

            expect(() => component.on('paymentError', vi.fn())).toThrow(
                'Click to Pay configuration cannot be changed after mounting has started.',
            );
        });
    });

    describe('handle operations after mount', () => {
        it('processManualCardEntry() should delegate to the service and return its result', async () => {
            const api = await mountComponent();
            const card = createCard();

            const result = await api.processManualCardEntry(card);

            expect(mockClickToPayService.processManualCardEntry).toHaveBeenCalledWith(card, undefined);
            expect(result).toEqual(createCheckoutResult());
        });

        it('processManualCardEntry() should forward processManualCardEntry options to the service', async () => {
            const api = await mountComponent();
            const card = createCard();
            const options = { skipVerificationNextTime: true };

            await api.processManualCardEntry(card, options);

            expect(mockClickToPayService.processManualCardEntry).toHaveBeenCalledWith(card, options);
        });

        it('processSavedCard() should delegate to processSavedCard', async () => {
            const api = await mountComponent();

            await api.processSavedCard();

            expect(mockClickToPayService.processSavedCard).toHaveBeenCalledTimes(1);
        });

        it('displayClickToPayExplanationModal() should delegate to the service', async () => {
            const api = await mountComponent();

            await api.displayClickToPayExplanationModal();

            expect(mockClickToPayService.displayClickToPayExplanationModal).toHaveBeenCalledTimes(1);
        });

        it('getComplianceResourceURLsForVisa() should delegate with the country and return its result', async () => {
            const visaUrls = {
                termsAndConditionsUrl: 'https://visa.example/terms',
                privacyPolicyUrl: 'https://visa.example/privacy',
            };
            mockClickToPayService.getComplianceResourceURLsForVisa = vi.fn().mockResolvedValue(visaUrls);

            const api = await mountComponent();
            const result = await api.getComplianceResourceURLsForVisa('NL');

            expect(mockClickToPayService.getComplianceResourceURLsForVisa).toHaveBeenCalledWith('NL');
            expect(result).toBe(visaUrls);
        });

        it('getComplianceResourceURLsForMastercard() should delegate to the service and return its result', async () => {
            const mastercardUrls = {
                termsAndConditionsUrl: 'https://mastercard.example/terms',
                privacyPolicyUrl: 'https://mastercard.example/privacy',
            };
            mockClickToPayService.getComplianceResourceURLsForMastercard = vi.fn().mockResolvedValue(mastercardUrls);

            const api = await mountComponent();
            const result = await api.getComplianceResourceURLsForMastercard();

            expect(mockClickToPayService.getComplianceResourceURLsForMastercard).toHaveBeenCalledTimes(1);
            expect(result).toBe(mastercardUrls);
        });
    });

    describe('handler isolation', () => {
        afterEach(() => {
            vi.useRealTimers();
        });

        it('should still reject with the real error when the paymentError handler throws (container not found)', async () => {
            vi.useFakeTimers();

            const component = createComponent();
            const handlerError = new Error('handler bug');

            component.on('paymentError', () => {
                throw handlerError;
            });

            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            await expect(component.mount('does-not-exist')).rejects.toBeInstanceOf(InvalidArgumentError);
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Click to Pay: a registered event handler threw an error.',
                handlerError,
            );
        });

        it('should still reject with the real error when the paymentError handler throws (service load failure)', async () => {
            vi.useFakeTimers();

            const error = new Error('factory failed');
            loadClickToPayServiceSpy.mockReset().mockRejectedValue(error);

            const component = createComponent();
            const handlerError = new Error('handler bug');

            component.on('paymentError', () => {
                throw handlerError;
            });

            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            await expect(component.mount(CONTAINER_ID)).rejects.toBe(error);
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Click to Pay: a registered event handler threw an error.',
                handlerError,
            );
        });
    });

    describe('unmount()', () => {
        it('should delegate to the service', async () => {
            const api = await mountComponent();

            api.unmount();

            expect(mockClickToPayService.unmount).toHaveBeenCalledTimes(1);
        });

        it('should throw ConfigurationError when unmount is called twice', async () => {
            const api = await mountComponent();

            api.unmount();

            expect(() => api.unmount()).toThrow('Click to Pay component has been unmounted.');
        });

        it('should reject operations with ConfigurationError after unmount', async () => {
            const api = await mountComponent();

            api.unmount();

            await expect(api.processManualCardEntry(createCard())).rejects.toThrow(
                'Click to Pay component has been unmounted.',
            );
        });
    });
});
