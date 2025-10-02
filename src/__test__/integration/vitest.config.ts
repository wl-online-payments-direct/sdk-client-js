/// <reference types="vitest" />

import { defineConfig } from 'vitest/config';
import { join } from 'path';

/**
 * @see https://vitest.dev/config/
 */
export default defineConfig({
    server: {
        proxy: {
            'payment.preprod.direct.ingenico.com': {
                target: 'https://payment.preprod.direct.ingenico.com',
                changeOrigin: true, // Changes the origin header to match the target
                secure: true, // Use HTTPS
                //rewrite: (path) => path.replace(/^\/api/, ''), // Remove /api prefix
                configure: (proxy) => {
                    // Optional: Add custom headers or logging
                    proxy.on('proxyReq', (_proxyReq, req) => {
                        console.log('Proxying request:', req.url);
                    });
                },
            },
        },
    },
    test: {
        include: ['src/__test__/integration/**/*.test.ts'], // Relative to the project root
        environment: 'happy-dom',
        reporters: [process.env.CI ? 'junit' : 'verbose'],
        outputFile: 'test-results/.integration-test-results.xml',
        setupFiles: ['dotenv/config', join(__dirname, 'setup')],
        globals: true,
        restoreMocks: true,
        testTimeout: 10000,
    },
});
