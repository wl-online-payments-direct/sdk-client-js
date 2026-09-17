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

import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';
import { CLICK_TO_PAY_LOCALES } from '../../../../src';

describe('CLICK_TO_PAY_LOCALES', () => {
    const readProviderLocales = (): string[] => {
        const require = createRequire(import.meta.url);
        const declarations = readFileSync(require.resolve('@netceterapx/click-to-pay-sdk/index.d.ts'), 'utf8');
        const enumBody = /export declare enum LANG \{([\s\S]*?)\n}/.exec(declarations)?.[1];

        expect(enumBody, 'could not locate the provider LANG declaration').toBeDefined();

        return [...enumBody!.matchAll(/^\s{4}([a-z]{2}_[A-Z]{2}) = /gm)].map((match) => match[1]!);
    };

    it('matches the locales the provider declares as supported', () => {
        const providerLocales = readProviderLocales();

        expect(providerLocales.length).toBeGreaterThan(0);
        expect([...CLICK_TO_PAY_LOCALES].sort()).toEqual([...providerLocales].sort());
    });

    it('contains no duplicates', () => {
        expect(new Set(CLICK_TO_PAY_LOCALES).size).toBe(CLICK_TO_PAY_LOCALES.length);
    });
});
