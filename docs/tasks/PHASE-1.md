سأتحقق أولًا من الحقائق التي ستُبنى عليها المهمة (إصدارات Astro وTailwind v4 وتراخيص أدوات البناء)، لأن R11 تُطبَّق بصرامة وقد تصطدم بالتبعيات غير المباشرة.

# Task Brief — Qwikora / TB-P1 «الأساس»

**الدور:** المخطط (Claude) ← المنفّذ (GLM رئيسي) | **المراجعة:** Claude ثم GPT-6 | **الاعتماد:** المالك | **المصدر:** الترتيب المعتمد 0→1→2(+حماية دنيا)→2.5(S0)→3→4أ→4ب→نقطة القرار→5→6→7

## 0. تعليمات القراءة للمنفّذ
- كل رقم وقاعدة وملف في هذه الوثيقة **ملزم**. لا تحذف بندًا ولا تضف نطاقًا.
- أي التباس أو تعارض: توقّف وصعّد بالصيغة في §12. لا تخمّن.
- لا نص عام يحمل ادعاءً أو وعدًا في هذه المرحلة (R12). الوعد v4 ينتظر نواة الإثبات.
- المخطط لم يكتب كودًا. كل ما يلي مواصفات، والتنفيذ عليك.

## 1. الهدف والنطاق
**الهدف:** أساس قابل للبناء عليه: Astro Static + TS Strict + Tailwind v4 + سكربتات (check/lint/test/build/verify) + طبقة PR الخفيفة في CI + Landing Shell يقرأ الأدوات من Manifest فقط.

| داخل النطاق | خارج النطاق (لا تقترب منه) |
|---|---|
| هيكل المشروع والأدوات والسياسات | توجيه اللغات/hreflang/sitemap/SEO (P2) |
| `budgets.json` + مدقّقاته | حقول أدلة البوابات في Manifest (P2) |
| Manifest v0 + Landing Shell بصفحتين `/ar/` و`/en/` | CSP وـ_headers وـengine-loader وService Worker (P2) |
| `SITE_ENV` (noindex في المعاينة) | **workflow النشر** (P2، انظر §2-5) |
| قياس الخطوط العربية وربط المختار | قالب الأداة والمحرك (P3)، S0 (2.5) |
| content-lint وقواعد RTL المنطقية وقواعد منع الشبكة | Playwright/Lighthouse/nightly، PWA، لوحة الأوامر، أي تحليلات، أي إطار UI، الوضع الداكن |

## 2. ملاحظات المخطط المبنية على فحص (تغيّر التنفيذ)
1. **تضارب Vite مع npm.** مع npm قد يُرفع Vite 8 إلى جذر `node_modules` فيكسر `@tailwindcss/vite` على Astro 6 (يعتمد Vite 7)، والتخفيف المقترح من فريق Astro هو override يثبّت `vite` على `^7`. لم أتحقق أنه صُحّح في أحدث الإصدارات، لذا هو بند قبول (AC-02).
2. **ترخيص `lightningcss`.** تبعية Tailwind v4 غير المباشرة ترخيصها MPL-2.0 (copyleft ضعيف)، وهو خارج قائمة R11 الحرفية. لذلك يلزم تحديد نطاق R11 (B10) وقرار المالك O-2.
3. **Astro 6.** يشترط Node 22.12.0 فأعلى، ويعتمد Zod 4، ويمكن استيراد Zod الموافق له من `astro/zod`. لذا لا تُضاف `zod` كاعتمادية مباشرة.
4. **Tailwind v4 مع Astro** يُثبَّت عبر `tailwindcss` و`@tailwindcss/vite` كمُلحق Vite. إن فشل البناء بسبب البند 1 رغم الـoverride، فالبديل `@tailwindcss/postcss` **معتمد مسبقًا** بشرط تسجيل ذلك في DECISIONS.
5. **تعديلان على المصفوفة (للتسجيل في DECISIONS):**
   - workflow النشر (بناء في Actions + رفع مباشر لـmain/release فقط، وتعطيل بناء المعاينات التلقائي لتجنّب استنزاف 500 بناء/شهر) يُسنَد إلى **P2**.
   - Manifest يبدأ في P1 بنسخة v0 الدنيا ويتوسّع في P2 بـ`schemaVersion` جديد.

## 3. قرارات ملزمة (B)

