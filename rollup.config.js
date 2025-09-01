import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { dts } from 'rollup-plugin-dts';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import packageJson from './package.json' with { type: 'json' };

export default [
  {
    input: 'src/lib/index.ts',
    output: [
      {
        file: packageJson.main,
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: packageJson.module,
        format: 'esm',
        sourcemap: true,
      },
      {
        file: 'dist/index.umd.js',
        format: 'umd',
        name: 'ReactSpeechToTextGK',
        sourcemap: true,
        globals: {
          'react': 'React',
          'react-dom': 'ReactDOM'
        },
      },
    ],
    plugins: [
      peerDepsExternal(),
      resolve({
        browser: true,
        preferBuiltins: false,
      }),
      commonjs({
        include: ['node_modules/**'],
        transformMixedEsModules: true,
      }),
      typescript({
        tsconfig: './tsconfig.lib.json',
        exclude: ['**/*.test.*', '**/*.stories.*', 'src/App.tsx', 'src/index.tsx', 'src/SpeechToText.tsx'],
      }),
    ],
    external: ['react', 'react-dom'],
  },
  {
    input: 'dist/lib/index.d.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'esm',
    },
    plugins: [dts()],
  },
];