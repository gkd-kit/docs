import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['./src/index.ts', './src/cli.ts'],
  format: 'esm',
  platform: 'node',
  target: 'esnext',
  fixedExtension: true,
  sourcemap: true,
  dts: { sourcemap: false },
  deps: { neverBundle: ['@gkd-kit/api', 'json5'] },
});