| # | القرار |
|---|---|
| B1 | Astro 6.x و`output: static` وnpm فقط. أحدث إصدار مستقر عمره ≥14 يومًا، وكل الإصدارات **مثبّتة حرفيًا** (لا `^` ولا `~`). Node: أحدث LTS يدعم Astro 6 وبه type-stripping بلا flags، يُثبَّت في `.nvmrc` و`engines`. |
| B2 | `dependencies` **فارغ تمامًا** (لا شيء يعمل عند المستخدم). كل شيء في `devDependencies`. |
| B3 | TypeScript: يمتد من `astro/tsconfigs/strictest` (+ أي علم ناقص من: noUncheckedIndexedAccess، exactOptionalPropertyTypes، verbatimModuleSyntax، noImplicitOverride). السكربتات بـTS تعمل بـtype-stripping المدمج في Node بلا `tsx`، وتتطلب `erasableSyntaxOnly`. إن لم يعمل، صعّد قبل أي بديل. |
| B4 | **لا إطار UI** في P1، والحد 0 JS على صفحات P1. اختيار الإطار (مرشّح: Preact) يُحسم في P3 بقياس. React محظور (lint + deps). |
| B5 | Zod من `astro/zod` فقط. |
| B6 | الاختبارات Vitest + `@vitest/coverage-v8`، وG1 مطبّق على `scripts/**` و`src/lib/**` و`src/config/**` و`src/data/manifest/**` بعتبة **≥90%** في الأربعة مقاييس. |
| B7 | المسارات: `/ar/` (rtl) و`/en/` (ltr) و`/` صفحة اختيار ثابتة بلا JS وبلا إعادة توجيه تلقائي، و`/404.html`. الخصائص CSS منطقية فقط (start/end). |
| B8 | لا inline: `build.inlineStylesheets = never`، لا `<script>` مضمّن (عدا JSON-LD)، لا `style=`، حتى تُبنى CSP في P2 دون `unsafe-inline`. |
| B9 | **المقام الموحد** (KiB = 1024 بايت): JS/CSS/HTML بالـgzip كما يُصدر في `dist/`؛ الخطوط بحجم ملف woff2 الخام. **وزن أولي = HTML+CSS+JS ≤150KiB، والخطوط ≤80KiB منفصلة** (المجموع الأقصى المشتق 230KiB) — تفسير يحتاج O-4. |
| B10 | **نطاق R11:** يُطبَّق حرفيًا على كل ما يصل المتصفح (JS/CSS/HTML/خطوط/نماذج/محركات). أدوات البناء والتطوير (لا يُشحن منها شيء) تخضع لسياسة منفصلة في `policy/license-policy.json`. غير المدرج = **فشل** حتى استثناء مسمّى بموافقة المالك. |
| B11 | **بناء حتمي:** بلا طوابع زمن ولا قيم عشوائية. نفس الـcommit ونفس `SITE_ENV` = نفس hash للمخرجات. |
| B12 | لا تفعيل لـAstro Fonts API ولا أي جلب خطوط وقت البناء. الخطوط ملفات مُلتزَمة بسجل مصدر. |
| B13 | `SITE_ENV` ∈ {development, preview, production}. **غيابه أو قيمة غير صالحة = فشل بناء** (ENV-001). ممنوع الافتراضي الصامت. |

## 4. قرارات المالك المطلوبة (تُسجَّل في DECISIONS.md بقالب: الخيارات / التوصية / القرار / التاريخ)

| # | القرار | يعلّق دمج |
|---|---|---|
| O-1 | الخط العربي المختار، وتعديل R11 للسماح بـ**OFL-1.1 لملفات الخطوط فقط** (كل الخطوط العربية الشائعة OFL). شرط: فحص Reserved Font Name وأثر التقليم. | P1.5 |
| O-2 | قائمة استثناءات تراخيص أدوات البناء، تُبنى من `LICENSE-INVENTORY.md` الفعلي (يتضمن MPL-2.0 لـlightningcss). | P1.3 |
| O-3 | ترخيص المستودع (إن لم يُحسم) وعنوانه العام. بلا ترخيص، «الكود مفتوح لتتحقق» لا يمنح حق إعادة البناء. | P1.6 |
| O-4 | تأكيد تفسير B9 (150KiB + 80KiB منفصلتان). | P1.3 |

## 5. تسلسل الـPRs (R9: مهمة واحدة لكل PR)

كل PR >150 سطر، فكلها **مراجعان + اعتماد المالك (R10)**، وتحمل «بطاقة قرار» من 5 أسطر للمالك (ماذا/لماذا/المخاطر/الأدلة/الأوامر).

| PR | العنوان | يعتمد على |
|---|---|---|
| P1.1 | الهيكل والأدوات | — |
| P1.2 | CI طبقة PR | P1.1 |
| P1.F | قياس الخطوط (وثائق فقط، **موازٍ**) | P1.1 |
| P1.3 | السياسات والمدقّقات | P1.2 |
| P1.4 | SITE_ENV + Manifest v0 + Landing Shell | P1.3 |
| P1.5 | ربط الخط المختار + verify:fonts | P1.4 + O-1 |
| P1.6 | الإغلاق والتقرير | الكل |

## 6. حزمة الملفات

**P1.1 — الهيكل والأدوات**

