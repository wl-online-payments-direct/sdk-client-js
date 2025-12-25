import type { ImportMetaEnv } from '../types/env';

export function getEnvVar<T extends keyof ImportMetaEnv>(key: T): NonNullable<ImportMetaEnv[T]> {
    const value = import.meta.env[key];
    if (!value) {
        throw new Error(`Missing environment variable '${key}'`);
    }

    return value;
}
