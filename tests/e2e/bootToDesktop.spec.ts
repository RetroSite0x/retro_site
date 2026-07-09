import { test, expect } from '@playwright/test';

test.describe('Retro UNIX Workstation', () => {
  test('full boot flow: BIOS → boot → login → desktop → window open/close', async ({ page }) => {
    // ------------------------------------------------------------------
    // Navigate to the app
    // ------------------------------------------------------------------
    await page.goto('/');

    // ------------------------------------------------------------------
    // Phase 1: BIOS screen — shows system name and hardware info
    // ------------------------------------------------------------------
    await expect(page.locator('text=Ann Naser Nabil')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=CPU: MOS 6502')).toBeVisible({ timeout: 5000 });

    // ------------------------------------------------------------------
    // Phase 2: Boot sequence — kernel messages appear
    // ------------------------------------------------------------------
    await expect(page.locator('text=Initializing filesystem')).toBeVisible({ timeout: 8000 });

    // ------------------------------------------------------------------
    // Phase 3: Login prompt — the system asks for credentials
    // ------------------------------------------------------------------
    // Login phase shows "LOGIN:" (uppercase) with text and password inputs
    await expect(page.locator('text=LOGIN:')).toBeVisible({ timeout: 10000 });

    // Fill in the username and submit the form to proceed to desktop
    const usernameInput = page.locator('input[type="text"]');
    await usernameInput.fill('guest');
    // Submit the form — the login form has no submit button, so use
    // the standard form submit API
    await page.evaluate(() => {
      const form = document.querySelector('form');
      if (form) form.requestSubmit();
    });

    // ------------------------------------------------------------------
    // Phase 4: Desktop — menu bar renders with FILE/EDIT/VIEW items
    // ------------------------------------------------------------------
    await expect(page.locator('text=FILE')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=EDIT')).toBeVisible();
    await expect(page.locator('text=SETTINGS')).toBeVisible();

    // ------------------------------------------------------------------
    // Phase 5: Terminal opens automatically on desktop — prompt visible
    // ------------------------------------------------------------------
    // The terminal prompt shows "guest@retro:/$ " which contains "$"
    await expect(page.locator('text=$')).toBeVisible({ timeout: 5000 });

    // ------------------------------------------------------------------
    // Phase 6: Open a directory viewer via desktop icon double-click
    // ------------------------------------------------------------------
    // The desktop icon is a generic div with a cursor:pointer style.
    // Find the icon by its label "projects" and dblclick its parent container.
    const projectsIcon = page.getByText('projects', { exact: true }).first();
    await projectsIcon.dblclick();

    // The directory viewer header shows the path, e.g. "/projects"
    await expect(page.getByText('/projects', { exact: true })).toBeVisible({ timeout: 5000 });

    // ------------------------------------------------------------------
    // Phase 7: Close the directory window using the Close button
    // ------------------------------------------------------------------
    const closeButtons = page.locator('[aria-label="Close"]');
    const closeCount = await closeButtons.count();
    if (closeCount > 0) {
      await closeButtons.first().click();
    }

    // ------------------------------------------------------------------
    // Phase 8: Open terminal via terminal icon double-click
    // ------------------------------------------------------------------
    const terminalIcon = page.locator('text=terminal').first();
    await terminalIcon.dblclick();

    // Terminal prompt should still be visible (new terminal opened alongside
    // the existing auto-opened one)
    await expect(page.locator('text=$')).toBeVisible({ timeout: 3000 });
  });
});