| الملف | المحتوى |
|---|---|
| `package.json` | private، type: module، engines، `dependencies` فارغ، devDependencies مثبّتة حرفيًا، `overrides` يثبّت `vite` على `^7`. السكربتات: dev، check (astro check بفشل عند التحذير + tsc للسكربتات)، lint (`--max-warnings 0`)، format، format:check، test، test:coverage، build:preview، build:production، build (يفشل دون SITE_ENV)، verify، ci (= check+lint+format:check+test+build:preview+verify). **تعمل على Windows وLinux/macOS** بلا `cross-env`، إلا بإضافة مبرَّرة ببطاقة. |
| `package-lock.json` | يمر `npm ci` عليه على Linux وجهاز المالك. |
| `.nvmrc`، `.npmrc` | `.npmrc`: ignore-scripts وsave-exact وengine-strict. |
| `tsconfig.json`، `tsconfig.scripts.json` | حسب B3. |
| `astro.config.mjs` | static، trailingSlash always، build.format directory، inlineStylesheets never، compressHTML، devToolbar معطّل، خدمة الصور passthrough (لا `sharp`)، `vite.plugins=[tailwindcss()]`، بلا integrations. |
| `vitest.config.ts` | بيئة node، تغطية v8 بالعتبات في B6، قائمة استثناءات **صريحة** (الأصل: فارغة)، تقارير إلى `reports/`. |
| `eslint.config.js` | flat؛ typescript-eslint strict-type-checked + eslint-plugin-astro. القواعد الأمنية في P1.3. |
| `.prettierrc.json`، `.prettierignore`، `.editorconfig`، `.gitattributes`، `.gitignore` | `.gitattributes`: LF موحّد و`*.woff2 binary` (ثبات الـhash بين Windows وCI). `.gitignore`: node_modules، dist، reports، .astro، .env*، coverage. |
| `src/env.d.ts`، `src/pages/index.astro` (مؤقتة) | هيكل فقط. |
| `tests/policy-baseline.test.ts` | يتحقق أن `dependencies` فارغ وكل devDependency مثبّتة حرفيًا. |
| `docs/DEPENDENCIES.md` | **بطاقة** لكل اعتمادية مباشرة (صف): الاسم، الإصدار، الغرض، SPDX، sha256 لنص الترخيص، التاريخ، `hasInstallScript`، البدائل، لماذا لا غنى عنها. |
| `policy/deps-allowlist.json` | الأسماء المسموحة. الأولية: astro، @astrojs/check، typescript، @types/node، tailwindcss، @tailwindcss/vite، eslint، @eslint/js، typescript-eslint، eslint-plugin-astro، prettier، prettier-plugin-astro، vitest، @vitest/coverage-v8، **parse5** (محلّل HTML للمدقّقات). أي إضافة = بطاقة + موافقة المالك. |
| `.github/dependabot.yml` | npm وgithub-actions، أسبوعي، `cooldown` 14 يومًا (تحقق من الصياغة في وثائق GitHub)، حد PRs مفتوحة = 3. |

**P1.2 — CI**

| الملف | المحتوى |
|---|---|
| `.github/workflows/pr.yml` | انظر §7-ج. |
| `.github/pull_request_template.md` | قائمة: معرّف المهمة، بيان المهمة الواحدة (R9)، الاختبارات المضافة (R7)، مزوّد المؤلف ≠ المراجع (R10)، ملفات >150 سطرًا؟، تغيير اعتماديات (+ بطاقة)، ادعاءات عامة مضافة؟ (R12)، أثر SITE_ENV، روابط الأدلة. |
| `docs/CI.md` | خطوات CI، كيفية إعادة إنتاجها محليًا بـ`npm run ci`، الزمن المتوقع، وكيف يُصدَّق استثناء. |

**P1.F — قياس الخطوط (دون ربط بالموقع)**

| الملف | المحتوى |
|---|---|
| `docs/FONTS-REPORT.md` | انظر §7-ه. |
| `docs/fonts/font-test.html` | صفحة محلية **غير مبنية** يفتحها المالك مباشرة: الأبجدية كاملة، لام-ألف، التشكيل، الأرقام العربية-الهندية والغربية، علامات الترقيم العربية، جملة ثنائية الاتجاه (عربي+Latin+أرقام)، عناوين بالوزنين. |
| `docs/fonts/candidates/<font>/` | ≥3 مرشّحات مقلَّمة (woff2) + نص الترخيص + تسجيل المصدر. تُحذف غير المختارة في P1.5. |

**P1.3 — السياسات والمدقّقات**

| الملف | المحتوى |
|---|---|
| `budgets.json` | انظر §7-أ. |
| `policy/license-policy.json` | فئتان: **shipped** (قائمة R11 الحرفية: MIT، Apache-2.0، BSD-2/3-Clause، ISC؛ والمحظورات الصريحة) و**build-only** (تُبنى من الجرد + O-2). غير المدرج = فشل. |
| `policy/banned-terms.json` | انظر §7-ب (CNT). |
| `policy/external-url-allowlist.json`، `policy/install-scripts-allowlist.json`، `policy/dep-age-exceptions.json` | الأصل: فارغة. كل مدخل: سبب + مرجع قرار + تاريخ. |
| `scripts/lib/*` | مشترك: تنسيق المخالفات، قراءة lockfile، حجم gzip، تجوال dist، تصنيف SPDX، تطبيع العربية. |
| `scripts/verify-*.ts` + `scripts/verify.ts` | انظر §7-ب. |
| `eslint.config.js` (تعديل) | قواعد المنع في `src/**` فقط: fetch وXMLHttpRequest وWebSocket وEventSource وnavigator.sendBeacon وeval وnew Function. ومنع استيراد react وreact-dom. override لمسار `src/engine-loader/**` موجود وموثَّق (المجلد غير موجود بعد). `scripts/**` و`tests/**` مستثناة بسبب موثَّق: أدوات بناء لا تُشحن. |
| `docs/VERIFY.md`، `docs/LICENSE-INVENTORY.md` | الأول: سجل الرموز وكيفية إضافة موافقة. الثاني: **مُولَّد** من الشجرة المثبّتة (كل SPDX مميز + أعداد + الحزم + تصنيف السياسة). |
| `tests/scripts/**`، `tests/fixtures/**` | §8. |

