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

export class TypedEventHandlers<EventMap extends Record<keyof EventMap, (...args: never[]) => void>> {
    private readonly handlers: Partial<EventMap> = {};

    set<E extends keyof EventMap>(event: E, handler: EventMap[E]): void {
        this.handlers[event] = handler;
    }

    get<E extends keyof EventMap>(event: E): EventMap[E] | undefined {
        return this.handlers[event];
    }

    forEach(callback: <E extends keyof EventMap>(event: E, handler: EventMap[E]) => void): void {
        (Object.keys(this.handlers) as (keyof EventMap)[]).forEach((event) => {
            const handler = this.handlers[event];

            if (handler) {
                (callback as (event: keyof EventMap, handler: EventMap[keyof EventMap]) => void)(event, handler);
            }
        });
    }
}
