/// <reference types="vitest" />

import { defineConfig } from 'vitest/config';

/**
 * @see https://vitest.dev/config/
 */
export default defineConfig({
    test: {
        include: ['src/__test__/unit/**/*.test.ts'], // Relative to the project root
        environment: 'happy-dom',
        reporters: [process.env.CI ? 'junit' : 'verbose'],
        outputFile: 'test-results/.unit-test-results.xml',
    },
});
