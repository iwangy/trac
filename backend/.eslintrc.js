module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true
  },
  extends: [
    'eslint:recommended',
    'prettier'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    'no-console': 'warn',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-process-exit': 'error',
    'no-throw-literal': 'error',
    'no-return-await': 'error',
    'object-curly-spacing': ['error', 'always'],
    'prefer-const': 'error',
    'eqeqeq': ['error', 'always']
  }
}; 