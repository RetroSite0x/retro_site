import { test, expect } from '@playwright/test';

test.describe('Retro UNIX Workstation', () => {
  test('full boot flow: typing intro → login → desktop → window open/close', async ({ page }) => {
    // ------------------------------------------------------------------
    // Navigate to the app
    // ------------------------------------------------------------------
    await page.goto('/');

    // ------------------------------------------------------------------
    // Phase 1: Typing intro — types Ann Naser Nabil's info
    // ------------------------------------------------------------------
    // The intro types immediately on load; the first command + name appear first.
    await expect(page.getByText('whoami')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Ann Naser Nabil')).toBeVisible({ timeout: 5000 });

    // ------------------------------------------------------------------
    // Phase 2: Skip the intro
    // ------------------------------------------------------------------
    // The full typing run takes ~16s. Skip renders the whole script instantly
    // and advances to login. (Also covers the reduced-motion path, where the
    // script renders immediately and no SKIP button is present.)
    const skip = page.getByRole('button', { name: /skip/i });
    if (await skip.isVisible().catch(() => false)) {
      await skip.click();
    }

    // ------------------------------------------------------------------
    // Phase 3: Login auto-submits, landing on the desktop
    // ------------------------------------------------------------------
    // LoginPrompt auto-submits with default credentials after a short beat, so
    // the deterministic end state to assert is the desktop, not the transient
    // login screen.
    await expect(page.getByRole('menuitem', { name: 'FILE' })).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('menuitem', { name: 'EDIT' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'SETTINGS' })).toBeVisible();

    // ------------------------------------------------------------------
    // Phase 4: Terminal opens automatically on desktop — prompt visible
    // ------------------------------------------------------------------
    // The terminal prompt shows "guest@retro:/home/guest$ " which contains "$"
    await expect(page.locator('text=$').first()).toBeVisible({ timeout: 10000 });

    // ------------------------------------------------------------------
    // Phase 5: Open a directory viewer via desktop icon double-click
    // ------------------------------------------------------------------
    const projectsIcon = page.getByText('projects', { exact: true }).first();
    await projectsIcon.dblclick();

    // The directory viewer header shows the path, e.g. "/projects"
    await expect(page.getByText('/projects', { exact: true }).first()).toBeVisible({ timeout: 5000 });

    // ------------------------------------------------------------------
    // Phase 6: Close the directory window using the Close button
    // ------------------------------------------------------------------
    await page.getByRole('dialog', { name: 'projects' }).getByLabel('Close').click();
    await expect(page.getByRole('dialog', { name: 'projects' })).toHaveCount(0);

    // ------------------------------------------------------------------
    // Phase 7: Open terminal via the FILE menu
    // ------------------------------------------------------------------
    await page.getByRole('menuitem', { name: 'FILE' }).click();
    await page.getByText('New Terminal').click();

    // Terminal prompt should still be visible (new terminal opened alongside
    // the existing auto-opened one)
    await expect(page.locator('text=$').first()).toBeVisible({ timeout: 3000 });
  });
});
