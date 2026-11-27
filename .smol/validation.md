# Conversion update validation — 2026-09-26

## GEO-PORTFOLIO-01 — 2026-11-27 (separate branch, not deployed)

Source brief copied unchanged; original dirty checkout preserved. 28 sources reviewed, 19 public verified records in 14 event groups; 9 gated out. One source has unstable direct HTTPS (S03); S21 date deliberately omitted. `/about/` has source-linked biography, own materials, speaking/announcements, media, projects, dated timeline, contact; all text/links in initial HTML. One canonical Person across SSR and both static builds. Native links, accessible topic filter and no-JS fallback. Current accepted lightweight photos and single-host quiz paths preserved; no pricing/scoring/contact collection changes.

Final local checks: TypeScript and ESLint passed; three builds passed; 68 Node tests + 5 journal Python unit tests passed; Playwright/isolated Edge: both mirrors × 320/390/768/1440 + both mirrors without JS, no overflow/console errors or warnings/local HTTP failures. Mobile menu, keyboard skip-link, filters and internal CTA passed. Screenshot review caught and fixed year wrapping. npm production audit: 0 vulnerabilities. Sandbox launch/TLS/tempdir errors were retried with scoped escalation, not bypassed by changing application safety. Full evidence, commands and limitations in `docs/geo-audit.md`.

No new merge/deploy, external outreach, webmaster submission, IndexNow, analytics installation or Business Hub registration. AI-platform independent baseline not measured; not reported as zero visibility. See owner checklist/protocol before release. Earlier conversion validation below is historical, not proof of this branch's production state.

Implemented in the existing AI page: task-to-solution hero and four-step chain; three situation cards; five factual outcomes per product before delivery; direct verified VK contact; URL-based selection and mobile fixed CTA. Existing program descriptions moved into details, stages/prices/limits retained. Desktop card rows (including individual outcomes) share a 16-row subgrid; existing palette/fonts/assets retained.

Checks completed:

- Cloudflare static build and 8 tests passed after final contact changes.
- GitHub static build and 7 tests passed after final contact changes.
- Application build and 6 SSR tests passed; subsequent small change only adds optional header target and matching hash to VK clicks.
- ESLint and TypeScript noEmit passed.
- Browser widths 1440, 1280, 768, 430, 390, 375, 320: no horizontal overflow; diagnostic/product cards stack on narrow screens; product and diagnostic button heights >=48px when visible.
- At 1440px all eight major card sections have identical y/height values; five outcome items start at identical positions across all three columns.
- All three original query+details deep links reveal the correct program and display matching selected product; mobile detail text does not overflow at 320px.
- Diagnostic clicks update query and hash; back/forward restore the selected context. No browser console errors/warnings in local landing checks.
- Mobile footer at 430px ends at y820, sticky CTA starts at y831 (900px viewport): content is not covered. Safe-area padding is implemented; physical iPhone/app handoff needs device verification.
- Independent read-only reviewer: GPT-5.6 Terra; initial header-target inconsistency fixed, follow-up review found no further issues.

Publication: implementation commit `5d3847b` pushed to the existing GitHub main branch; workflow run `36261167572` completed successfully. Public GitHub Pages AI route returned HTTP 200 with the new hero and outcomes markup. Cloudflare archive: `outputs/nedelsky-ai-conversion-2026-09-26.zip`.

Cloudflare production publication completed through Wrangler after explicit user approval of Pages write and account/user read access. Deployment `462fd90a-e708-4c97-9224-47186e0ce099`, branch `main`, source `5d3847b`, immutable URL `https://462fd90a.nedelsky.pages.dev`. CLI exit code 0; deployment list confirms Production. The ignored build-generated `.wrangler/deploy/config.json` SSR redirect was removed before static Pages upload; root `wrangler.jsonc` and site configuration were preserved. OAuth credentials are kept by Wrangler locally, not in the repository.

Production checks on `https://nedelsky.pages.dev/ai-for-business/`:

- HTTP 200 with the new hero, format diagnostic and outcome sections; speaker image HTTP 200.
- At 1440px all eight major card sections and all five individual outcome rows have matching vertical positions across three columns; no horizontal overflow.
- Diagnostic selection for AI practice updates query to `?product=ai-practice` and hash to `#product-ai-practice`.
- At 390px the original `?product=ai-start#details-ai-start` deep link opens the correct program, places its top at 104px, and shows the matching contact context. No horizontal overflow; sticky contact button height 48px.
- All inspected VK links retain the verified profile, new-tab target and `noopener noreferrer`; no automatic message transmission.

Post-publication manual checks: refresh published page, open a product deep link, confirm VK account/app handoff on real phone, and check iPhone bottom safe area. No automatic message transmission or unverified VK prefill parameters.
