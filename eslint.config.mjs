import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ['**/*.{js,jsx,mjs,ts,tsx,mts,cts}'],
    rules: {
      // a leading underscore marks a parameter or value that is unused on purpose
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      // the only images are the SVG logo and generated QR codes, which
      // next/image can't improve
      '@next/next/no-img-element': 'off',
      // Existing effects reset state when their input changes. They work;
      // rewriting them is a separate job, so this is a warning for now.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
  {
    // mocks in tests are cast loosely
    files: ['**/__tests__/**', '**/*.test.{ts,tsx}'],
    rules: { '@typescript-eslint/no-explicit-any': 'off' },
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'coverage/**', 'next-env.d.ts']),
]);
