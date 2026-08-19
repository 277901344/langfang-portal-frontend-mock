import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    const gatewayTarget = env.VITE_API_URL || 'http://172.16.0.104:18189';
    const rewriteTradingPrefix = env.VITE_API_PROXY_REWRITE_TRADING === 'true';

    return {
        base: './',
        plugins: [react(), tailwindcss()],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
        server: {
            port: 3000,
            proxy: {
                '/trading/': {
                    target: gatewayTarget,
                    changeOrigin: true,
                    rewrite: rewriteTradingPrefix
                        ? (requestPath) => requestPath.replace(/^\/trading/, '')
                        : undefined,
                },
                '/sp/': {
                    target: gatewayTarget,
                    changeOrigin: true,
                },
                '^/connector(?:-[^/]+)?/': {
                    target: gatewayTarget,
                    changeOrigin: true,
                },
                '/region/': {
                    target: gatewayTarget,
                    changeOrigin: true,
                },
            },
        },
    };
});
