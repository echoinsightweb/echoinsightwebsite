import { test, expect } from '@playwright/test';

test.describe('Navigation and Basic Rendering', () => {
  test('Home page renders correctly', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Echo & Insight/i);
    // Check if hero section and Know Your Counsellor CTA exist
    const ctaButton = page.getByRole('link', { name: /Know Your Counsellor/i }).first();
    await expect(ctaButton).toBeVisible();
    await expect(ctaButton).toHaveAttribute('href', '/book?type=free');
  });

  test('About page renders correctly', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.getByText(/About/i).first()).toBeVisible();
  });

  test('Services page renders correctly', async ({ page }) => {
    await page.goto('/services');
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.getByText(/Services/i).first()).toBeVisible();
    // Check if Know Your Counsellor CTA exists in header or body
    const ctaButton = page.getByRole('link', { name: /Book Free Session/i }).first();
    await expect(ctaButton).toBeVisible();
  });
});
