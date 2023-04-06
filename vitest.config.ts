/// <reference types="vitest" />

import { defineConfig } from 'vitest/config';

/**
 * @see https://vitest.dev/config/
 */
export default defineConfig({
  test: {
    include: ['src/__test__/unit/**/*.test.ts'],
    environment: 'happy-dom',
    reporters: [process.env.CI ? 'junit' : 'verbose'],
    outputFile: 'test-results/.test-results.xml',
  },
});
