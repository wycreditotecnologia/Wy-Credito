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
    'plugin:jsx-a11y/recommended',
    'plugin:import/recommended',
    'prettier',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    // Ajustes para reducir fricción inicial
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
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