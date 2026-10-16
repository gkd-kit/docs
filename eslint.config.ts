import eslint from '@eslint/js';
import tsEslint from 'typescript-eslint';
import unusedImports from 'eslint-plugin-unused-imports';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import { globalIgnores } from 'eslint/config';

export default tsEslint.config(
  eslint.configs.recommended,
  ...tsEslint.configs.recommended,
  {
    plugins: {
      'unused-imports': unusedImports,
    },
  },
  {
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': 'error',
    },
  },
  globalIgnores([
    '**/dist/**',
    'gkd-docs/.vitepress/cache/**',
    'gkd-api/.cache/**',
  ]),
  prettierRecommended,
);
