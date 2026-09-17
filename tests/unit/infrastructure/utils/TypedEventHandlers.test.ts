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

import { describe, expect, it, vi } from 'vitest';
import { TypedEventHandlers } from '../../../../src/infrastructure/utils/TypedEventHandlers';

type TestEventMap = {
    foo: (value: string) => void;
    bar: (value: number) => void;
};

describe('TypedEventHandlers', () => {
    describe('set()/get()', () => {
        it('should return the handler that was set for that event', () => {
            const handlers = new TypedEventHandlers<TestEventMap>();
            const handler = vi.fn();

            handlers.set('foo', handler);

            expect(handlers.get('foo')).toBe(handler);
        });

        it('should return undefined for an event that was never set', () => {
            const handlers = new TypedEventHandlers<TestEventMap>();

            expect(handlers.get('foo')).toBeUndefined();
        });

        it('should overwrite the previous handler when set is called twice for the same event', () => {
            const handlers = new TypedEventHandlers<TestEventMap>();
            const firstHandler = vi.fn();
            const secondHandler = vi.fn();

            handlers.set('foo', firstHandler);
            handlers.set('foo', secondHandler);

            expect(handlers.get('foo')).toBe(secondHandler);
        });

        it('should keep handlers for different events independent', () => {
            const handlers = new TypedEventHandlers<TestEventMap>();
            const fooHandler = vi.fn();
            const barHandler = vi.fn();

            handlers.set('foo', fooHandler);
            handlers.set('bar', barHandler);

            expect(handlers.get('foo')).toBe(fooHandler);
            expect(handlers.get('bar')).toBe(barHandler);
        });
    });

    describe('forEach()', () => {
        it('should not invoke the callback when no handlers are registered', () => {
            const handlers = new TypedEventHandlers<TestEventMap>();
            const callback = vi.fn();

            handlers.forEach(callback);

            expect(callback).not.toHaveBeenCalled();
        });

        it('should invoke the callback once per registered event with the correct event/handler pair', () => {
            const handlers = new TypedEventHandlers<TestEventMap>();
            const fooHandler = vi.fn();
            const barHandler = vi.fn();

            handlers.set('foo', fooHandler);
            handlers.set('bar', barHandler);

            const seen: Array<[string, unknown]> = [];
            handlers.forEach((event, handler) => seen.push([event as string, handler]));

            expect(seen).toHaveLength(2);
            expect(seen).toContainEqual(['foo', fooHandler]);
            expect(seen).toContainEqual(['bar', barHandler]);
        });

        it('should only invoke the callback for events that were actually set', () => {
            const handlers = new TypedEventHandlers<TestEventMap>();
            const fooHandler = vi.fn();

            handlers.set('foo', fooHandler);

            const callback = vi.fn();
            handlers.forEach(callback);

            expect(callback).toHaveBeenCalledTimes(1);
            expect(callback).toHaveBeenCalledWith('foo', fooHandler);
        });
    });
});
