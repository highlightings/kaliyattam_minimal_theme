// Optional Playwright smoke test (SKELETON, not run against your site).
// Run after every core / contrib update:
//   BASE_URL=https://kaliyattam.com USER_NAME=... USER_PASS=... npx playwright test tests/smoke.spec.js
// Use a normal contributor account: administrators get the admin theme (Claro)
// on node add/edit by design, so they would not see the composer.
const { test, expect } = require('@playwright/test');

const base = process.env.BASE_URL || 'http://localhost';

test.beforeEach(async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.errors = errors;
  await page.goto(`${base}/user/login`);
  await page.fill('#edit-name', process.env.USER_NAME);
  await page.fill('#edit-pass', process.env.USER_PASS);
  await page.click('#edit-submit');
});

test.afterEach(async ({ page }) => {
  expect(page.errors, 'no console errors').toEqual([]);
});

test('post composer renders and media library keeps the form open', async ({ page }) => {
  await page.goto(`${base}/node/add/post`);
  await expect(page.locator('form.composer')).toBeVisible();
  await expect(page.locator('form.composer .ck-editor__editable')).toBeVisible();

  // Open the media library, pick the first item, insert it.
  await page.click('.js-media-library-open-button');
  await page.waitForSelector('.ui-dialog .media-library-views-form');
  await page.locator('.ui-dialog .media-library-item input[type=checkbox]').first().check();
  await page.click('.ui-dialog .ui-dialog-buttonpane button:has-text("Insert selected")');

  // The regression we care about: the form must still be on screen.
  await expect(page.locator('form.composer')).toBeVisible();
  await expect(page.locator('form.composer .media-library-selection .media-library-item')).toHaveCount(1);
});

test('event form renders', async ({ page }) => {
  await page.goto(`${base}/node/add/event`);
  await expect(page.locator('form.composer')).toBeVisible();
  await expect(page.locator('form.composer [class*="smartdate"]').first()).toBeVisible();
});

test('dark mode toggle persists', async ({ page }) => {
  await page.goto(base);
  await page.click('[data-theme-toggle]');
  await expect(page.locator('html')).toHaveAttribute('data-theme', /dark|light/);
  const first = await page.locator('html').getAttribute('data-theme');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', first);
});
