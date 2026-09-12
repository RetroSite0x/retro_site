import { test, expect } from '@playwright/test';

test('desktop icon position persists across a reload', async ({ page }) => {
  await page.goto('/');

  const skip = page.getByRole('button', { name: /skip/i });
  if (await skip.isVisible().catch(() => false)) await skip.click();
  await expect(page.getByRole('menuitem', { name: 'FILE' })).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: /got it/i }).click({ timeout: 2500 }).catch(() => {});

  const closes = page.locator('[aria-label="Close"]');
  while ((await closes.count()) > 0) {
    await closes.first().click();
    await page.waitForTimeout(260);
  }

  const icon = page.getByText('projects', { exact: true }).first();
  const before = await icon.boundingBox();
  expect(before).not.toBeNull();

  await page.mouse.move(before!.x + 8, before!.y + 8);
  await page.mouse.down();
  await page.mouse.move(before!.x + 150, before!.y + 180, { steps: 12 });
  await page.mouse.up();
  await page.waitForTimeout(300);

  const stored = await page.evaluate(() => localStorage.getItem('nabilos-icons'));
  expect(stored).toContain('projects');

  await page.reload();
  const skip2 = page.getByRole('button', { name: /skip/i });
  if (await skip2.isVisible().catch(() => false)) await skip2.click();
  await expect(page.getByRole('menuitem', { name: 'FILE' })).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: /got it/i }).click({ timeout: 2500 }).catch(() => {});

  const after = await page.getByText('projects', { exact: true }).first().boundingBox();
  expect(after).not.toBeNull();
  expect(Math.abs(after!.x - (before!.x + 150))).toBeLessThan(12);
  expect(Math.abs(after!.y - (before!.y + 180))).toBeLessThan(12);
});
