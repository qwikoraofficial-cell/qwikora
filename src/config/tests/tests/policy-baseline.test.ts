import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const repoRoot = new URL('../', import.meta.url);
const FORBIDDEN_PACKAGES: readonly string[] = ['react', 'react-dom'];
const EXACT_VERSION = /^\d+\.\d+\.\d+$/u;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}(?: |$)/u;
const NON_NPM_HEADING = 'Not npm packages';

// Explicit owner decision: the only permitted override (Astro 6 resolves Vite 7).
// Any other override, or a different range, must change this constant on purpose.
const ALLOWED_OVERRIDES: Readonly<Record<string, string>> = { vite: '^7.0.0' };

// B2: everything is a devDependency, so these sections must be absent or empty.
const EMPTY_SECTIONS = [
  'peerDependencies',
  'optionalDependencies',
  'bundleDependencies',
  'bundledDependencies',
];

interface Section {
  readonly level: number;
  readonly fields: Record<string, string>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readText(relativePath: string): string {
  return readFileSync(new URL(relativePath, repoRoot), 'utf8');
}

function readJson(relativePath: string): Record<string, unknown> {
  const parsed: unknown = JSON.parse(readText(relativePath));
  if (!isRecord(parsed)) {
    throw new TypeError(`${relativePath}: expected a JSON object`);
  }
  return parsed;
}

function readStringMap(value: unknown, label: string): Record<string, string> {
  if (!isRecord(value)) {
    throw new TypeError(`${label}: expected an object`);
  }
  const result: Record<string, string> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (typeof entry !== 'string') {
      throw new TypeError(`${label}.${key}: expected a string`);
    }
    result[key] = entry;
  }
  return result;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item: unknown) => typeof item === 'string');
}

function keysOf(value: unknown): string[] {
  return isRecord(value) ? Object.keys(value) : [];
}

function isEmptySection(value: unknown): boolean {
  if (value === undefined || value === false) {
    return true;
  }
  return Array.isArray(value) ? value.length === 0 : keysOf(value).length === 0 && isRecord(value);
}

function readAllowlist(): readonly string[] {
  const allowed = readJson('policy/deps-allowlist.json')['allowed'];
  if (!isStringArray(allowed)) {
    throw new TypeError('policy/deps-allowlist.json: "allowed" must be an array of strings');
  }
  return allowed;
}

function collectKeys(value: unknown): string[] {
  if (!isRecord(value)) {
    return [];
  }
  return Object.entries(value).flatMap(([key, nested]) => [key, ...collectKeys(nested)]);
}

// Reads docs/DEPENDENCIES.md as `## title` / `### title` sections with `- Key: value` bullets.
function parseSections(markdown: string): Map<string, Section> {
  const sections = new Map<string, Section>();
  let current: Section | undefined;
  for (const line of markdown.split(/\r?\n/u)) {
    const heading = /^(#{2,3}) (.+)$/u.exec(line);
    if (heading !== null) {
      current = { level: (heading[1] ?? '').length, fields: {} };
      sections.set(heading[2] ?? '', current);
    } else if (current !== undefined) {
      const field = /^- ([A-Za-z ]+): (.+)$/u.exec(line);
      const key = field?.[1];
      if (key !== undefined && !(key in current.fields)) {
        current.fields[key] = field?.[2] ?? '';
      }
    }
  }
  return sections;
}

describe('policy baseline (P1.1)', () => {
  const manifest = readJson('package.json');
  const devDependencies = readStringMap(manifest['devDependencies'], 'devDependencies');
  const sections = parseSections(readText('docs/DEPENDENCIES.md'));

  it('keeps dependencies completely empty (B2)', () => {
    expect(manifest['dependencies']).toEqual({});
  });

  it('keeps peer, optional and bundled dependency sections empty (B2)', () => {
    const populated = EMPTY_SECTIONS.filter((section) => !isEmptySection(manifest[section]));
    expect(populated).toEqual([]);
  });

  it('pins every devDependency to an exact version, no ^ or ~ (B1)', () => {
    expect(Object.keys(devDependencies).length).toBeGreaterThan(0);
    const unpinned = Object.entries(devDependencies)
      .filter(([, version]) => !EXACT_VERSION.test(version))
      .map(([name, version]) => `${name}@${version}`);
    expect(unpinned).toEqual([]);
  });

  it('allows only allowlisted devDependencies, and the allowlist has no duplicates', () => {
    const allowlist = readAllowlist();
    const allowed = new Set(allowlist);
    expect(allowed.size).toBe(allowlist.length);
    const unlisted = Object.keys(devDependencies).filter((name) => !allowed.has(name));
    expect(unlisted).toEqual([]);
  });

  it('restricts overrides to the single explicit owner decision', () => {
    expect(manifest['overrides']).toEqual(ALLOWED_OVERRIDES);
  });

  it('contains neither react nor react-dom anywhere (B4)', () => {
    const names = [
      ...['dependencies', 'devDependencies', ...EMPTY_SECTIONS].flatMap((section) =>
        keysOf(manifest[section]),
      ),
      ...collectKeys(manifest['overrides']),
      ...readAllowlist(),
    ];
    if (existsSync(new URL('package-lock.json', repoRoot))) {
      const packages = readJson('package-lock.json')['packages'];
      names.push(...keysOf(packages).map((path) => path.split('node_modules/').at(-1) ?? ''));
    }
    const found = names.filter((name) => FORBIDDEN_PACKAGES.includes(name));
    expect(found).toEqual([]);
  });

  it('has exactly one matching DEPENDENCIES.md card per devDependency', () => {
    const cards = [...sections].filter(
      ([title, section]) => section.level === 2 && title !== NON_NPM_HEADING,
    );
    expect(cards.map(([title]) => title).sort()).toEqual(Object.keys(devDependencies).sort());
    const problems = cards.flatMap(([title, section]) => {
      const found: string[] = [];
      if ((section.fields['Version'] ?? '').split(' ')[0] !== devDependencies[title]) {
        found.push(`${title}: Version differs from package.json`);
      }
      if ((section.fields['SPDX'] ?? '') === '') {
        found.push(`${title}: SPDX is missing`);
      }
      if (!ISO_DATE.test(section.fields['Published'] ?? '')) {
        found.push(`${title}: Published must start with an ISO date`);
      }
      return found;
    });
    expect(problems).toEqual([]);
  });

  it('keeps .nvmrc, engines.node and the Node card identical (B1)', () => {
    const nvmrc = readText('.nvmrc').trim();
    const engines = manifest['engines'];
    expect(EXACT_VERSION.test(nvmrc)).toBe(true);
    expect(isRecord(engines) ? engines['node'] : undefined).toBe(nvmrc);
    expect(sections.get('Node.js')?.fields['Version']?.split(' ')[0]).toBe(nvmrc);
  });
});
