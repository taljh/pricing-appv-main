module.exports = [
  {
    languageOptions: {
      globals: {
        browser: true,
        es2021: true,
      },
      ecmaVersion: 12,
      sourceType: 'module',
    },
    plugins: {
      react: require('eslint-plugin-react'),
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
];
