import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import { resolveSiteEnv } from './src/config/site-env.ts';

// B13: fails the build when SITE_ENV is missing, invalid or contradicts the npm script.
resolveSiteEnv({
  env: process.env,
  lifecycleEvent: process.env['npm_lifecycle_event'],
  argv: process.argv,
});

export default defineConfig({
  output: 'static',
  trailingSlash: 'always',
  compressHTML: true,
  build: {
    format: 'directory',
    inlineStylesheets: 'never',
  },
  devToolbar: {
    enabled: false,
  },
  integrations: [],
  vite: {
    plugins: [tailwindcss()],
  },
});
