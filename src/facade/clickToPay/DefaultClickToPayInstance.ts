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
    type ClickToPayManualCardEntryOptions,
    type ClickToPayComplianceResourceURLs,
    type ClickToPayManualCardDetails,
    type ClickToPayPaymentResult,
    ConfigurationError,
} from '../../domain';
import type { ClickToPayService } from '../../services/interfaces/ClickToPayService';
import type { ClickToPayInstance } from './interfaces/ClickToPayInstance';

export class DefaultClickToPayInstance implements ClickToPayInstance {
    private active = true;

    constructor(private readonly clickToPayService: ClickToPayService) {}

    processManualCardEntry(
        card: ClickToPayManualCardDetails,
        options?: ClickToPayManualCardEntryOptions,
    ): Promise<ClickToPayPaymentResult> {
        return this.withService((service) => service.processManualCardEntry(card, options));
    }

    processSavedCard(): Promise<void> {
        return this.withService((service) => service.processSavedCard());
    }

    displayClickToPayExplanationModal(): Promise<void> {
        return this.withService((service) => service.displayClickToPayExplanationModal());
    }

    getComplianceResourceURLsForVisa(country: string): Promise<ClickToPayComplianceResourceURLs> {
        return this.withService((service) => service.getComplianceResourceURLsForVisa(country));
    }

    getComplianceResourceURLsForMastercard(): Promise<ClickToPayComplianceResourceURLs> {
        return this.withService((service) => service.getComplianceResourceURLsForMastercard());
    }

    unmount(): void {
        const service = this.requireActive();

        this.active = false;
        service.unmount();
    }

    private requireActive(): ClickToPayService {
        if (!this.active) {
            throw new ConfigurationError('Click to Pay component has been unmounted.');
        }

        return this.clickToPayService;
    }

    private async withService<T>(operation: (service: ClickToPayService) => T | Promise<T>): Promise<T> {
        if (!this.active) {
            return Promise.reject(new ConfigurationError('Click to Pay component has been unmounted.'));
        }

        return operation(this.clickToPayService);
    }
}
