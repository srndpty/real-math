import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // ANALYZE=1 npm run build で dist/stats.html にバンドル構成を出力する
    ...(process.env.ANALYZE
      ? [visualizer({ filename: 'dist/stats.html', gzipSize: true })]
      : [])
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          'force-graph': ['react-force-graph-2d', 'd3-force'],
          i18n: ['i18next', 'react-i18next']
        }
      }
    }
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    css: true,
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      include: ['src/**'],
      // エントリポイントは E2E で検証する
      exclude: ['src/main.tsx', 'src/vite-env.d.ts'],
      reporter: ['text', 'html', 'lcov'],
      // 現状の実測値を下回らないための回帰防止ライン（向上したら引き上げる）
      thresholds: {
        statements: 68,
        branches: 75,
        functions: 40,
        lines: 68
      }
    }
  }
});
