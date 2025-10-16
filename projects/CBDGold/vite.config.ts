import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// Conditional polyfills: only include in dev to reduce bundle size & avoid eval warnings in prod
export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';
  return {
    plugins: [
      react(),
      isDev && nodePolyfills({ globals: { Buffer: true } })
    ].filter(Boolean),
    optimizeDeps: {
      include: ['@walletconnect/sign-client', '@walletconnect/core', '@walletconnect/modal', '@perawallet/connect']
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom'],
            algosdk: ['algosdk'],
            wallet: ['@txnlab/use-wallet', '@txnlab/use-wallet-react'],
            ui: ['notistack', 'lucide-react', 'feather-icons']
          }
        }
      }
    }
  };
});

