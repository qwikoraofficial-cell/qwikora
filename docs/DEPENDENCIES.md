Dependencies (P1.1)
Rules: every version is pinned exactly (B1). The eligibility cutoff is 2026-10-10 inclusive (14 days before 2026-10-24). dependencies is empty (B2). All 15 packages below are devDependencies and are listed in policy/deps-allowlist.json. Adding any package requires a card here plus owner approval.

Verification notes: dates come from public release tables (GitHub Releases, releasealert.dev npm mirror, astrobuild.eu, eslint.org, nodejs.org). SPDX values are from the maintainers' published licenses and must be re-checked against each package LICENSE file after the first npm ci. parse5 MIT was confirmed from registry metadata.

astro
Version: 6.4.8
Purpose: static site generator (B1, output static).
SPDX: MIT
Published: 2026-06-17
Why indispensable: the site framework itself. Latest 6.x line, as B1 requires; Astro 7 exists (see escalation E1).
@astrojs/check
Version: 0.9.10
Purpose: astro check, type diagnostics for .astro files.
SPDX: MIT
Published: 2026-07-27
Why indispensable: the only type-check path for .astro files (the check script).
typescript
Version: 6.0.3
Purpose: type checking for src and scripts (B3).
SPDX: Apache-2.0
Published: 2026-04-16
Why indispensable: strictest typing is mandatory. 7.0.2 (2026-07-08) is not used because typescript-eslint peers typescript below 6.1.0 and TS 7 ships without a stable JS API (escalation E2).
@types/node
Version: 24.19.2
Purpose: Node typings for scripts, tests and config (matches Node 24).
SPDX: MIT
Published: 2026-10-09
Why indispensable: scripts and tests run on Node with type stripping and need its types.
tailwindcss
Version: 4.3.3
Purpose: utility CSS engine, v4.
SPDX: MIT
Published: 2026-07-16
Why indispensable: the approved styling layer (logical properties only, B7).
@tailwindcss/vite
Version: 4.3.3
Purpose: Tailwind v4 integration through vite.plugins in astro.config.mjs.
SPDX: MIT
Published: 2026-07-16 (lockstep with tailwindcss; verify with npm view)
Peer check: 4.2.2 and later declare vite ^5.2 || ^6 || ^7 || ^8 (public docs and discussion 19624), so the vite ^7 override is compatible. Confirm with npm ls vite after the first install.
Why indispensable: the only supported way to run Tailwind v4 inside Astro without a separate PostCSS step.
eslint
Version: 10.12.0
Purpose: linting with max warnings 0.
SPDX: MIT
Published: 2026-10-02
Why indispensable: enforces the policy rules (no React, no network APIs in src).
@eslint/js
Version: 10.0.1
Purpose: ESLint recommended base config.
SPDX: MIT
Published: 2026-02-06
Why indispensable: base rule set required by the flat config. A newer 10.x may exist (escalation E5).
typescript-eslint
Version: 8.71.1
Purpose: strict-type-checked rules and TypeScript parser for ESLint.
SPDX: MIT
Published: 2026-10-05
Why indispensable: typed linting is mandated (B3 and the lint rules).
eslint-plugin-astro
Version: 3.2.1
Purpose: ESLint support for .astro files.
SPDX: MIT
Published: 2026-09-17
Why indispensable: without it .astro files cannot be linted at all.
prettier
Version: 3.9.10
Purpose: code formatting (format and format:check).
SPDX: MIT
Published: 2026-10-10 (exactly on the cutoff day, inclusive)
Why indispensable: deterministic formatting is part of the verify gate.
prettier-plugin-astro
Version: 1.1.1
Purpose: Prettier parser and printer for .astro files.
SPDX: MIT
Published: 2026-10-09
Why indispensable: Prettier cannot format .astro files without it.
vitest
Version: 5.0.3
Purpose: test runner (B6).
SPDX: MIT
Published: 2026-09-30
Why indispensable: the approved test runner. It requires Vite 6.4 or later and Node 22.12 or later, satisfied by the vite override.
@vitest/coverage-v8
Version: 5.0.3
Purpose: V8 coverage provider with 90 percent thresholds (B6).
SPDX: MIT
Published: 2026-09-30 (lockstep with vitest; verify with npm view)
Why indispensable: coverage thresholds are a release gate.
parse5
Version: 8.0.1
Purpose: reserved for the P1.3 auditors (HTML output checks such as detecting inline style and script, B8).
SPDX: MIT
Published: 2026-04-19
Status: not imported anywhere in P1.1. It is on the owner allowlist only so that the P1.3 gates can use it without a new card.
Why indispensable: the only HTML parser approved for the P1.3 output audits.
Not npm packages
Node.js
Version: 24.21.0 (.nvmrc and engines, exact)
Published: 2026-09-09
Note: 24.22.1 (2026-10-21) is a security release and becomes eligible on 2026-11-04. Node 26 becomes LTS on 2026-10-28 (escalation E3).
vite override
Value: ^7.0.0 in package.json overrides, as mandated by the owner.
Note: it is an override, not a devDependency, so the exact-pin test does not apply. The lockfile pins the resolved version.
GitHub Actions
actions/checkout: de0fac2e4500dabe0009e67214ff5f5447ce83dd (v6.0.2)
actions/setup-node: 48b55a011bda9f5d6aeb4c2d9c7362e8dae4041e (v6.x, exact tag to be confirmed)