**P1.4 — الموقع**

| الملف | المحتوى |
|---|---|
| `src/config/site-env.ts` | محلّل `SITE_ENV` النقي (B13) + ثابت `LAUNCH_FLOOR = 3`. |
| `src/config/site.ts` | اسم الموقع، عنوان المستودع (O-3)، اللغتان. |
| `src/i18n/ui.ts` | قاموس AR/EN للشِل فقط. المفاتيح: siteName، langSwitch، skipToContent، toolsHeading، emptyPreview، footerSource، footerBuild، chooser، notFound. |
| `src/data/manifest/schema.ts`، `load.ts`، `tools.json` | انظر §7-ج. |
| `src/lib/landing-model.ts` | دوال نقية: الأدوات المرئية (published فقط)، التجميع بالتصنيف، ترتيب حتمي. |
| `src/lib/head.ts` | دالة نقية: وسوم robots والعنوان حسب البيئة. |
| `src/layouts/Base.astro` | lang وdir، رابط التخطّي، viewport، العنوان، وسم robots من `head.ts`، المفضلة. |
| `src/components/` | Header وFooter (بصمة commit من 7 خانات، `unknown` إن غابت) وToolCard وEmptyState. |
| `src/pages/index.astro`، `[lang]/index.astro`، `404.astro`، `robots.txt.ts` | `[lang]` عبر `getStaticPaths` لـ ar/en. robots.txt يُولَّد حسب البيئة. |
| `src/styles/global.css` | `@import "tailwindcss"` + `@theme` برموز ألوان (إضاءة فقط، `color-scheme: light`) + `:focus-visible` ظاهر + ستاك خطوط نظام. |
| `public/favicon.svg` | عمل المنفّذ الأصلي، شكل بسيط بلا علامة تجارية لطرف ثالث. |
| `tests/**` | §8. |

**P1.5 — ربط الخط:** `public/fonts/*.woff2`، `public/fonts/fonts.json` (سجل المصدر)، `@font-face` في `global.css`، preload لخط واحد حرج، `scripts/verify-fonts.ts` + اختباره، تحديث `FONTS-REPORT.md` بالقرار، `docs/FONTS-LICENSES/`، حذف المرشحات الأخرى.

**P1.6 — الإغلاق:** `README.md` (ما هو، كيف يُشغَّل على Windows وLinux، `SITE_ENV`، الهيكل، المبادئ)، تحديث `DECISIONS.md` (B وO وتعديلا المصفوفة)، `LICENSE` (O-3)، `docs/PHASE-1-REPORT.md` (§12).

## 7. المواصفات التفصيلية

### أ) `budgets.json` (حقوله، والقيم بالبايت)

| الحقل | القيمة | ملاحظة |
|---|---|---|
| `schemaVersion` | 1 | |
| `units` | gzip: مستوى 9 لبايتات الملف كما في dist؛ woff2: حجم الملف الخام؛ KiB=1024 | يُتحقق من وجوده |
| `pages.content.jsGzip` | 0 | |
| `pages.home.jsGzip` | 8192 | الفعلي في P1 = 0 |
| `pages.tool.islandJsGzip` | 40960 | الجزيرة وما تستورده ساكنًا؛ يستثنى dynamic import والـworkers وwasm والنماذج. غير مُطبَّق في P1 لكن المخطط والمدقّق جاهزان |
| `initial.htmlCssJsGzip` | 153600 | B9 |
| `fonts.woff2Total` | 81920 | الخطوط المرجعية في الصفحة الأولى |
| `derived.firstLoadTotal` | 235520 | مشتق، يُحسب ولا يُكتب يدويًا |
| `engine.approvalThresholdGzip` | 102400 | أي chunk كسول فوقه يحتاج مدخلًا في `approvals` (مرجع قرار R5) |
| `files.maxBytes` | 20971520 | أي ملف في dist فوقه = فشل |
| `files.hostHardLimit` | 26214400 | حد Pages (25MiB) = فشل مطلق |
| `web.*` | LCP 2500ms، INP 200ms، CLS 0.1، Lighthouse هاتف ≥95، longTask 50ms | تُعلن الآن لمصدر واحد، وتُقاس في P6 (المدقّق يتحقق من المخطط فقط) |

