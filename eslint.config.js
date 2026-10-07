const reactNative = require('@react-native/eslint-config/flat');

module.exports = [
  {ignores: ['.upgrade-check/**', 'android/**', 'ios/**', 'coverage/**']},
  // Barmej uses TypeScript. The preset's legacy Flow rules require ESLint 8.
  ...reactNative.map(config => ({
    ...config,
    rules: Object.fromEntries(
      Object.entries(config.rules ?? {}).filter(
        ([rule]) => !rule.startsWith('ft-flow/'),
      ),
    ),
  })),
  {
    // `void promise` explicitly marks intentionally unawaited UI work.
    rules: {'no-void': ['error', {allowAsStatement: true}]},
  },
  {
    files: ['jest.setup.js', '**/*.test.js', '**/*.test.ts', '**/*.test.tsx'],
    languageOptions: {
      globals: {
        jest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
      },
    },
  },
];
