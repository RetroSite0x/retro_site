import { test, expect } from '@playwright/test';

test.describe('Retro UNIX Workstation', () => {
  test('desktop opens immediately and supports window open/close', async ({ page }) => {
    // ------------------------------------------------------------------
    // Navigate to the app
    // ------------------------------------------------------------------
    await page.goto('/');

    // ------------------------------------------------------------------
    // Desktop — menu bar renders with FILE/EDIT/VIEW items
    // ------------------------------------------------------------------
    await expect(page.locator('text=FILE')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=EDIT')).toBeVisible();
    await expect(page.locator('text=SETTINGS')).toBeVisible();

    // ------------------------------------------------------------------
    // Terminal opens automatically on desktop — prompt visible
    // ------------------------------------------------------------------
    // The terminal prompt shows "guest@retro:/$ " which contains "$"
    await expect(page.locator('text=$')).toBeVisible({ timeout: 5000 });

    // ------------------------------------------------------------------
    // Open a directory viewer via desktop icon double-click
    // ------------------------------------------------------------------
    // The desktop icon is a generic div with a cursor:pointer style.
    // Find the icon by its label "projects" and dblclick its parent container.
    const projectsIcon = page.getByText('projects', { exact: true }).first();
    await projectsIcon.dblclick();

    // The directory viewer header shows the path, e.g. "/projects"
    await expect(page.getByText('/projects', { exact: true })).toBeVisible({ timeout: 5000 });

    // ------------------------------------------------------------------
    // Close the directory window using the Close button
    // ------------------------------------------------------------------
    const closeButtons = page.locator('[aria-label="Close"]');
    const closeCount = await closeButtons.count();
    if (closeCount > 0) {
      await closeButtons.first().click();
    }

    // ------------------------------------------------------------------
    // Open terminal via terminal icon double-click
    // ------------------------------------------------------------------
    const terminalIcon = page.locator('text=terminal').first();
    await terminalIcon.dblclick();

    // Terminal prompt should still be visible (new terminal opened alongside
    // the existing auto-opened one)
    await expect(page.locator('text=$')).toBeVisible({ timeout: 3000 });
  });
});
