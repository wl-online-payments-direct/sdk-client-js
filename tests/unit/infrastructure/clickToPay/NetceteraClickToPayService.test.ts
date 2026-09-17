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

import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { NetceteraClickToPayService } from '../../../../src/infrastructure/clickToPay/NetceteraClickToPayService';
import {
    ConfigurationError,
    InvalidArgumentError,
    type PaymentContextWithAmount,
    ClickToPayError,
    PaymentProduct5002SpecificData,
} from '../../../../src';
import type { NetceteraCheckoutResult } from '../../../../src/infrastructure/clickToPay/NetceteraTypes';

const specificData = new PaymentProduct5002SpecificData({
    mastercard: { srcInitiatorId: 'mc-init', srciDpaId: 'mc-dpa' },
    visa: { srcInitiatorId: 'visa-init', srciDpaId: 'visa-dpa', encryptionKey: 'visa-key', nModulus: 'visa-mod' },
});

const context: PaymentContextWithAmount = {
    countryCode: 'NL',
    amountOfMoney: { amount: 1000, currencyCode: 'EUR' },
};

/** No-op SDK loader — resolves immediately so tests don't need vi.mock for the dynamic import */
const noopLoader = () => Promise.resolve();

/** Creates a service with the no-op loader injected. Opts into both schemes in the module-level
 *  `specificData` and defaults `locale`, which Mastercard needs — override explicitly when a test
 *  needs a different scheme selection or locale. */
function makeService(config: Record<string, unknown> = {}) {
    return new NetceteraClickToPayService(
        specificData,
        context,
        { locale: 'en_US', mastercard: {}, visa: {}, ...config },
        noopLoader,
    );
}

type MockNetceteraElement = HTMLDivElement & {
    config: unknown;
    transactionamount: unknown;
    buttonstyle: unknown;
    uicustomizations: unknown;
    triggerPayButton: ReturnType<typeof vi.fn>;
    displayClickToPayExplanationModal: ReturnType<typeof vi.fn>;
    checkout: ReturnType<typeof vi.fn>;
    getComplianceResourceURLsForVisa: ReturnType<typeof vi.fn>;
    getComplianceResourceURLsForMastercard: ReturnType<typeof vi.fn>;
};

function createMockElement(): MockNetceteraElement {
    const el = document.createElement('div');

    return Object.assign(el, {
        config: undefined as unknown,
        transactionamount: undefined as unknown,
        buttonstyle: undefined as unknown,
        uicustomizations: undefined as unknown,
        triggerPayButton: vi.fn(),
        displayClickToPayExplanationModal: vi.fn(),
        checkout: vi.fn().mockResolvedValue({
            userAction: 'COMPLETE',
            checkoutResponseSignature: 'sig',
            creditCardBrand: 'Mastercard',
            performance: {
                correlationId: { visa: '', mc: 'corr-id' },
                totalLoadingTime: 120,
                sdkPerformance: { visa: [], mc: [] },
                userActions: [],
            },
        } as NetceteraCheckoutResult),
        getComplianceResourceURLsForVisa: vi.fn().mockResolvedValue({ termsUrl: 'https://visa.example.com' }),
        getComplianceResourceURLsForMastercard: vi.fn().mockResolvedValue({ termsUrl: 'https://mc.example.com' }),
    }) as unknown as MockNetceteraElement;
}

let mockElement: MockNetceteraElement;
let container: HTMLDivElement;
let originalCreateElement: typeof document.createElement;

beforeAll(() => {
    originalCreateElement = document.createElement.bind(document);
});

