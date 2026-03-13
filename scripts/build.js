import * as esbuild from 'esbuild';
import { builtinModules } from 'node:module';

const isDev = process.env.NODE_ENV === 'development';

const config = {
  entryPoints: ['bin/cli.ts'],
  outfile: 'dist/bin/cli.bundle.js',
  bundle: true,
  minify: !isDev,
  platform: 'node',
  format: 'esm',
  target: 'node20',
  sourcemap: true,
  external: [
    ...builtinModules,
    'better-sqlite3',
    'node-llama-cpp',
    'sharp', 
    '@xenova/transformers', 
    'onnxruntime-node',
    'onnxruntime-web',
    './aizen.js' // Exclude the WASM glue code
  ],
  banner: {
    js: '#!/usr/bin/env node\n',
  },
};

esbuild.build(config).catch(() => process.exit(1));
