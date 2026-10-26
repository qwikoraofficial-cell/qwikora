export const SITE_ENVS = ['development', 'preview', 'production'] as const;

export type SiteEnv = (typeof SITE_ENVS)[number];

export interface SiteEnvInput {
  readonly env: Readonly<Record<string, string | undefined>>;
  readonly lifecycleEvent: string | undefined;
  readonly argv: readonly string[];
}

const BUILD_SCRIPTS: readonly string[] = ['build', 'build:preview', 'build:production'];

// A script that names its environment must run with exactly that SITE_ENV.
const EXPECTED_BY_SCRIPT: Readonly<Record<string, SiteEnv>> = {
  'build:preview': 'preview',
  'build:production': 'production',
};

function isSiteEnv(value: string): value is SiteEnv {
  return (SITE_ENVS as readonly string[]).includes(value);
}

// argv catches direct calls (`npx astro build`); the npm lifecycle event catches npm scripts.
export function isBuildInvocation(input: Pick<SiteEnvInput, 'argv' | 'lifecycleEvent'>): boolean {
  if (input.argv.includes('build')) {
    return true;
  }
  return input.lifecycleEvent !== undefined && BUILD_SCRIPTS.includes(input.lifecycleEvent);
}

// B13: SITE_ENV is mandatory for every build and has no silent default.
export function resolveSiteEnv(input: SiteEnvInput): SiteEnv | undefined {
  const raw = input.env['SITE_ENV'];
  const allowed = SITE_ENVS.join(', ');

  if (raw === undefined || raw === '') {
    if (isBuildInvocation(input)) {
      throw new Error(`SITE_ENV is required for builds. Allowed values: ${allowed}.`);
    }
    return undefined;
  }
  if (!isSiteEnv(raw)) {
    throw new Error(`SITE_ENV="${raw}" is invalid. Allowed values: ${allowed}.`);
  }

  const event = input.lifecycleEvent;
  const expected = event === undefined ? undefined : EXPECTED_BY_SCRIPT[event];
  if (event !== undefined && expected !== undefined && expected !== raw) {
    throw new Error(
      `SITE_ENV="${raw}" does not match "npm run ${event}" (expected "${expected}"). ` +
        'An inherited SITE_ENV overrides --env-file; unset it and retry.',
    );
  }
  return raw;
}
