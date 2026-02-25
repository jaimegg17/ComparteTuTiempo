const { FlatCompat } = require('@eslint/eslintrc');
const { configs: jsConfigs } = require('@eslint/js');

const { name: _unused, ...recommendedConfig } = jsConfigs.recommended;

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig,
});

module.exports = [
  {
    ignores: ['node_modules/**', 'dist/**'],
  },
  recommendedConfig,
  ...compat.config({
    extends: ['plugin:@typescript-eslint/recommended', 'prettier'],
  }),
  {
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
    settings: {
      node: true,
    },
  },
];
