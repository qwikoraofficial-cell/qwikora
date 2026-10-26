import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import astro from 'eslint-plugin-astro';
import tseslint from 'typescript-eslint';

// NO-EGRESS: the rules in the `src/**` block below are a FIRST-LINE, BEST-EFFORT guard only.
// They are NOT a security boundary. Known bypasses include aliasing (`const g = globalThis`),
// `Reflect.get(globalThis, 'fetch')`, dynamic `import()` of remote URLs, `new Worker(url)`,
// <script>/<img>/<link> URLs, CSS `url()`, form posts and navigation. Workers are deliberately
// not banned because later phases need local ones. Authoritative enforcement is the Playwright
// no-egress test plus the CSP and Service Worker checks, tracked as official item P1.3
// (see docs/P1.1-RUNBOOK.md).
const NETWORK_MESSAGE = 'Network APIs are forbidden in src/** (no-egress policy, first-line).';
const NETWORK_GLOBALS = ['fetch', 'XMLHttpRequest', 'WebSocket', 'EventSource', 'WebTransport'];
const GLOBAL_OBJECTS = ['window', 'globalThis', 'self'];

// eslint-plugin-astro is ESM-only; its README documents `configs.recommended` as the flat
// config. The `flat/recommended` alias is preferred when it exists.
const astroRecommended = astro.configs['flat/recommended'] ?? astro.configs.recommended;
if (!Array.isArray(astroRecommended)) {
  throw new TypeError('eslint-plugin-astro: no flat recommended config (array) was found.');
}

export default defineConfig([
  globalIgnores(['.astro/', 'coverage/', 'dist/', 'node_modules/', 'reports/']),
  js.configs.recommended,
  tseslint.configs.strictTypeChecked,
  astroRecommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json', './tsconfig.scripts.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['**/*.js', '**/*.mjs', '**/*.astro', '**/*.astro/**'],
    extends: [tseslint.configs.disableTypeChecked],
  },
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      globals: { process: 'readonly' },
    },
  },
  {
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                'react',
                'react/*',
                'react-dom',
                'react-dom/*',
                '@astrojs/react',
                '@types/react',
                '@types/react-dom',
              ],
              message: 'React is forbidden (B4).',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/**'],
    rules: {
      'no-restricted-globals': [
        'error',
        ...NETWORK_GLOBALS.map((name) => ({ name, message: NETWORK_MESSAGE })),
      ],
      'no-restricted-properties': [
        'error',
        { object: 'navigator', property: 'sendBeacon', message: NETWORK_MESSAGE },
        ...GLOBAL_OBJECTS.flatMap((object) =>
          NETWORK_GLOBALS.map((property) => ({ object, property, message: NETWORK_MESSAGE })),
        ),
      ],
    },
  },
]);
