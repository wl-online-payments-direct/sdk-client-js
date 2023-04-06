/// <reference types="vitest" />

import { defineConfig } from 'vitest/config';
import { join } from 'path';

/**
 * @see https://vitest.dev/config/
 */
export default defineConfig({
  test: {
    include: [join(__dirname, '**/*.test.ts')],
    environment: 'happy-dom',
    reporters: [process.env.CI ? 'junit' : 'verbose'],
    outputFile: 'test-results/.unit-test-results.xml',
  },
});