beforeEach(() => {
    mockElement = createMockElement();
    vi.spyOn(document, 'createElement').mockImplementation((tag: string, ...args: unknown[]) => {
        if (tag === 'click-to-pay') return mockElement;
        return originalCreateElement(tag, ...(args as []));
    });
    container = originalCreateElement('div') as HTMLDivElement;
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe('mount()', () => {
    it('resolves once the element is created and attached', async () => {
        const service = makeService({});

        await expect(service.mount(container)).resolves.toBeUndefined();
        expect(container.contains(mockElement)).toBe(true);
    });

    it('appends the click-to-pay element to the container', async () => {
        const service = makeService({});

        await service.mount(container);

        expect(container.contains(mockElement)).toBe(true);
    });

    it('sets Netcetera config on the element', async () => {
        const service = makeService({});

        await service.mount(container);

        expect(mockElement.config).toEqual({
            mastercard: {
                srcInitiatorId: 'mc-init',
                srciDpaId: 'mc-dpa',
                dpaTransactionOptions: {
                    dpaLocale: 'en_US',
                    transactionAmount: { transactionAmount: 10, transactionCurrencyCode: 'EUR' },
                },
            },
            visa: {
                srcInitiatorId: 'visa-init',
                srciDpaId: 'visa-dpa',
                encryptionKey: 'visa-key',
                nModulus: 'visa-mod',
                dpaTransactionOptions: {
                    dpaLocale: 'en_US',
                    transactionAmount: { transactionAmount: '10.00', transactionCurrencyCode: 'EUR' },
                },
            },
        });
    });

    it('sets transactionamount from context', async () => {
        const service = makeService({});

        await service.mount(container);

        expect(mockElement.transactionamount).toEqual({ amount: '10.00', currencyCode: 'EUR' });
    });

    it('sets locale attribute when provided in config', async () => {
        const service = makeService({ locale: 'nl_NL' });
        const setAttributeSpy = vi.spyOn(mockElement, 'setAttribute');

        await service.mount(container);

        expect(setAttributeSpy).toHaveBeenCalledWith('locale', 'nl_NL');
    });

    it('sets email attribute when provided in config', async () => {
        const service = makeService({ email: 'test@example.com' });
        const setAttributeSpy = vi.spyOn(mockElement, 'setAttribute');

        await service.mount(container);

        expect(setAttributeSpy).toHaveBeenCalledWith('email', 'test@example.com');
    });

    it('sets sandbox attribute when config.sandbox is true', async () => {
        const service = makeService({ sandbox: true });
        const setAttributeSpy = vi.spyOn(mockElement, 'setAttribute');

        await service.mount(container);

        expect(setAttributeSpy).toHaveBeenCalledWith('sandbox', 'true');
    });

    it('sets sandbox="false" when config.sandbox is explicitly false', async () => {
        const service = makeService({ sandbox: false });
        const setAttributeSpy = vi.spyOn(mockElement, 'setAttribute');

        await service.mount(container);

        expect(setAttributeSpy).toHaveBeenCalledWith('sandbox', 'false');
    });

    it('does not set sandbox attribute when config.sandbox is absent', async () => {
        const service = makeService({});
        const setAttributeSpy = vi.spyOn(mockElement, 'setAttribute');

        await service.mount(container);

        expect(setAttributeSpy).not.toHaveBeenCalledWith('sandbox', expect.anything());
    });

    it('sets hidepaybutton attribute when config.hidePayButton is true', async () => {
        const service = makeService({ hidePayButton: true });
        const setAttributeSpy = vi.spyOn(mockElement, 'setAttribute');

        await service.mount(container);

        expect(setAttributeSpy).toHaveBeenCalledWith('hidepaybutton', 'true');
    });

    it('sets enableperformancemeasurement attribute when config.enablePerformanceMeasurement is true', async () => {
        const service = makeService({ enablePerformanceMeasurement: true });
        const setAttributeSpy = vi.spyOn(mockElement, 'setAttribute');

        await service.mount(container);

        expect(setAttributeSpy).toHaveBeenCalledWith('enableperformancemeasurement', 'true');
    });

    it('sets uicustomizations on element when provided in config', async () => {
        const uiCustomizations = { checkoutButton: { textColor: '#fff' } };
        const service = makeService({ uiCustomizations });

        await service.mount(container);

        expect(mockElement.uicustomizations).toEqual(uiCustomizations);
    });

    it('rejects with ConfigurationError without emitting paymentError when the SDK loader rejects', async () => {
        const errorHandler = vi.fn();
        const failingLoader = () => Promise.reject(new Error('load failed'));
        const service = new NetceteraClickToPayService(specificData, context, {}, failingLoader);

        service.on('paymentError', errorHandler);

        const call = service.mount(container);

        await expect(call).rejects.toBeInstanceOf(ConfigurationError);
        await expect(call).rejects.toThrow('Failed to load Click to Pay SDK');
        expect(errorHandler).not.toHaveBeenCalled();
    });

    it('rejects with ConfigurationError without emitting paymentError when element setup throws', async () => {
        const errorHandler = vi.fn();
        vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
            if (tag === 'click-to-pay') throw new Error('element setup failed');
            return originalCreateElement(tag);
        });

        const service = makeService({});
        service.on('paymentError', errorHandler);

        const call = service.mount(container);

        await expect(call).rejects.toBeInstanceOf(ConfigurationError);
        await expect(call).rejects.toThrow('Failed to initialize Click to Pay component');
        expect(errorHandler).not.toHaveBeenCalled();
    });

    it('rejects with the no-scheme-configured ConfigurationError when no scheme is configured', async () => {
        const errorHandler = vi.fn();
        const service = new NetceteraClickToPayService(specificData, context, {}, noopLoader);

        service.on('paymentError', errorHandler);

        await expect(service.mount(container)).rejects.toThrow(
            'No Click to Pay scheme is configured. Schemes available for this session: mastercard, visa. Provide the configuration required by at least one of them.',
        );
        expect(errorHandler).not.toHaveBeenCalled();
    });
});

