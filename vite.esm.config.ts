import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        sourcemap: true,
        target: ['chrome74', 'edge79', 'firefox90', 'safari14.1'],
        lib: {
            entry: 'src/index.ts',
        },
        rolldownOptions: {
            output: [
                { format: 'es', entryFileNames: 'onlinepayments-sdk-client-js.js' },
                { format: 'es', entryFileNames: 'onlinepayments-sdk-client-js.module.js' },
            ],
        },
    },
});
