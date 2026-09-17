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

import type { ClickToPayService } from '../../services/interfaces/ClickToPayService';
import {
    type ClickToPayManualCardEntryOptions,
    type ClickToPayComplianceResourceURLs,
    type ClickToPayConfig,
    type ClickToPayEvent,
    type ClickToPayEventHandlers,
    type ClickToPayManualCardDetails,
    type ClickToPayPaymentResult,
    ConfigurationError,
    type PaymentContextWithAmount,
    type PaymentProduct5002SpecificData,
    SdkError,
} from '../../domain';
import type {
    NetceteraCardSelectionEvent,
    NetceteraCheckoutError,
    NetceteraCheckoutResult,
    NetceteraCustomerStatusEvent,
    NetceteraElement,
    NetceteraPaymentError,
} from './NetceteraTypes';
import { buildNetceteraConfig } from './NetceteraConfigBuilder';
import {
    mapCardSelection,
    mapCustomerStatus,
    mapManualCardDetails,
    mapNetceteraCallError,
    mapNetceteraError,
    mapPaymentResult,
} from './NetceteraEventMapper';
import { formatNetceteraTransactionAmount } from './NetceteraAmountFormatter';
import { Util } from '../utils/Util';
import { TypedEventHandlers } from '../utils/TypedEventHandlers';

export class NetceteraClickToPayService implements ClickToPayService {
    private element: NetceteraElement | null = null;
    private readonly handlers = new TypedEventHandlers<ClickToPayEventHandlers>();

    constructor(
        private readonly specificData: PaymentProduct5002SpecificData,
        private readonly context: PaymentContextWithAmount,
        private readonly config: ClickToPayConfig,
        private readonly loadSdk: () => Promise<void> = () =>
            import('@netceterapx/click-to-pay-sdk').then(() => undefined),
    ) {}

    on<E extends ClickToPayEvent>(event: E, handler: ClickToPayEventHandlers[E]): ClickToPayService {
        this.handlers.set(event, handler);

        return this;
    }

    async mount(container: HTMLElement): Promise<void> {
        if (container.querySelector('click-to-pay')) {
            throw new ConfigurationError(
                `Click to Pay is already mounted in container "${container.id}". Call unmount() before mounting again.`,
            );
        }

        try {
            try {
                await this.loadSdk();
            } catch {
                throw new ConfigurationError('Failed to load Click to Pay SDK');
            }

            const element = this.createElement();

            this.registerEventListeners(element);
            this.element = element;
            container.appendChild(element);
        } catch (error) {
            this.resetState();

            throw error instanceof SdkError
                ? error
                : new ConfigurationError('Failed to initialize Click to Pay component');
        }
    }

    unmount(): void {
        this.element?.remove();
        this.resetState();
    }

    async processManualCardEntry(
        card: ClickToPayManualCardDetails,
        options?: ClickToPayManualCardEntryOptions,
    ): Promise<ClickToPayPaymentResult> {
        const element = this.getElement();

        try {
            const result = await element.checkout({
                card: mapManualCardDetails(card),
                ...(options?.profileDetails ? { profileDetails: options.profileDetails } : {}),
                ...(options?.complianceResourceURLs ? { complianceResourceURLs: options.complianceResourceURLs } : {}),
                ...(options?.skipVerificationNextTime != null
                    ? { skipVerificationNextTime: options.skipVerificationNextTime }
                    : {}),
                ...(options?.iframeRef ? { iframeRef: options.iframeRef } : {}),
            });

            return mapPaymentResult(result);
        } catch (error) {
            throw mapNetceteraCallError(error as NetceteraCheckoutError);
        }
    }

    processSavedCard(): void {
        const element = this.getElement();

        try {
            element.triggerPayButton();
        } catch (error) {
            throw mapNetceteraCallError(error as NetceteraCheckoutError);
        }
    }

    displayClickToPayExplanationModal(): void {
        const element = this.getElement();

        try {
            element.displayClickToPayExplanationModal();
        } catch (error) {
            throw mapNetceteraCallError(error as NetceteraCheckoutError);
        }
    }

    async getComplianceResourceURLsForVisa(country: string): Promise<ClickToPayComplianceResourceURLs> {
        const element = this.getElement();

        try {
            return await element.getComplianceResourceURLsForVisa(country);
        } catch (error) {
            throw mapNetceteraCallError(error as NetceteraCheckoutError);
        }
    }

    async getComplianceResourceURLsForMastercard(): Promise<ClickToPayComplianceResourceURLs> {
        const element = this.getElement();

        try {
            return await element.getComplianceResourceURLsForMastercard();
        } catch (error) {
            throw mapNetceteraCallError(error as NetceteraCheckoutError);
        }
    }

    private getElement(): NetceteraElement {
        if (!this.element) {
            throw new ConfigurationError('Click to Pay component is not mounted.');
        }

        return this.element;
    }

    private createElement(): NetceteraElement {
        const element = document.createElement('click-to-pay') as NetceteraElement;

        element.config = buildNetceteraConfig(this.specificData, this.context, this.config);

        if (this.config.locale) {
            element.setAttribute('locale', this.config.locale);
        }

        if (this.config.email) {
            element.setAttribute('email', this.config.email);
        }

        if (this.config.sandbox != null) {
            element.setAttribute('sandbox', String(this.config.sandbox));
        }

        if (this.config.hidePayButton) {
            element.setAttribute('hidepaybutton', 'true');
        }

        if (this.config.enablePerformanceMeasurement) {
            element.setAttribute('enableperformancemeasurement', 'true');
        }

        const { amount, currencyCode } = this.context.amountOfMoney;

        element.transactionamount = { amount: formatNetceteraTransactionAmount(amount, currencyCode), currencyCode };

        if (this.config.uiCustomizations) {
            element.uicustomizations = this.config.uiCustomizations;
        }

        return element;
    }

    private registerEventListeners(element: NetceteraElement): void {
        element.addEventListener('consumerStatus', (event: Event) => {
            Util.invokeSafely(() => {
                const status = mapCustomerStatus((event as CustomEvent<NetceteraCustomerStatusEvent>).detail);

                if (status.manualCardEntryMandatory) {
                    element.buttonstyle = 'OUTLINED';
                }

                this.dispatch('customerStatus', (handler) => handler(status));
            }, 'Click to Pay');
        });

        element.addEventListener('paymentSuccess', (event: Event) => {
            this.dispatch('paymentSuccess', (handler) =>
                handler(mapPaymentResult((event as CustomEvent<NetceteraCheckoutResult>).detail)),
            );
        });

        element.addEventListener('paymentError', (event: Event) => {
            this.dispatch('paymentError', (handler) =>
                handler(mapNetceteraError((event as CustomEvent<NetceteraPaymentError>).detail)),
            );
        });

        element.addEventListener('cardSelection', (event: Event) => {
            this.dispatch('cardSelection', (handler) =>
                handler(mapCardSelection((event as CustomEvent<NetceteraCardSelectionEvent>).detail)),
            );
        });

        element.addEventListener('generalEvents', (event: Event) => {
            const detail = (event as CustomEvent<string>).detail;

            this.dispatch('generalEvents', (handler) => handler(detail));
        });

        element.addEventListener('unbindConsumer', () => {
            this.dispatch('unbindCustomer', (handler) => handler());
        });
    }

    private resetState(): void {
        this.element = null;
    }

    private dispatch<E extends ClickToPayEvent>(event: E, invoke: (handler: ClickToPayEventHandlers[E]) => void): void {
        const handler = this.handlers.get(event);

        if (handler) {
            Util.invokeSafely(() => invoke(handler), 'Click to Pay');
        }
    }
}
