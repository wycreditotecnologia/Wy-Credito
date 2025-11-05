module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      rules: {
        // Delegar a TS
        'no-undef': 'off',
        '@typescript-eslint/no-unused-vars': 'warn',
      },
    },
  ],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    // Ajustes para reducir fricción inicial
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/no-unescaped-entities': 'warn',
    'no-unused-vars': 'warn',
    'no-console': 'warn',
    'import/no-unresolved': 'off',
    'no-useless-escape': 'warn',
    'no-empty': 'warn',
    'no-undef': 'warn',
    'no-redeclare': 'warn',
    'no-unreachable': 'warn',
    'no-case-declarations': 'warn',
    'no-irregular-whitespace': 'warn',
    'no-mixed-spaces-and-tabs': 'warn',
    'no-empty-pattern': 'warn',
  },
  ignorePatterns: ['dist/', 'node_modules/', 'vercel.json'],
};