describe('handler isolation', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it('still dispatches to other event handlers after a throwing handler is isolated', async () => {
        vi.useFakeTimers();

        const customerStatusHandler = vi.fn();
        const service = makeService({});

        service.on('paymentError', () => {
            throw new Error('handler bug');
        });
        service.on('customerStatus', customerStatusHandler);

        vi.spyOn(console, 'error').mockImplementation(() => {});

        await service.mount(container);

        mockElement.dispatchEvent(new CustomEvent('paymentError', { detail: { reason: 'UNKNOWN_REASON' } }));
        mockElement.dispatchEvent(new CustomEvent('consumerStatus', { detail: { isRecognized: true } }));

        expect(customerStatusHandler).toHaveBeenCalledOnce();
    });
});

describe('unmount()', () => {
    it('removes the element from the container', async () => {
        const service = makeService({});

        await service.mount(container);
        service.unmount();

        expect(container.contains(mockElement)).toBe(false);
    });

    it('allows remounting after unmount', async () => {
        const service = makeService({});

        await service.mount(container);
        service.unmount();

        const secondContainer = originalCreateElement('div') as HTMLDivElement;
        await service.mount(secondContainer);
        expect(secondContainer.contains(mockElement)).toBe(true);
    });

    it('does not throw when called before mount() has ever completed', () => {
        const service = makeService({});

        expect(() => service.unmount()).not.toThrow();
    });

    it('does not throw when called twice in a row', async () => {
        const service = makeService({});

        await service.mount(container);
        service.unmount();

        expect(() => service.unmount()).not.toThrow();
    });
});

