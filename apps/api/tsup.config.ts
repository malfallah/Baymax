import { defineConfig } from 'tsup';

export default defineConfig({
  entry: { index: 'src/index.ts', seed: 'src/seed/seed.ts' },
  format: 'esm',
  target: 'node20',
  outDir: 'build',
  clean: true,
  sourcemap: true,
  // The shared workspace package ships TypeScript source, so bundle it in.
  noExternal: ['@baymax/shared'],
});
