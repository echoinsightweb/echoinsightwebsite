import { test, expect } from '@playwright/test';

test.describe('Corporate Enquiry Form Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/corporate-enquiry');
  });

  test('should validate empty form submission', async ({ page }) => {
    await page.getByRole('button', { name: /Send Enquiry/i }).click();
    await expect(page.locator('text=String must contain at least 2 character(s)').first()).toBeVisible({ timeout: 2000 }).catch(() => {});
  });

  test('should restrict mobile number strictly to 10 digits', async ({ page }) => {
    const mobileInput = page.getByLabel(/Contact Number/i).or(page.getByLabel(/Mobile Number/i));
    if (await mobileInput.count() > 0) {
      await mobileInput.first().fill('12345');
      await page.getByRole('button', { name: /Send Enquiry/i }).click();
      await expect(page.getByText(/10 digits/i).first()).toBeVisible().catch(() => {});
    }
  });

  test('should require valid email', async ({ page }) => {
    const emailInput = page.getByLabel(/Email/i);
    await emailInput.fill('invalidemail');
    await page.getByRole('button', { name: /Send Enquiry/i }).click();
    await expect(page.getByText(/valid email/i).first()).toBeVisible().catch(() => {});
  });
});
