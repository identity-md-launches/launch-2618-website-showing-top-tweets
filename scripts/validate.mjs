// Optional browser checks. Install Playwright and @axe-core/playwright outside the
// repository, and set SIGNAL_CHECK_MODULES to that directory's node_modules path.
// This bounded script owns and closes its preview server and browser processes.
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';

const root = resolve('.');
const output = resolve('test/scratch/validation');
await mkdir(output, { recursive: true });
const modules = process.env.SIGNAL_CHECK_MODULES;
const { chromium, webkit } = await import(modules ? pathToFileURL(resolve(modules, 'playwright/index.mjs')).href : 'playwright');
const { default: AxeBuilder } = await import(modules ? pathToFileURL(resolve(modules, '@axe-core/playwright/dist/index.mjs')).href : '@axe-core/playwright');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.txt': 'text/plain' };
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const relative = decodeURIComponent(url.pathname);
    const path = relative.startsWith('/preview/') ? resolve(root, 'dist', relative.slice(9) || 'index.html') : resolve(root, relative.slice(1));
    if (!path.startsWith(root + sep)) { res.writeHead(403).end(); return; }
    const body = await readFile(path);
    res.writeHead(200, { 'Content-Type': mime[extname(path)] || 'application/octet-stream' }); res.end(body);
  } catch { res.writeHead(404).end('Not found'); }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const base = `http://127.0.0.1:${server.address().port}`;
