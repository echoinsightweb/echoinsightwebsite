import { test, expect } from '@playwright/test';

test.describe('Booking and Website Navigation', () => {
  test('should navigate to the home page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Echo & Insight/i);
  });

  test('should navigate to the booking page', async ({ page }) => {
    await page.goto('/book');
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.getByText(/Book Appointment/i).first()).toBeVisible();
  });

  test('should navigate to the contact page and verify form', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should navigate to the admin login page', async ({ page }) => {
    await page.goto('/admin/login');
    await expect(page.getByText(/Admin Portal/i).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /Sign in with Google/i })).toBeVisible();
  });
});
