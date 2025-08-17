import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import { dts } from 'rollup-plugin-dts';
import packageJson from './package.json' assert { type: 'json' };

export default {
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
  ],
  plugins: [
    peerDepsExternal(),
    resolve({
      browser: true,
    }),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.lib.json',
      exclude: ['**/*.test.*', '**/*.stories.*', 'src/App.tsx', 'src/index.tsx', 'src/SpeechToText.tsx'],
    }),
  ],
  external: ['react', 'react-dom', 'pitchy'],
};