describe('processManualCardEntry()', () => {
    it('delegates to Netcetera element and maps result', async () => {
        const service = makeService({});

        await service.mount(container);

        const result = await service.processManualCardEntry({
            cardNumber: '4111111111111111',
            expiryDate: '1230',
            securityCode: '123',
        });

        expect(mockElement.checkout).toHaveBeenCalledWith({
            card: {
                primaryAccountNumber: '4111111111111111',
                panExpirationMonth: '12',
                panExpirationYear: '30',
                cardSecurityCode: '123',
            },
            profileDetails: undefined,
            complianceResourceURLs: undefined,
            skipVerificationNextTime: undefined,
            iframeRef: undefined,
        });

        expect(result).toEqual({
            userAction: 'COMPLETE',
            checkoutResponseSignature: 'sig',
            cardScheme: 'Mastercard',
            performance: {
                correlationId: { visa: '', mc: 'corr-id' },
                totalLoadingTime: 120,
                sdkPerformance: { visa: [], mc: [] },
                userActions: [],
            },
        });
    });

    it('maps recognitionToken through when present (Mastercard) and omits it when absent (Visa)', async () => {
        mockElement.checkout.mockResolvedValue({
            userAction: 'COMPLETE',
            checkoutResponseSignature: 'sig',
            creditCardBrand: 'Mastercard',
            recognitionToken: 'tok',
            performance: {
                correlationId: { visa: '', mc: 'corr-id' },
                totalLoadingTime: 120,
                sdkPerformance: { visa: [], mc: [] },
                userActions: [],
            },
        });

        const service = makeService({});
        await service.mount(container);

        const result = await service.processManualCardEntry({
            cardNumber: '4111111111111111',
            expiryDate: '1230',
            securityCode: '123',
        });

        expect(result.recognitionToken).toBe('tok');
    });

    it('forwards processManualCardEntry options (profileDetails, complianceResourceURLs, skipVerificationNextTime, iframeRef) to the Netcetera element', async () => {
        const service = makeService({});
        await service.mount(container);

        const iframeRef = originalCreateElement('iframe') as HTMLIFrameElement;

        await service.processManualCardEntry(
            {
                cardNumber: '4111111111111111',
                expiryDate: '1230',
                securityCode: '123',
            },
            {
                profileDetails: {
                    firstName: 'Jane',
                    lastName: 'Doe',
                    fullName: 'Jane Doe',
                    email: 'jane@example.com',
                    country: 'NL',
                    languageCode: 'en',
                    mobileNumber: { countryCode: '1', phoneNumber: '5551234567' },
                },
                complianceResourceURLs: {
                    termsAndConditionsUrl: 'https://example.com/terms',
                    privacyPolicyUrl: 'https://example.com/privacy',
                },
                skipVerificationNextTime: true,
                iframeRef,
            },
        );

        expect(mockElement.checkout).toHaveBeenCalledWith({
            card: {
                primaryAccountNumber: '4111111111111111',
                panExpirationMonth: '12',
                panExpirationYear: '30',
                cardSecurityCode: '123',
            },
            profileDetails: {
                firstName: 'Jane',
                lastName: 'Doe',
                fullName: 'Jane Doe',
                email: 'jane@example.com',
                country: 'NL',
                languageCode: 'en',
                mobileNumber: {
                    countryCode: '1',
                    phoneNumber: '5551234567',
                },
            },
            complianceResourceURLs: {
                termsAndConditionsUrl: 'https://example.com/terms',
                privacyPolicyUrl: 'https://example.com/privacy',
            },
            skipVerificationNextTime: true,
            iframeRef,
        });
    });

    it('maps a credit-card validation rejection to InvalidArgumentError', async () => {
        mockElement.checkout.mockRejectedValue({
            type: 'CREDIT_CARD_EXPIRED',
            message: 'Credit card is expired',
        });

        const service = makeService({});
        await service.mount(container);

        const checkoutCall = service.processManualCardEntry({
            cardNumber: '4111111111111111',
            expiryDate: '1230',
            securityCode: '123',
        });

        await expect(checkoutCall).rejects.toBeInstanceOf(InvalidArgumentError);
        await expect(checkoutCall).rejects.toThrow('Credit card is expired');
        await expect(checkoutCall).rejects.toMatchObject({ metadata: { reason: 'CREDIT_CARD_EXPIRED' } });
    });

    it('maps a non-card-validation rejection to ClickToPayError', async () => {
        mockElement.checkout.mockRejectedValue({
            type: 'UNABLE_TO_CONNECT',
            message: 'Unable to connect',
        });

        const service = makeService({});
        await service.mount(container);

        const checkoutCall = service.processManualCardEntry({
            cardNumber: '4111111111111111',
            expiryDate: '1230',
            securityCode: '123',
        });

        await expect(checkoutCall).rejects.toBeInstanceOf(ClickToPayError);
        await expect(checkoutCall).rejects.toThrow('Unable to connect');
        await expect(checkoutCall).rejects.toMatchObject({ metadata: { reason: 'UNABLE_TO_CONNECT' } });
    });
});

describe('processSavedCard()', () => {
    it('delegates to Netcetera element', async () => {
        const service = makeService({});

        await service.mount(container);
        service.processSavedCard();

        expect(mockElement.triggerPayButton).toHaveBeenCalledOnce();
    });

    it('maps a rejection to ClickToPayError', async () => {
        mockElement.triggerPayButton.mockImplementation(() => {
            throw new Error(
                'Triggering of the pay button outside of the SDK only possible if `hidepaybutton` is set to true.',
            );
        });

        const service = makeService({});
        await service.mount(container);
        const call = () => service.processSavedCard();

        expect(call).toThrow(ClickToPayError);
        expect(call).toThrow(
            'Triggering of the pay button outside of the SDK only possible if `hidepaybutton` is set to true.',
        );
    });
});

describe('displayClickToPayExplanationModal()', () => {
    it('delegates to Netcetera element', async () => {
        const service = makeService({});

        await service.mount(container);
        service.displayClickToPayExplanationModal();

        expect(mockElement.displayClickToPayExplanationModal).toHaveBeenCalledOnce();
    });

    it('maps a thrown vendor error to ClickToPayError', async () => {
        mockElement.displayClickToPayExplanationModal.mockImplementation(() => {
            throw new Error('Modal could not be rendered.');
        });

        const service = makeService({});
        await service.mount(container);

        expect(() => service.displayClickToPayExplanationModal()).toThrow(ClickToPayError);
        expect(() => service.displayClickToPayExplanationModal()).toThrow('Modal could not be rendered.');
    });
});

