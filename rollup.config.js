import ts from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import cleanup from 'rollup-plugin-cleanup';
import copy from 'rollup-plugin-copy';

import pkg from './package.json';

const banner = `
/**
 * ${pkg.name} v${pkg.version}
 * (c) ${new Date().getFullYear()} Florian "Fy" Gasquez
 * Released under the MIT License
 */
`;

function createEntry(options) {
  const { format, input } = options;

  const config = {
    input,
    external: ['vue', '@vue/compiler-dom'],
    plugins: [
      replace({
        values: {
          'process.env.NODE_ENV': 'true',
        },
        preventAssignment: true,
      }),
      resolve(),
      commonjs(),
      json(),
      ts({
        tsconfig: 'tsconfig.json',
      }),
      copy({
        targets: [
          {
            src: 'package.json',
            dest: 'dist/',
            rename: 'package.json',
            transform: (contents, filename) => {
              let _contents = contents
                .toString()
                .replaceAll('dist/dist', 'dist');
              _contents = _contents
                .toString()
                .replaceAll(
                  /"devDependencies": {([\S\s]+)}/gm,
                  '"devDependencies": {}\n}'
                );
              _contents = _contents
                .toString()
                .replaceAll(/"scripts": {([\S\s]+)}/gm, '"scripts": {}\n}');
              return _contents;
            },
          },
          { src: 'README.md', dest: 'dist/', rename: 'README.md' },
        ],
      }),
      cleanup(),
    ],
    output: {
      banner,
      name: 'fyhead',
      file: 'dist/fyhead.js',
      format,
      globals: {
        vue: 'Vue',
        '@vue/compiler-dom': 'VueCompilerDOM',
      },
    },
  };

  if (format === 'es') {
    config.output.file = 'dist/dist/fyhead.mjs';
  }
  if (format === 'cjs') {
    config.output.file = 'dist/dist/fyhead.js';
  }
  console.log(`Building ${format}: ${config.output.file}`);

  return config;
}

export default [
  createEntry({ format: 'es', input: 'src/index.ts' }),
  createEntry({ format: 'cjs', input: 'src/index.ts' }),
];