const results = [];
const check = (name, test) => { results.push({ name, passed: Boolean(test) }); assert.ok(test, name); };
const browsers = [];
try {
  for (const [name, engine] of [['Chromium', chromium], ['WebKit', webkit]]) {
    let browser;
    try { browser = await engine.launch({ headless: true }); }
    catch (error) { results.push({ name: `${name} launch`, passed: false, limitation: error.message }); continue; }
    browsers.push(browser);
    if (process.argv.includes('--generate-og') && name === 'Chromium') {
      const artwork = await browser.newPage({ viewport: { width: 1200, height: 630 } });
      await artwork.goto(base + '/scripts/og-card.html'); await artwork.evaluate(() => document.fonts.ready);
      await artwork.screenshot({ path: resolve(root, 'public/og-image.png') });
      await artwork.close();
    }
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    const errors = [], failures = [], externalRequests = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`); });
    page.on('request', request => { if (!request.url().startsWith(base)) externalRequests.push(request.url()); });
    await page.goto(base + '/preview/'); await page.evaluate(() => document.fonts.ready);
    check(`${name}: six posts render`, await page.locator('article').count() === 6);
    check(`${name}: most liked first`, (await page.locator('article h3').first().textContent()) === 'A more resilient swarm');
    check(`${name}: local font loaded`, await page.evaluate(() => document.fonts.check('400 16px Manrope')));
    await page.keyboard.press('Tab');
    check(`${name}: keyboard skip link`, await page.evaluate(() => document.activeElement?.textContent === 'Skip to posts'));
    await page.keyboard.press('Enter');
    check(`${name}: skip reaches main`, await page.evaluate(() => document.activeElement?.id === 'content'));
    await page.goto(base + '/preview/');
    for (let step = 0; step < 12; step++) {
      await page.keyboard.press('Tab');
      if (await page.evaluate(() => document.activeElement?.getAttribute('aria-label') === 'About')) break;
    }
    await page.keyboard.press('Enter');
    check(`${name}: keyboard opens dialog`, await page.getByRole('dialog').isVisible());
    for (let step = 0; step < 5; step++) await page.keyboard.press('Tab');
    check(`${name}: modal keeps keyboard focus inside`, await page.evaluate(() => document.querySelector('dialog').contains(document.activeElement)));
    await page.keyboard.press('Escape');
    await page.keyboard.press('Tab'); await page.keyboard.press('Tab');
    check(`${name}: keyboard reaches search`, await page.evaluate(() => document.activeElement?.id === 'post-search'));
    await page.keyboard.insertText('taylor');
    check(`${name}: keyboard search`, await page.locator('article').count() === 1);
    await page.keyboard.press('ControlOrMeta+A'); await page.keyboard.press('Backspace');

    await page.getByRole('button', { name: 'Building', exact: true }).click();
    check(`${name}: topic filter`, await page.locator('article').count() === 2);
    await page.getByRole('button', { name: 'All posts', exact: true }).click();
    await page.getByRole('searchbox', { name: 'Search posts or people' }).fill('TAYLOR');
    check(`${name}: case-insensitive author search`, await page.locator('article').count() === 1);
    await page.getByRole('button', { name: 'Clear search', exact: true }).click();
    await page.getByRole('searchbox').fill('no-such-signal');
    check(`${name}: search empty state`, await page.getByRole('heading', { name: 'No signals found' }).isVisible());
    await page.getByRole('button', { name: 'Clear filters', exact: true }).click();
    check(`${name}: empty-state recovery`, await page.locator('article').count() === 6);

    await page.getByLabel('Sort posts').selectOption('latest');
    check(`${name}: latest sort`, (await page.locator('article h3').first().textContent()) === 'Back in the pond');
    await page.getByLabel('Sort posts').selectOption('replies');
    check(`${name}: discussion sort`, (await page.locator('article h3').first().textContent()) === 'A more resilient swarm');
    await page.getByLabel('Sort posts').selectOption('likes');
    const save = page.getByRole('button', { name: 'Save A more resilient swarm', exact: true });
    await save.click();
    check(`${name}: bookmark pressed state`, await page.getByRole('button', { name: 'Unsave A more resilient swarm', exact: true }).getAttribute('aria-pressed') === 'true');
    await page.reload();
    check(`${name}: bookmark persists on reload`, await page.getByRole('button', { name: 'Unsave A more resilient swarm', exact: true }).count() === 1);
    await page.getByRole('link', { name: /Saved/ }).click();
    check(`${name}: saved view`, await page.locator('article').count() === 1);
    await page.getByRole('button', { name: 'Unsave A more resilient swarm', exact: true }).click();
    check(`${name}: saved empty state`, await page.getByRole('heading', { name: 'Keep a little signal' }).isVisible());
    await page.getByRole('link', { name: 'Explore the feed' }).click();
    check(`${name}: saved recovery`, await page.locator('article').count() === 6);
    await page.goBack();
    check(`${name}: browser history`, await page.getByRole('heading', { name: 'Keep a little signal' }).isVisible());
    await page.goForward();

    await page.getByRole('button', { name: 'About', exact: true }).click();
    check(`${name}: about dialog`, await page.getByRole('dialog').isVisible());
    await page.keyboard.press('Escape');
    check(`${name}: Escape and focus return`, !(await page.getByRole('dialog').isVisible()) && await page.getByRole('button', { name: 'About', exact: true }).evaluate(el => document.activeElement === el));
    await page.getByRole('button', { name: 'Share A more resilient swarm', exact: true }).click();
    check(`${name}: share original URL`, (await page.getByLabel('Original post link').inputValue()) === 'https://x.com/surfcoderepeat/status/2113665568414773675');
    await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => { throw new Error('deliberate clipboard denial'); } } }));
    await page.getByRole('button', { name: 'Copy link', exact: true }).click();
    check(`${name}: clipboard denial has manual recovery`, await page.getByText('Copy isn’t available here. Select and copy the link above.').isVisible());
    check(`${name}: recovery selects entire URL`, await page.getByLabel('Original post link').evaluate(el => el.selectionStart === 0 && el.selectionEnd === el.value.length));
    await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async (value) => { window.__copied = value; } } }));
    await page.getByRole('button', { name: 'Copy link', exact: true }).click();
    check(`${name}: clipboard success`, await page.getByRole('button', { name: 'Copied', exact: true }).isVisible() && await page.evaluate(() => window.__copied === document.getElementById('share-link').value));
    await page.keyboard.press('Escape');

    await page.locator('article').first().locator('summary').click();
    check(`${name}: source disclosure`, await page.locator('article').first().getByRole('link', { name: /View source/ }).isVisible());
    await page.locator('article').first().locator('summary').click();
    check(`${name}: valid original links`, await page.locator('a.read-post').evaluateAll(elements => elements.every(el => /^https:\/\/x.com\/[A-Za-z0-9_]+\/status\/\d+$/.test(el.href) && el.target === '_blank' && el.rel.includes('noreferrer'))));

    // Malformed or blocked storage must never prevent reading the feed.
    await page.evaluate(() => localStorage.setItem('swarm-signal:saved:v1', '{broken-json'));
    await page.reload();
    check(`${name}: corrupt storage recovery`, await page.locator('article').count() === 6);
    await page.evaluate(() => { Storage.prototype.setItem = function () { throw new Error('deliberate storage denial'); }; });
    await page.getByRole('button', { name: 'Save A more resilient swarm', exact: true }).click();
    check(`${name}: storage failure disclosed`, await page.getByText('Browser storage is unavailable. Saves last until you close this page.').isVisible());
    await page.reload();
    await page.evaluate(() => localStorage.clear()); await page.reload();

    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 844 }); await page.evaluate(() => window.scrollTo(0, 0));
      check(`${name}: ${width}px no horizontal overflow`, await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth));
      if ([390, 1440].includes(width)) {
        await page.screenshot({ path: resolve(output, `${name.toLowerCase()}-${width}.png`), fullPage: true });
        await page.screenshot({ path: resolve(output, `${name.toLowerCase()}-${width}-viewport.png`) });
      }
      if (width === 390) {
        check(`${name}: product on first screen`, await page.locator('article h3').first().evaluate(el => el.getBoundingClientRect().bottom < innerHeight));
        check(`${name}: primary action on first screen`, await page.locator('.read-post').first().evaluate(el => el.getBoundingClientRect().bottom <= innerHeight));
        const before = await page.locator('.header-inner').boundingBox();
        await page.getByRole('button', { name: 'Save A more resilient swarm', exact: true }).click();
        const after = await page.locator('.header-inner').boundingBox();
        check(`${name}: saved count does not wrap header`, before.height === after.height);
        await page.getByRole('button', { name: 'Unsave A more resilient swarm', exact: true }).click();
      }
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.keyboard.press('Tab');
    await page.getByRole('searchbox').focus();
    await page.screenshot({ path: resolve(output, `${name.toLowerCase()}-focus.png`) });
    const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    await writeFile(resolve(output, `${name.toLowerCase()}-axe.json`), JSON.stringify(axe.violations, null, 2));
    check(`${name}: axe accessibility scan`, axe.violations.length === 0);
    const contrast = await page.evaluate(() => {
      const rgb = value => value.match(/[\d.]+/g).slice(0, 3).map(Number);
      const luminance = value => rgb(value).map(c => c / 255).map(c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4).reduce((sum, c, i) => sum + c * [.2126, .7152, .0722][i], 0);
      const pair = (name, fg, bg, minimum) => {
        const levels = [luminance(fg), luminance(bg)].sort((a, b) => b - a);
        return { name, foreground: fg, background: bg, ratio: Number(((levels[0] + .05) / (levels[1] + .05)).toFixed(2)), minimum };
      };
      const css = selector => getComputedStyle(document.querySelector(selector));
      return [
        pair('Post body', css('.post-content > p').color, css('.post-card').backgroundColor, 4.5),
        pair('Muted report text', css('.report-note').color, css('.pond-panel').backgroundColor, 4.5),
        pair('Read on X link', css('.read-post').color, css('.post-card').backgroundColor, 4.5),
        pair('Primary button', css('.hero .primary-button').color, css('.hero .primary-button').backgroundColor, 4.5),
        pair('Input boundary', css('.search-field').borderTopColor, css('.search-field').backgroundColor, 3),
        pair('Search focus against input', css('.search-field').outlineColor, css('.search-field').backgroundColor, 3),
        pair('Search focus against page', css('.search-field').outlineColor, css('body').backgroundColor, 3),
      ];
    });
    await writeFile(resolve(output, `${name.toLowerCase()}-contrast.json`), JSON.stringify(contrast, null, 2));
    check(`${name}: measured text and UI contrast`, contrast.every(pair => pair.ratio >= pair.minimum));
    check(`${name}: local share image loads at 1200 × 630`, await page.evaluate(() => new Promise(resolve => { const image = new Image(); image.onload = () => resolve(image.naturalWidth === 1200 && image.naturalHeight === 630); image.onerror = () => resolve(false); image.src = document.querySelector('meta[property="og:image"]').content; })));
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
    check(`${name}: 200% text enlargement reflows`, await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth));
    await page.evaluate(() => { document.documentElement.style.fontSize = ''; document.documentElement.dir = 'rtl'; });
    check(`${name}: RTL layout has no horizontal overflow`, await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth));
    await page.evaluate(() => { document.documentElement.dir = 'ltr'; });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    check(`${name}: no animation under reduced motion`, await page.evaluate(() => document.getAnimations().length === 0));
    check(`${name}: no runtime errors`, errors.length === 0);
    check(`${name}: no failed local resources`, failures.length === 0);
    check(`${name}: no external runtime requests`, externalRequests.length === 0);
    await context.close();
  }

} finally {
  await Promise.all(browsers.map(browser => browser.close()));
  await new Promise(done => server.close(done));
  await writeFile(resolve(output, 'interactions.json'), JSON.stringify({ results }, null, 2));
  process.stdout.write(JSON.stringify({ passed: results.filter(r=>r.passed).length, limitations: results.filter(r=>!r.passed), results }, null, 2) + '\n');
}
