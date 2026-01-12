import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      fieldwise: path.resolve(__dirname, '../src/index.ts')
    }
  },
  build: {
    outDir: 'dist'
  }
});
