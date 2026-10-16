import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['./src/index.ts'],
  format: 'esm',
  platform: 'node',
  target: 'esnext',
  fixedExtension: true,
  sourcemap: true,
  dts: { sourcemap: false },
  deps: { neverBundle: ['@gkd-kit/api'] },
});
