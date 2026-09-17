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
    ClickToPayError,
    type ClickToPayEvent,
    type ClickToPayEventHandlers,
    ConfigurationError,
    InvalidArgumentError,
    SdkError,
} from '../../domain';
import type { ClickToPayService } from '../../services/interfaces/ClickToPayService';
import type { ClickToPayInstance } from './interfaces/ClickToPayInstance';
import type { ClickToPayComponentBuilder } from './interfaces/ClickToPayComponentBuilder';
import { Util } from '../../infrastructure/utils/Util';
import { TypedEventHandlers } from '../../infrastructure/utils/TypedEventHandlers';
import { DefaultClickToPayInstance } from './DefaultClickToPayInstance';

export class DefaultClickToPayComponentBuilder implements ClickToPayComponentBuilder {
    private readonly handlers = new TypedEventHandlers<ClickToPayEventHandlers>();
    private configuration: ClickToPayConfig = {};
    private mountStarted = false;

    constructor(private readonly loadClickToPayService: (config: ClickToPayConfig) => Promise<ClickToPayService>) {}

    config(config: ClickToPayConfig): this {
        this.requireNotMounted();
        this.configuration = config;

        return this;
    }

    on<E extends ClickToPayEvent>(event: E, handler: ClickToPayEventHandlers[E]): this {
        this.requireNotMounted();
        this.handlers.set(event, handler);

        return this;
    }

    async mount(containerId: string): Promise<ClickToPayInstance> {
        this.requireNotMounted();

        const container = document.getElementById(containerId);

        if (!container) {
            const error = new InvalidArgumentError(`Click to Pay: no element found with id "${containerId}".`);

            this.emitError(error);

            throw error;
        }

        this.mountStarted = true;

        try {
            const service = await this.loadClickToPayService(this.configuration);

            this.registerHandlers(service);
            await service.mount(container);

            return new DefaultClickToPayInstance(service);
        } catch (error) {
            this.mountStarted = false;
            this.emitError(error);

            throw error;
        }
    }

    private requireNotMounted(): void {
        if (this.mountStarted) {
            throw new ConfigurationError('Click to Pay configuration cannot be changed after mounting has started.');
        }
    }

    private registerHandlers(service: ClickToPayService): void {
        this.handlers.forEach((event, handler) => service.on(event, handler));
    }

    private emitError(error: unknown): void {
        const handler = this.handlers.get('paymentError');

        if (handler) {
            const sdkError =
                error instanceof SdkError
                    ? error
                    : new ClickToPayError(error instanceof Error ? error.message : String(error));

            Util.invokeSafely(() => handler(sdkError), 'Click to Pay');
        }
    }
}
