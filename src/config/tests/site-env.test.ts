import { describe, expect, it } from 'vitest';
import {
  isBuildInvocation,
  resolveSiteEnv,
  SITE_ENVS,
  type SiteEnvInput,
} from '../src/config/site-env.ts';

function input(overrides: Partial<SiteEnvInput>): SiteEnvInput {
  return { env: {}, lifecycleEvent: undefined, argv: [], ...overrides };
}

describe('SITE_ENVS', () => {
  it('lists exactly the three allowed environments (B13)', () => {
    expect([...SITE_ENVS]).toEqual(['development', 'preview', 'production']);
  });
});

describe('isBuildInvocation', () => {
  it('detects a direct `astro build` through argv', () => {
    expect(isBuildInvocation(input({ argv: ['node', 'astro.js', 'build'] }))).toBe(true);
  });

  it('detects every build npm script through the lifecycle event', () => {
    for (const event of ['build', 'build:preview', 'build:production']) {
      expect(isBuildInvocation(input({ lifecycleEvent: event }))).toBe(true);
    }
  });

  it('ignores other commands and a missing lifecycle event', () => {
    expect(isBuildInvocation(input({ lifecycleEvent: 'check', argv: ['astro', 'check'] }))).toBe(
      false,
    );
    expect(isBuildInvocation(input({}))).toBe(false);
  });
});

describe('resolveSiteEnv', () => {
  it('fails a build when SITE_ENV is missing or empty, however the build starts', () => {
    expect(() => resolveSiteEnv(input({ argv: ['astro', 'build'] }))).toThrow(/required/u);
    expect(() => resolveSiteEnv(input({ lifecycleEvent: 'build' }))).toThrow(/required/u);
    expect(() =>
      resolveSiteEnv(input({ lifecycleEvent: 'build:preview', env: { SITE_ENV: '' } })),
    ).toThrow(/required/u);
  });

  it('allows a missing SITE_ENV outside builds', () => {
    expect(resolveSiteEnv(input({ lifecycleEvent: 'check' }))).toBeUndefined();
    expect(resolveSiteEnv(input({}))).toBeUndefined();
  });

  it('rejects an unknown value in every context', () => {
    expect(() => resolveSiteEnv(input({ env: { SITE_ENV: 'staging' } }))).toThrow(/invalid/u);
    expect(() =>
      resolveSiteEnv(input({ lifecycleEvent: 'build', env: { SITE_ENV: 'Preview' } })),
    ).toThrow(/invalid/u);
  });

  it('accepts any valid value for the generic build script', () => {
    for (const value of SITE_ENVS) {
      expect(resolveSiteEnv(input({ lifecycleEvent: 'build', env: { SITE_ENV: value } }))).toBe(
        value,
      );
    }
  });

  it('requires build:preview and build:production to match their own environment', () => {
    expect(
      resolveSiteEnv(input({ lifecycleEvent: 'build:preview', env: { SITE_ENV: 'preview' } })),
    ).toBe('preview');
    expect(
      resolveSiteEnv(
        input({ lifecycleEvent: 'build:production', env: { SITE_ENV: 'production' } }),
      ),
    ).toBe('production');
    expect(() =>
      resolveSiteEnv(input({ lifecycleEvent: 'build:preview', env: { SITE_ENV: 'production' } })),
    ).toThrow(/does not match/u);
    expect(() =>
      resolveSiteEnv(input({ lifecycleEvent: 'build:production', env: { SITE_ENV: 'preview' } })),
    ).toThrow(/does not match/u);
  });

  it('does not apply script expectations to unrelated commands', () => {
    expect(resolveSiteEnv(input({ lifecycleEvent: 'ci', env: { SITE_ENV: 'preview' } }))).toBe(
      'preview',
    );
    expect(resolveSiteEnv(input({ env: { SITE_ENV: 'development' } }))).toBe('development');
  });
});