describe('getComplianceResourceURLsForVisa()', () => {
    it('delegates to Netcetera element with country param', async () => {
        const service = makeService({});

        await service.mount(container);

        const result = await service.getComplianceResourceURLsForVisa('NL');

        expect(mockElement.getComplianceResourceURLsForVisa).toHaveBeenCalledWith('NL');
        expect(result).toEqual({ termsUrl: 'https://visa.example.com' });
    });

    it('maps a rejection to ClickToPayError', async () => {
        mockElement.getComplianceResourceURLsForVisa.mockRejectedValue(
            new Error('Country "XX" is not supported by Visa.'),
        );

        const service = makeService({});
        await service.mount(container);

        const call = service.getComplianceResourceURLsForVisa('XX');

        await expect(call).rejects.toBeInstanceOf(ClickToPayError);
        await expect(call).rejects.toThrow('Country "XX" is not supported by Visa.');
    });
});

describe('getComplianceResourceURLsForMastercard()', () => {
    it('delegates to Netcetera element', async () => {
        const service = makeService({});

        await service.mount(container);

        const result = await service.getComplianceResourceURLsForMastercard();

        expect(mockElement.getComplianceResourceURLsForMastercard).toHaveBeenCalledOnce();
        expect(result).toEqual({ termsUrl: 'https://mc.example.com' });
    });

    it('maps a rejection to ClickToPayError', async () => {
        mockElement.getComplianceResourceURLsForMastercard.mockRejectedValue(
            new Error('Mastercard compliance resources are unavailable.'),
        );

        const service = makeService({});
        await service.mount(container);

        const call = service.getComplianceResourceURLsForMastercard();

        await expect(call).rejects.toBeInstanceOf(ClickToPayError);
        await expect(call).rejects.toThrow('Mastercard compliance resources are unavailable.');
    });
});

describe('on()', () => {
    it('returns the service instance for fluent chaining', () => {
        const service = makeService({});

        expect(service.on('customerStatus', vi.fn())).toBe(service);
    });

    it('replaces previous handler when called twice for the same event', async () => {
        const firstHandler = vi.fn();
        const secondHandler = vi.fn();
        const service = makeService({});

        service.on('customerStatus', firstHandler).on('customerStatus', secondHandler);
        await service.mount(container);

        mockElement.dispatchEvent(new CustomEvent('consumerStatus', { detail: { isRecognized: true } }));

        expect(firstHandler).not.toHaveBeenCalled();
        expect(secondHandler).toHaveBeenCalledOnce();
    });
});

