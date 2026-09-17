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
import { getConfiguration, getSessionDetails } from '../setup';
import {
    type ClickToPayInstance,
    ConfigurationError,
    init,
    type OnlinePaymentSdk,
    ClickToPayError,
    type PaymentProduct5002ApiParameters,
} from '../../../src';
import { paymentContextWithAmount } from '../../__fixtures__/payment-context';
import { CLICK_TO_PAY_ID } from '../../__fixtures__/payment_ids';
import { getApiClientSpyMock } from '../utils';
import { DefaultApiClient } from '../../../src/infrastructure/DefaultApiClient';
import { normalize } from '../../../src/facade/SessionDataNormalizer';
import type { PaymentProductDto } from '../../../src/infrastructure/apiModels/paymentProduct/PaymentProductDto';

describe('sdk.clickToPay (real Netcetera SDK, real payment product 5002)', () => {
    const CONTAINER_ID = 'click-to-pay-container';
    const CONFIG = { sandbox: true, locale: 'en_US', mastercard: {} } as const;
    const CANONICAL_SCHEMES = ['mastercard', 'visa'] as const;

    let session: OnlinePaymentSdk;
    let api: ClickToPayInstance | undefined;
    let container: HTMLDivElement;
    let apiClientSpy: ReturnType<typeof getApiClientSpyMock> | undefined;
    let productDto: PaymentProductDto;
    let apiParameters: PaymentProduct5002ApiParameters;

    const availableSchemes = () => CANONICAL_SCHEMES.filter((scheme) => apiParameters[scheme]);

    const noSchemeMessage = () =>
        `No Click to Pay scheme is configured. Schemes available for this session: ${availableSchemes().join(', ')}. Provide the configuration required by at least one of them.`;

    const mockDisabledProduct = () => {
        apiClientSpy = getApiClientSpyMock('getWithContext', {
            ...productDto,
            paymentProduct5002SpecificData: undefined,
        });
    };

    beforeAll(async () => {
        const { clientApiUrl, customerId, clientSessionId } = normalize(getSessionDetails());
        const apiClient = new DefaultApiClient(clientApiUrl, customerId, clientSessionId, 'test-identifier');

        const response = await apiClient.getWithContext<PaymentProductDto>(
            `products/${CLICK_TO_PAY_ID}`,
            paymentContextWithAmount,
            { useCacheBuster: true },
        );

        productDto = response.data;
        apiParameters = productDto.paymentProduct5002SpecificData?.apiParameters ?? {};
    });

    beforeEach(() => {
        session = init(getSessionDetails(), getConfiguration());

        container = document.createElement('div');
        container.id = CONTAINER_ID;
        document.body.appendChild(container);
    });

    afterEach(() => {
        try {
            api?.unmount();
        } catch {
            // Failure-path tests never obtain a mounted handle, so there is nothing to unmount.
        }

        api = undefined;
        container.remove();
        apiClientSpy?.mockRestore();
        apiClientSpy = undefined;
    });

    describe('service availability', () => {
        it('emits a ConfigurationError when Click to Pay is not enabled for the session', async () => {
            mockDisabledProduct();

            const errors: Error[] = [];
            const component = session.clickToPay(paymentContextWithAmount).config(CONFIG);
            component.on('paymentError', (error) => errors.push(error));

            const rejection = await component.mount(CONTAINER_ID).catch((error) => error);

            expect(rejection).toBeInstanceOf(ConfigurationError);
            expect(rejection.message).toBe('Click to Pay is not available for this session.');
            expect(errors).toEqual([rejection]);
        });
    });

    describe('configuration validation', () => {
        it('rejects with ConfigurationError when no available scheme is configured', async () => {
            const component = session.clickToPay(paymentContextWithAmount).config({ sandbox: true });
            const rejection = await component.mount(CONTAINER_ID).catch((error) => error);

            expect(rejection).toBeInstanceOf(ConfigurationError);
            expect(rejection.message).toBe(noSchemeMessage());
        });

        it('names the schemes the session actually offers', async () => {
            const component = session.clickToPay(paymentContextWithAmount).config({ sandbox: true });
            const rejection = await component.mount(CONTAINER_ID).catch((error) => error);

            for (const scheme of availableSchemes()) {
                expect(rejection.message).toContain(scheme);
            }

            for (const scheme of CANONICAL_SCHEMES.filter((scheme) => !apiParameters[scheme])) {
                expect(rejection.message).not.toContain(scheme);
            }
        });

        it('treats a missing locale as declining Mastercard rather than as an error', async () => {
            const component = session.clickToPay(paymentContextWithAmount).config({ sandbox: true, mastercard: {} });
            const rejection = await component.mount(CONTAINER_ID).catch((error) => error);

            expect(rejection).toBeInstanceOf(ConfigurationError);
            expect(rejection.message).toBe(noSchemeMessage());
        });
    });

    describe('handler isolation', () => {
        afterEach(() => {
            vi.useRealTimers();
        });

        it('still rejects mount() with the real error when the paymentError handler throws', async () => {
            vi.useFakeTimers();

            mockDisabledProduct();

            const component = session.clickToPay(paymentContextWithAmount).config(CONFIG);

            component.on('paymentError', () => {
                throw new Error('merchant handler bug');
            });

            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            const rejection = await component.mount(CONTAINER_ID).catch((error) => error);

            expect(rejection).toBeInstanceOf(ConfigurationError);
            expect(rejection.message).toBe('Click to Pay is not available for this session.');
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Click to Pay: a registered event handler threw an error.',
                expect.objectContaining({ message: 'merchant handler bug' }),
            );
        });
    });

    describe('mount() / unmount() lifecycle', () => {
        it('mounts the real <click-to-pay> element, wired with the credentials the API returned', async () => {
            api = await session.clickToPay(paymentContextWithAmount).config(CONFIG).mount(CONTAINER_ID);

            const element = container.querySelector('click-to-pay') as (HTMLElement & Record<string, unknown>) | null;
            expect(element).not.toBeNull();
            expect(element!.tagName.toLowerCase()).toBe('click-to-pay');

            expect(element!.config).toMatchObject({
                mastercard: {
                    srcInitiatorId: apiParameters.mastercard!.srcInitiatorId,
                    srciDpaId: apiParameters.mastercard!.srciDpaId,
                    authenticationOptions: apiParameters.mastercard!.authenticationOptions,
                    dpaTransactionOptions: {
                        dpaLocale: 'en_US',
                        transactionAmount: { transactionAmount: 10, transactionCurrencyCode: 'EUR' },
                    },
                },
            });
            expect(element!.transactionamount).toEqual({ amount: '10.00', currencyCode: 'EUR' });
            expect(element!.getAttribute('locale')).toBe('en_US');
            expect(element!.getAttribute('sandbox')).toBe('true');
        });

        it('removes the element from the container on unmount()', async () => {
            api = await session.clickToPay(paymentContextWithAmount).config(CONFIG).mount(CONTAINER_ID);

            api.unmount();
            api = undefined;

            expect(container.querySelector('click-to-pay')).toBeNull();
        });
    });

    describe('processSavedCard() misuse guard', () => {
        it('maps calling processSavedCard() without hidePayButton configured to ClickToPayError', async () => {
            api = await session.clickToPay(paymentContextWithAmount).config(CONFIG).mount(CONTAINER_ID);

            const call = api.processSavedCard();

            await expect(call).rejects.toBeInstanceOf(ClickToPayError);
            await expect(call).rejects.toThrow(
                'Triggering of the pay button outside of the SDK only possible if `hidepaybutton` is set to true.',
            );
        });
    });

    describe('getComplianceResourceURLsForVisa()', () => {
        it('returns real compliance URLs for a supported country', async () => {
            api = await session.clickToPay(paymentContextWithAmount).config(CONFIG).mount(CONTAINER_ID);

            const urls = await api.getComplianceResourceURLsForVisa('US');

            expect(() => new URL(urls.termsAndConditionsUrl)).not.toThrow();
            expect(() => new URL(urls.privacyPolicyUrl)).not.toThrow();
        });

        it('maps an unsupported country to ClickToPayError', async () => {
            api = await session.clickToPay(paymentContextWithAmount).config(CONFIG).mount(CONTAINER_ID);

            const call = api.getComplianceResourceURLsForVisa('XX');

            await expect(call).rejects.toBeInstanceOf(ClickToPayError);
            await expect(call).rejects.toThrow('Country "XX" is not supported by Visa.');
        });
    });
});
