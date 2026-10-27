# Swarm Signal

A dark-green reading room for top tweets about IdentityMD, with a Pepe operator carrying a neural AI blaster and a second Pepe at a field terminal. Built with React, TypeScript and Vite.

The feed contains **six sourced post summaries**, ranked by likes captured on **27 October 2026**. It is a finite snapshot, not a live or exhaustive X ranking. Search posts and people, filter by topic, change the sort, save posts in this browser, open the originals on X, and copy their links. Source notes are available on every post.

## Install and develop

Use Node.js 22.12 or newer (Vite also supports Node 20.19).

```sh
npm ci
npm run dev
```

## Typecheck, rebuild and preview

```sh
npm run typecheck
npm run build
npm run preview
```

`npm run build` typechecks the application and replaces `dist/` with the production export. The source, `package-lock.json`, and finished `dist/index.html` with all runtime assets are included in the submission. Serve **the contents of `dist/`** on any static host. Vite uses `base: './'`; assets use relative URLs, and navigation uses hashes. There is no server rewrite requirement.

You can preview the delivered export without installing packages:

```sh
python3 -m http.server 4173 --directory dist
```

Open `http://localhost:4173/`. Use HTTP rather than opening the HTML as a local file. Subdirectory hosting was checked at `/preview/`.

## Content and storage

- Edit `src/posts.ts` to update the reading list and capture date. Keep real original post IDs, source links, captured counts, and honest summaries. Update [SOURCES.md](SOURCES.md) with the evidence, then rebuild.
- “Top” means most captured likes **within the selected posts**. Alternate sorts use original post dates or captured replies. Rank numbers retain the snapshot’s overall like ranking when filtering.
- Counts come from public mirrors and can be stale or inconsistent. Full posts, videos and threads open on X, which may require login. [SOURCES.md](SOURCES.md) records the discrepancies.
- Bookmarks live under `swarm-signal:saved:v1` in this browser’s local storage. They do not sync to X or other devices. A failed save displays a warning and keeps the selection for the current page session.
- The export makes no external runtime requests. There is no API key, backend, wallet, account flow, tracking or fabricated live activity.

## Validation performed

The worker ran the production build and a separate TypeScript check successfully. **48 Chromium checks passed**, covering search, filters, sorts, bookmarks and reloads, history, native dialogs, keyboard navigation, source disclosure, clipboard success/failure branches, storage failure, and layouts at 320, 390, 768, 1024 and 1440 CSS pixels. The first post and “Read on X” action are visible on the first 390 × 844 screen. Text enlargement to 200% reflows without horizontal overflow.

The pinned `taste@1` probe passed **16/16 checks**, including an offline run. The axe scan reported **zero violations** for its selected WCAG rules. Seven measured text, boundary and focus contrast pairs pass their thresholds. The local 1200 × 630 share image loads. No JavaScript errors, failed local resources or external runtime requests were observed.

**Limits:** the supplied browser connector could not launch its Chrome executable; the checks above used standalone Playwright Chromium. WebKit could not launch because native libraries were unavailable, so Safari is unverified. Screen readers, physical devices and browser-native 200% zoom were not tested. Clipboard success was tested with a controlled browser stub; clipboard denial and manual-copy recovery were also exercised. These are worker checks, not independent certification.

See [VALIDATION.md](VALIDATION.md) for the six-domain Better Interface review, corrected findings, commands and evidence. See [DESIGN.md](DESIGN.md) for the implemented system.

## Repeat browser checks

The optional validation script owns a temporary HTTP server, serves the actual export at `/preview/`, and closes its server and browser processes. Its dependencies can stay outside this repository:

```sh
npm install --prefix /tmp/swarm-signal-checks playwright@1 @axe-core/playwright
PLAYWRIGHT_BROWSERS_PATH=/tmp/swarm-signal-browsers /tmp/swarm-signal-checks/node_modules/.bin/playwright install chromium webkit
SIGNAL_CHECK_MODULES=/tmp/swarm-signal-checks/node_modules PLAYWRIGHT_BROWSERS_PATH=/tmp/swarm-signal-browsers node scripts/validate.mjs
```

WebKit additionally needs Playwright’s native system libraries. An unavailable engine is reported as a limitation, not a passed check. Functional assertion failures exit nonzero. Reports and screenshots are written to `test/scratch/validation/`, which is temporary and not part of the delivery. Selected final evidence is retained in `validation/`.

The share image source is `scripts/og-card.html`. With the same tools installed, regenerate it with `node scripts/validate.mjs --generate-og` and the environment variables above, then rebuild to copy `public/og-image.png` into `dist/`.

## Credits

Local Manrope font: [Manrope project](https://github.com/googlefonts/manrope), SIL Open Font License; license at `public/fonts/OFL.txt`. React and React DOM: MIT; notices in `licenses/` and the static export. The SVG illustrations and frog mark were created for this site.

Design review used the supplied Better Interface guidance, adapted from Jakub Krehel (MIT, commit `267330e1adfc66a718fb65fa6918c1f06d0a689e`), and the design documentation method adapted from Paul Bakaus’s Impeccable (Apache-2.0, commit `9d715cc4f5564a990ca8345abfdd5df6dc9b41c8`). Both license texts are retained in `licenses/design-guidance.txt`; see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