describe('event forwarding', () => {
    it('forwards customerStatus event to handler', async () => {
        const handler = vi.fn();
        const service = makeService({});

        service.on('customerStatus', handler);
        await service.mount(container);

        mockElement.dispatchEvent(
            new CustomEvent('consumerStatus', {
                detail: { isRecognized: true, hasProfile: true, hasCards: true },
            }),
        );

        expect(handler).toHaveBeenCalledWith({
            isRecognized: true,
            hasProfile: true,
            hasCards: true,
            hasProfileInSchemes: [],
            manualCardEntryMandatory: undefined,
            maskedEmailAddress: undefined,
            validationChannel: undefined,
        });
    });

    it('sets buttonstyle to OUTLINED when manualCardEntryMandatory is true', async () => {
        const service = makeService({});

        service.on('customerStatus', vi.fn());
        await service.mount(container);

        mockElement.dispatchEvent(
            new CustomEvent('consumerStatus', {
                detail: { manualCardEntryMandatory: true },
            }),
        );

        expect(mockElement.buttonstyle).toBe('OUTLINED');
    });

    it('does not set buttonstyle when manualCardEntryMandatory is false', async () => {
        const service = makeService({});

        service.on('customerStatus', vi.fn());
        await service.mount(container);

        mockElement.dispatchEvent(
            new CustomEvent('consumerStatus', {
                detail: { manualCardEntryMandatory: false },
            }),
        );

        expect(mockElement.buttonstyle).not.toBe('OUTLINED');
    });

    it('forwards paymentSuccess event to handler with mapped result', async () => {
        const handler = vi.fn();
        const service = makeService({});

        service.on('paymentSuccess', handler);
        await service.mount(container);

        mockElement.dispatchEvent(
            new CustomEvent('paymentSuccess', {
                detail: { userAction: 'COMPLETE', checkoutResponseSignature: 'sig-123', creditCardBrand: 'Visa' },
            }),
        );

        expect(handler).toHaveBeenCalledWith({
            userAction: 'COMPLETE',
            checkoutResponseSignature: 'sig-123',
            cardScheme: 'Visa',
            performance: undefined,
            recognitionToken: undefined,
        });
    });

    it('forwards paymentError event to handler', async () => {
        const handler = vi.fn();
        const service = makeService({});

        service.on('paymentError', handler);
        await service.mount(container);

        mockElement.dispatchEvent(new CustomEvent('paymentError', { detail: { reason: 'UNKNOWN_REASON' } }));

        expect(handler).toHaveBeenCalledWith(expect.any(ClickToPayError));
    });

    it('forwards cardSelection event to handler', async () => {
        const handler = vi.fn();
        const service = makeService({});

        service.on('cardSelection', handler);
        await service.mount(container);

        mockElement.dispatchEvent(
            new CustomEvent('cardSelection', {
                detail: {
                    creditCardBrand: 'Visa',
                    maskedCard: {
                        srcDigitalCardId: 'card-1',
                        panBin: '424242',
                        panLastFour: '1234',
                        dateOfCardCreated: '2024-01-01',
                        digitalCardData: { status: 'ACTIVE', descriptorName: 'My Visa' },
                    },
                },
            }),
        );

        expect(handler).toHaveBeenCalledWith({
            cardScheme: 'Visa',
            maskedCard: {
                srcDigitalCardId: 'card-1',
                panBin: '424242',
                panLastFour: '1234',
                panExpirationMonth: undefined,
                panExpirationYear: undefined,
                tokenBinRange: undefined,
                tokenLastFour: undefined,
                tokenId: undefined,
                paymentCardType: undefined,
                paymentCardDescriptor: undefined,
                paymentAccountReference: undefined,
                srcPaymentCardId: undefined,
                serviceId: undefined,
                countryCode: undefined,
                dateOfCardCreated: '2024-01-01',
                dateOfCardLastUsed: undefined,
                maskedBillingAddress: undefined,
                dcf: undefined,
                digitalCardData: {
                    status: 'ACTIVE',
                    descriptorName: 'My Visa',
                    presentationName: undefined,
                    artUri: undefined,
                    artHeight: undefined,
                    artWidth: undefined,
                    pendingEvents: undefined,
                    authenticationMethods: undefined,
                },
            },
        });
    });

    it('forwards generalEvents event to handler', async () => {
        const handler = vi.fn();
        const service = makeService({});

        service.on('generalEvents', handler);
        await service.mount(container);

        mockElement.dispatchEvent(new CustomEvent('generalEvents', { detail: 'SOME_GENERAL_EVENT' }));

        expect(handler).toHaveBeenCalledWith('SOME_GENERAL_EVENT');
    });

    it('forwards unbindCustomer event to handler', async () => {
        const handler = vi.fn();
        const service = makeService({});

        service.on('unbindCustomer', handler);
        await service.mount(container);

        mockElement.dispatchEvent(new CustomEvent('unbindConsumer'));

        expect(handler).toHaveBeenCalledOnce();
    });

    it('does not forward events when no handler is registered', async () => {
        const service = makeService({});

        await service.mount(container);

        expect(() => {
            mockElement.dispatchEvent(new CustomEvent('consumerStatus', { detail: { isRecognized: true } }));
        }).not.toThrow();
    });
});

describe('handler lifecycle', () => {
    it('handlers registered before mount survive unmount and work on remount', async () => {
        const handler = vi.fn();
        const service = makeService({});

        service.on('customerStatus', handler);
        await service.mount(container);
        service.unmount();

        const secondMockElement = createMockElement();
        vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
            if (tag === 'click-to-pay') return secondMockElement;
            return originalCreateElement(tag);
        });

        const secondContainer = originalCreateElement('div') as HTMLDivElement;
        await service.mount(secondContainer);

        secondMockElement.dispatchEvent(new CustomEvent('consumerStatus', { detail: { isRecognized: true } }));

        expect(handler).toHaveBeenCalledOnce();
    });
});