**الخلاصة:** يعدّ المدقّق JS كل `<script src>` وmodulepreload وأي مضمّن في كل صفحة، ويصنّفها (home/content/tool) بنمط المسار. وأهداف P1 الداخلية (تُبلَّغ ولا تُفرض): HTML+CSS ≤30KiB gzip لكل صفحة.

### ب) المدقّقات (كل مدقّق = رمز بادئة + `CODE | file:line | message | fix`، وخروج 1 عند أي مخالفة)

| الأمر | يفشل عندما |
|---|---|
| `verify:budgets` (BUD) | تجاوز أي سقف أعلاه، أو ملف في dist >20MiB، أو `budgets.json` مخالف للمخطط، أو chunk كسول >100KiB دون موافقة |
| `verify:external-refs` (EXT) | في HTML: أي `src/href/srcset/action/poster/data/formaction` مطلق (http/https/ws/`//`)، عدا `<a href>` إلى مضيف المستودع المعتمد فقط؛ `preconnect/dns-prefetch/prefetch/prerender` خارجي؛ `<iframe/object/embed>`؛ meta refresh؛ `<script>` مضمّن (عدا JSON-LD)؛ `<style>` أو `style=` مضمّن. في CSS: `url()`/`@import` مطلق. في JS الصادر: أي من fetch/XMLHttpRequest/WebSocket/EventSource/sendBeacon أو URL مطلق خارج `external-url-allowlist` |
| `verify:links` (LNK) | رابط داخلي لا يقابله ملف في dist (R6: لا صفحات وهمية) |
| `verify:content` (CNT) | في النص النهائي لـdist وقيم `i18n`: مصطلح محظور. القوائم: **تفضيل**: نقلة، رائد/رائدة، الأول/أول/الأولى، الأفضل/أفضل، الأقوى/أقوى + مقابلاتها (breakthrough، pioneer/pioneering، leading، first، #1/number one، best، strongest). **حالة مؤقتة**: قريباً/قريبا، coming soon. التطبيع قبل المطابقة: حذف التشكيل والتطويل وأحرف الصفر، توحيد الهمزات وألف المقصورة، NFKC، lowercase، تجريد سوابق (ال/و/ف/ب/ل). تسامح السياق بمدخلات `allowContexts` (سلسلة + مفتاح + موافقة المالك)، وهي فارغة أصلًا |
| `verify:logical-css` (CSS) | في `src/**`: صنف أو خاصية اتجاه فيزيائي (ml/mr/pl/pr/left/right/text-left/text-right/float-*/border-l/r/rounded-l/r، margin-left… إلخ) دون تعليق `physical-ok: <سبب>` |
| `verify:deps` (DEP/LIC) | اعتمادية مباشرة خارج allowlist؛ إصدار غير حرفي؛ بطاقة ناقصة في `DEPENDENCIES.md`؛ أكثر من إصدار رئيسي لـvite أو غير 7؛ `hasInstallScript` لحزمة غير معتمدة؛ ترخيص خارج السياسة حسب الفئة؛ استيراد react في `src/` |
| `verify:deps-age` (AGE) | **يُشغَّل في CI فقط عندما يتغير lockfile** مقارنةً بقاعدة الـPR: أي نسخة جديدة/مغيَّرة عمرها <14 يومًا دون استثناء مسجّل. يستخدم سجل npm، والاختبارات تستعمل ردودًا مُحاكاة بلا شبكة |
| `verify:manifest` (MAN) | مخطط/تفرّد/تصنيف غير معروف، **أو أي أداة `published` في `tools.json` الحقيقي** (ممنوع في P1 حتى تصل حقول البوابات في P2) |
| `verify:site-env` (ENV) | وفق `SITE_ENV` الجاري: preview ⇒ كل صفحة فيها `noindex,nofollow` وrobots.txt = Disallow؛ production ⇒ لا `noindex` في أي صفحة وrobots يسمح، ولا سطر Sitemap حتى P2 |
| `verify:reproducible` (REP) | بناءان نظيفان متتاليان لا يتطابقان ملفًا ملفًا (sha256)؛ يطبع `DIST_HASH` |
| `verify:fonts` (FNT) — P1.5 | مجموع woff2 >81920؛ ملف بلا سجل في `fonts.json` (sha256، المصدر، SPDX، مسار الترخيص وhashه، نتيجة Reserved Font Name، وصفة التقليم)؛ ملف يتيم؛ `@font-face` بلا `font-display`؛ `unicode-range` يتجاوز نطاقات العربية |
| `verify` | المُنسِّق: يشغّل **كل** المدقّقات دون توقّف عند الأول، ويطبع جدول ملخص، ويخرج 1 إن فشل أي منها |

### ج) Manifest v0 وSITE_ENV وCI

**Manifest v0** (`schemaVersion: 0`، مخطط صارم: مفتاح غير معروف = فشل):
- `categories[]`: `id` (kebab)، `name{ar,en}`.
- `tools[]`: `id` (kebab، فريد)، `slug` (فريد)، `status` ∈ {idea, spike, draft, tested, published}، `category` (يجب أن يشير لتصنيف موجود)، `name{ar,en}`، `summary{ar,en}` (غير فارغة).
- المحتوى الأولي: تصنيف `data` (غير معروض لأنه فارغ من المنشور) + أداة `data-chat` بحالة `idea` وأسماء تقنية بلا تسويق.
- **قواعد العرض:** يُعرض `published` فقط. التصنيف بلا أدوات منشورة **يختفي**. لا نص «قريباً» أبدًا. في preview/development، وعند الصفر منشور، تظهر حالة فراغ محايدة («معاينة داخلية: لا توجد أدوات منشورة بعد» / مقابلها الإنجليزي). في production لا تظهر لأن البناء يفشل أصلًا.
- **أرضية الإطلاق:** دالة نقية `assertLaunchFloor(manifest, env)` تفشل في production إن كان عدد `published` < 3 برمز `MAN-LAUNCH-FLOOR`. **تُختبر بالوحدات فقط. لا تُضف خطوة CI تبني production فعليًا** (ستنكسر لاحقًا بلا سبب).
- رابط بطاقة الأداة `/<lang>/tools/<slug>/` يمر عبر `verify:links`.

**CI (`pr.yml`)**: يعمل على `pull_request` وعلى `push` إلى main.
- الأذونات: `contents: read` فقط. لا `pull_request_target`. لا أسرار.
- التزامن: مجموعة لكل ref مع cancel-in-progress.
- مهمة واحدة `verify` على ubuntu-latest، مهلة 10 دقائق (هدف ≤5).
- الاسم الإلزامي للفحص: **`PR / verify`** (يُثبَّت لاستخدامه كـrequired check).
- الخطوات: checkout و`setup-node` **مثبّتان بـSHA كامل** مع تعليق بالإصدار، و`persist-credentials: false`، و`node-version-file: .nvmrc`، و`npm ci --ignore-scripts`.
- المتغيرات: `SITE_ENV=preview` و`ASTRO_TELEMETRY_DISABLED=1` و`DO_NOT_TRACK=1`.
- خطوة `npm run ci` (مصدر الحقيقة الوحيد)، ثم `verify:deps-age` شرطيًا، ثم ملخص الميزانيات في `$GITHUB_STEP_SUMMARY`.
- إن احتاج بناء ما سكربت تثبيت متخطّى، **لا تُزِل `--ignore-scripts` عامًا**. صعّد مع الحزمة والدليل، والحل استثناء مسمّى في `install-scripts-allowlist.json`.

### د) تفاصيل SITE_ENV

| SITE_ENV | الاستخدام | robots meta | robots.txt | عنوان الصفحة | الفراغ |
|---|---|---|---|---|---|
| development | `astro dev` | noindex | Disallow | بادئة «[معاينة]» | يظهر |
| preview | main وPRs | noindex,nofollow | `Disallow: /` | بادئة «[معاينة]»/«[Preview]» | يظهر |
| production | release فقط | لا وسم | سماح (بلا Sitemap) | بلا بادئة | لا يظهر (البناء يفشل دون 3 منشورة) |

### هـ) تقرير الخطوط (`FONTS-REPORT.md`)
- لكل مرشح (≥3، المقترحة غير ملزمة: IBM Plex Sans Arabic، Noto Sans Arabic، Cairo، Readex Pro، Almarai، وتتحقق **بنفسك** من ترخيص كل منها):
  - المصدر والإصدار/commit، وSPDX ونص الترخيص مع hash، ونتيجة Reserved Font Name، وهل الخط متغيّر.
  - وصفة التقليم: نطاقات `U+0600–06FF` و`U+200C–200F` و`U+2066–2069` و`U+25CC`، **مع الإبقاء على ميزات OpenType** (init، medi، fina، isol، liga، rlig، calt، locl، mark، mkmk، وغيرها لازم للتشكيل) وإلا تنكسر الوصلات.
  - الحجم بعد التقليم: 400 وحدها، 400+700، المتغيّر.
  - نتيجة اختبار `font-test.html` (وصلات/تشكيل/أرقام/ثنائي الاتجاه).
- **التسلسل الإلزامي للقرار:** (1) متغيّر ≤81920 ⟵ (2) وزنان ثابتان ⟵ (3) وزن واحد مع `font-synthesis: none` ⟵ (4) ستاك نظام للعربية. الـLatin على ستاك نظام (0 بايت) عبر `unicode-range` يقيّد الخط للعربية.
- المالك يقرر (O-1) ويرفق لقطتين (AR وEN) من **الجهاز المرجعي**.

## 8. الاختبارات المطلوبة (المبدأ: كل مدقّق له fixtures **سالبة** تفشل برمزها المتوقع، وإلا فقد يمر صامتًا)

| الملف | الحالات الإلزامية |
|---|---|
| `tests/scripts/budgets.test.ts` | ضمن الميزانية، تجاوز كل سقف، ملف >20MiB، chunk كسول >100KiB دون موافقة ثم معها، مخطط غير صالح |
| `tests/scripts/external-refs.test.ts` | قاعدة سالبة لكل بند في §7-ب |
| `tests/scripts/content.test.ts` | تجاوزات: «الأَفضل» بتشكيل، «الأفـــضل» بتطويل، «الافضل» بألف مختلفة، «بالأقوى»، حرف صفري مُقحَم، `BEST`، `Number-One`، `#1`، «قريبًا». وحالات سالبة مزيفة: «أفضلية» لا تُحجب |
| `tests/scripts/logical-css.test.ts` | كل صنف/خاصية فيزيائية، واستثناء `physical-ok` بسبب وبدونه |
| `tests/scripts/deps.test.ts` | اعتمادية خارج allowlist، `^`، ترخيص shipped خارج القائمة، ترخيص build-only غير مدرج، two vite majors، import react، `hasInstallScript` غير معتمد |
| `tests/scripts/deps-age.test.ts` | ردود سجل مُحاكاة: 13 يومًا ⟵ فشل، 15 ⟵ نجاح، استثناء مسجّل ⟵ نجاح، lockfile غير متغيّر ⟵ لا فحص |
| `tests/scripts/verify-orchestrator.test.ts` | مدقّق وهمي فاشل ⟵ الخروج 1، ولا يتوقف عن تشغيل الباقي |
| `tests/scripts/reproducible.test.ts` | مجلدان متطابقان، ثم اختلاف بايت واحد ⟵ REP |
| `tests/scripts/fonts.test.ts` (P1.5) | ما في §7-ب |
| `tests/site/site-env.test.ts` | غياب/قيمة غير صالحة ⟵ ENV-001، والمصفوفة الثلاثية، ودالة head في production بلا noindex |
| `tests/site/manifest.test.ts` | مخطط صارم، تفرّد، تصنيف مجهول، published ممنوع في الحقيقي ومقبول في fixture، أرضية 3 (2 ⟵ فشل، 3 ⟵ نجاح)، تصنيف فارغ يختفي، غير المنشور لا يظهر |
| `tests/site/landing-model.test.ts` | ترتيب حتمي، تجميع، فلترة |
| `tests/site/i18n.test.ts` | تطابق مفاتيح ar/en، وفحص CNT على القيم |
| `tests/site/no-hardcoded-tools.test.ts` | أسماء الأدوات (بكل الحالات) لا تظهر في `src/pages` و`components` و`layouts` و`i18n` — Manifest هو المصدر الوحيد |
| `tests/site/dist-structure.test.ts` | على بناء preview: `/`، `/ar/`، `/en/`، `404.html`، `robots.txt` موجودة؛ lang/dir صحيحان؛ h1 واحد؛ landmarks؛ رابط التخطّي أول عنصر قابل للتركيز وهدفه موجود؛ لا tabindex موجب؛ `<title>` فريد؛ صفر `<script>`؛ لا اسم أداة غير منشورة |
| `tests/site/contrast.test.ts` | تحليل أزواج الألوان المعلنة من `global.css` ⟵ تباين نص ≥4.5:1، وحلقة التركيز ≥3:1 |
| `tests/site/lint-rules.test.ts` | ESLint عبر API: `fetch` في `src/` ⟵ خطأ، وفي `scripts/` ⟵ مقبول، واستيراد react ⟵ خطأ |

## 9. معايير القبول (كل بند: الأمر ⟵ النتيجة المتوقعة ⟵ الدليل في التقرير)

| AC | الفحص |
|---|---|
| 01 | `npm ci` ينجح على Linux CI وجهاز المالك؛ Node ≥22.12 حسب `.nvmrc` |
| 02 | `dependencies` فارغ؛ كل devDependency حرفية ومعتمدة؛ `npm ls vite` يُظهر **إصدارًا واحدًا** (رئيسي 7)؛ المخرج محفوظ |
| 03 | `npm run build:preview` ينجح، وdist يحوي الصفحات في §6 |
| 04 | `npm run check` = 0 أخطاء و0 تحذيرات |
| 05 | lint بـ0/0، وformat:check نظيف |
| 06 | منع الشبكة مُثبَت باختبار (fetch في `src/` يفشل) |
| 07 | dist: صفر ملفات `.js` وصفر `<script>` في الصفحات الأربع |
| 08 | لا inline style/script؛ جدول الأوزان الفعلية مقابل السقوف في التقرير |
| 09–14 | المدقّقات أعلاه تمر على الحقيقي وتفشل على كل fixture سالبة |
| 15 | `LICENSE-INVENTORY.md` مُولَّد ومُلتزَم، وكل خارج القائمة له قرار O-2 |
| 16 | Manifest: published ممنوع في الحقيقي؛ غير المنشور لا يظهر في dist |
| 17 | غياب `SITE_ENV` ⟵ فشل ENV-001؛ preview فيه noindex في كل الصفحات وrobots Disallow |
| 18 | بناءان نظيفان ⟵ `DIST_HASH` متطابق (يُدوَّن) |
| 19 | كل روابط dist الداخلية تُحلّ |
| 20 | اختبارات البنية وإتاحة الأساس تمر (بما فيها التباين) |
| 21 | `/ar/` rtl و`/en/` ltr؛ لا فيزيائي؛ **لقطتان من الجهاز المرجعي بتوقيع المالك** |
| 22 | الخطوط: ≤81920، سجل كامل، RFN موثّق، O-1 مسجّل، `font-display` موجود، preload لخط واحد |
| 23 | التغطية ≥90% بالمقاييس الأربعة، والاستثناءات فارغة أو مبرّرة صفًا صفًا |
| 24 | CI: أذونات القراءة فقط، Actions مثبّتة بـSHA، لا أسرار، متغيرات telemetry، الزمن مدوَّن |
| 25 | `dependabot.yml` صالح وبه cooldown 14 يومًا |
| 26 | لا تحليلات: لا مضيف خارجي في dist، **والمالك أكّد أن Cloudflare Web Analytics معطّل** |
| 27 | أوامر README تعمل على Windows (دليل من المالك) |
| 28 | كل PR مهمة واحدة، القالب مملوء، مراجعة Claude ثم GPT-6 مسجّلة في الـPR (G7) |
| 29 | لا ادعاء/وعد في أي نص عام (يُثبته `verify:content`) |
| 30 | `PHASE-1-REPORT.md` مكتمل |

## 10. ما يمنع الدمج
1. فشل `PR / verify` أو أي AC لهذا الـPR.
2. أي اختبار جديد بلا fixture سالبة، أو تغطية <90% على نطاق B6.
3. اعتمادية جديدة دون بطاقة وallowlist وموافقة المالك، أو نسخة <14 يومًا دون استثناء مسجّل.
4. أي استثناء (ترخيص، سكربت تثبيت، URL، سياق محظور، اتجاه فيزيائي) دون مرجع قرار.
5. أي نص عام يحوي ادعاءً أو وعدًا أو «قريباً».
6. تغيير مخرجات البناء بين بناءين متتاليين (REP).
7. غياب أحد المراجعَين، أو مراجع من مزوّد المؤلف نفسه (R10).
8. PR يخلط مهمتين (R9)، أو يمس خارج نطاقه في §1.
9. غياب قرار المالك المعلِّق (§4) لـ P1.3 وP1.5 وP1.6.
10. إضافة `fetch/XHR/WebSocket/sendBeacon` خارج المسار المعتمد، أو أي JS عند المستخدم دون موافقة المخطط.

## 11. إجراءات المالك (غير تقنية)
1. في إعدادات GitHub: تفعيل حماية فرع main: PR إلزامي، والفحص المطلوب `PR / verify` (يظهر بعد أول تشغيل)، ومنع force-push، وحل المحادثات قبل الدمج.
2. **لا تربط Cloudflare Pages بـGit الآن** (حتى يصل workflow النشر في P2).
3. في لوحة Cloudflare: تأكد أن Web Analytics مطفأ، ثم أبلغ المنفّذ.
4. تفعيل Dependabot (تنبيهات الأمان والتحديثات).
5. تسجيل O-1 إلى O-4 في DECISIONS.md.
6. فتح `docs/fonts/font-test.html` على الجهاز المرجعي، ثم تصوير النتيجة ولقطتي `/ar/` و`/en/`.

## 12. ممنوعات، تصعيد، وتسليم

**ممنوع:** أي اعتمادية خارج allowlist؛ `sharp`؛ أي إطار UI؛ `eslint-disable` أو `@ts-ignore` دون سبب ومرجع؛ تخفيف أي سقف أو عتبة؛ افتراضي صامت لـSITE_ENV؛ جلب خطوط من مضيف خارجي؛ تضمين طوابع زمن في المخرجات؛ تعديل `budgets.json` أو `policy/*` في PR لا يخص ذلك.

**التصعيد:** أي التباس يُرفع بصيغة: السؤال / الخيارات (2–3) / توصيتك / الأثر على الجدول الزمني، ويحمل الوسم BLOCKED-PLANNER أو BLOCKED-OWNER. لا تتجاوز بتخمين.

**التسليم (`docs/PHASE-1-REPORT.md`)**، بمخرجات خام لا ملخصات:
- سجل `npm run ci` النهائي، ورابط تشغيل CI الأخضر وزمنه.
- جدول الميزانيات الفعلية مقابل السقوف.
- مخرج `npm ls vite`.
- `LICENSE-INVENTORY.md` وقرارات O-2.
- جدول الخطوط وقرار O-1 واللقطتان.
- `DIST_HASH` من بناءين.
- روابط الـPRs
-  ومراجعات G7.
- قائمة بما أُجِّل أو وُجد خارج النطاق، لتغذية Brief المرحلة 2.

**ما يتبع (يُصاغ بعد قبول P1):** Brief المرحلة 2 يشمل اللغات والتوجيه وSEO والـManifest الموسّع بحقول البوابات و`verify:gates` والحماية الدنيا (engine-loader وCSP وـ_headers وCOOP/COEP وSW) وworkflow النشر.
