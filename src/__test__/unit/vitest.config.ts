/// <reference types="vitest" />

import { defineConfig } from 'vitest/config';

/**
 * @see https://vitest.dev/config/
 */
export default defineConfig({
    test: {
        include: ['src/__test__/unit/**/*.test.ts'], // Relative to the project root
        environment: 'happy-dom',
        // Only set reporters if not provided via CLI (e.g., by IDE)
        ...(process.env.CI && {
            reporters: ['junit'],
            outputFile: 'test-results/.unit-test-results.xml',
        }),
    },
});
