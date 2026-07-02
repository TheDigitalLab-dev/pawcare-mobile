// ESLint flat config (ESLint 9) — base oficial de Expo + desactivación de reglas
// que chocan con Prettier (el formato lo maneja Prettier, no ESLint).
const expoConfig = require('eslint-config-expo/flat');
const eslintConfigPrettier = require('eslint-config-prettier');

module.exports = [
  ...expoConfig,
  eslintConfigPrettier,
  {
    rules: {
      // Higiene adicional para una base TypeScript estricta.
      'no-unused-vars': 'off', // lo cubre @typescript-eslint vía el preset de Expo
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  {
    ignores: [
      'node_modules/**',
      '.expo/**',
      'dist/**',
      'build/**',
      'coverage/**',
      'docs/**',
      'scripts/**',
      'babel.config.js',
      'metro.config.js',
    ],
  },
];
