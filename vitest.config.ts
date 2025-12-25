// vitest.config.ts or vite.config.ts
import { defineConfig } from 'vitest/config';
import { join } from 'path';

export default defineConfig({
    test: {
        coverage: {
            //enabled: true,
            provider: 'v8',
            reporter: ['text', 'html', 'lcov', 'json'],
            include: ['src/**/*.ts'],
            exclude: [
                'src/types/**',
                'src/infrastructure/interfaces/**',
                'src/services/interfaces/**',
                'src/**/index.ts',
            ],
            reportsDirectory: './coverage',
            thresholds: {
                lines: 95,
                functions: 95,
                branches: 80,
                statements: 95,
            },
        },
        projects: [
            {
                test: {
                    name: { label: 'unit' },
                    include: ['tests/unit/**/*.test.ts'],
                    environment: 'happy-dom',
                },
            },
            {
                server: {
                    proxy: {
                        'payment.preprod.direct.ingenico.com': {
                            target: 'https://payment.preprod.direct.ingenico.com',
                            changeOrigin: true, // Changes the origin header to match the target
                            secure: true, // Use HTTPS
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
                    name: { label: 'integration' },
                    include: ['tests/integration/**/*.test.ts'],
                    environment: 'happy-dom',
                    environmentOptions: {
                        happyDOM: {
                            url: 'https://localhost:3000',
                        },
                    },
                    setupFiles: ['dotenv/config', join(__dirname, 'tests/integration/setup')],
                    globals: true,
                    restoreMocks: true,
                    testTimeout: 10000,
                },
            },
        ],
    },
});
