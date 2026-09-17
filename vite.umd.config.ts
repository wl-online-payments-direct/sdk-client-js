import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        outDir: 'dist',
        emptyOutDir: false,
        sourcemap: true,
        target: ['chrome74', 'edge79', 'firefox90', 'safari14.1'],
        lib: {
            entry: 'src/index.ts',
            name: 'onlinepaymentssdk',
            formats: ['umd'],
            fileName: () => 'onlinepayments-sdk-client-js.umd.js',
        },
    },
});
