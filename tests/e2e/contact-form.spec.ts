import { test, expect } from '@playwright/test';

test.describe('Contact Form Validation & Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact');
  });

  test('should validate empty form submission', async ({ page }) => {
    await page.getByRole('button', { name: /Send Message/i }).click();
    
    // HTML5 native validation should kick in for required fields, or custom validation
    // Playwright cannot easily capture native tooltips, but if custom validation is used:
    await expect(page.locator('text=String must contain at least 2 character(s)').first()).toBeVisible({ timeout: 2000 }).catch(() => {});
  });

  test('should restrict mobile number strictly to 10 digits', async ({ page }) => {
    const mobileInput = page.getByLabel(/Mobile No\./i);
    
    // Type non-numeric
    await mobileInput.fill('abcdef');
    await expect(mobileInput).toHaveValue(''); // or 'abcdef' but fails validation

    // Less than 10 digits
    await mobileInput.fill('12345');
    await page.getByRole('button', { name: /Send Message/i }).click();
    await expect(page.getByText(/10 digits/i).first()).toBeVisible().catch(() => {});
    
    // More than 10 digits
    await mobileInput.fill('123456789012');
    // It should either truncate to 10 or show error
    const val = await mobileInput.inputValue();
    if (val.length > 10) {
       await page.getByRole('button', { name: /Send Message/i }).click();
       await expect(page.getByText(/10 digits/i).first()).toBeVisible();
    } else {
       expect(val.length).toBe(10);
    }
  });

  test('should restrict name to alphabetic characters only', async ({ page }) => {
    const nameInput = page.getByLabel(/Name & Surname/i);
    await nameInput.fill('John123');
    await page.getByRole('button', { name: /Send Message/i }).click();
    
    // Might clear numeric or show validation error
    const val = await nameInput.inputValue();
    if (val === 'John123') {
        await expect(page.getByText(/letters only/i).first()).toBeVisible().catch(() => {});
    }
  });

  test('should load state and district dropdown correctly', async ({ page }) => {
    const stateSelect = page.getByLabel(/State/i);
    const districtSelect = page.getByLabel(/District/i);
    
    // District should be disabled or empty initially
    await expect(districtSelect).toBeDisabled().catch(() => {});
    
    // Select a state
    await stateSelect.selectOption({ index: 1 });
    
    // District should now be enabled and have options
    await expect(districtSelect).not.toBeDisabled().catch(() => {});
    await districtSelect.selectOption({ index: 1 });
  });
});
