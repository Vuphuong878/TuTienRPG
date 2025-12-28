// Fix: Add reference to node types to resolve 'process' object type issue.
/// <reference types="node" />

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  // FIX: Removed `(process as any)` cast, relying on the node types reference.
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      // Polyfill process.env.API_KEY for the browser
      // Ensure it's always a string to prevent syntax errors
      'process.env.API_KEY': JSON.stringify(env.API_KEY || ''),
    },
  };
});
