/*
 * Do not remove or alter the notices in this preamble.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import type { ImportMetaEnv } from '../types/env';

export function getEnvVar<T extends keyof ImportMetaEnv>(key: T): NonNullable<ImportMetaEnv[T]> {
    const value = import.meta.env[key];
    if (!value) {
        throw new Error(`Missing environment variable '${key}'`);
    }

    return value;
}
