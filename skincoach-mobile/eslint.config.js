// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = defineConfig([
  expoConfig,
  eslintPluginPrettierRecommended,
  {
    ignores: ['dist/*', 'node_modules/*', '.expo/*'],
  },
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      // docs/18 Claude Development Rules: component <=250 lines, file <=400 lines, function <=40 lines
      'max-lines': ['warn', { max: 400, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': [
        'warn',
        { max: 40, skipBlankLines: true, skipComments: true },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      // react-native-reanimated's shared values (useSharedValue().value = x) are a
      // documented, intentional UI-thread mutation API — this React Compiler-era
      // rule doesn't know about that escape hatch and flags every shared-value
      // assignment as an immutability violation. Reanimated is core to this app's
      // animation stack (docs/03), so this rule is unusable here.
      'react-hooks/immutability': 'off',
    },
  },
]);
