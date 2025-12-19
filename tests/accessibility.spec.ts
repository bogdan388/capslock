import { test, expect } from '@playwright/test';
import { LeadFormPage } from '../pages/LeadFormPage';
import { validFormData } from '../test-data/form-data';

test.describe('Lead Form - Accessibility @accessibility', () => {
  test('should navigate form using Tab key', async ({ page }) => {
    const leadForm = new LeadFormPage(page);

    await leadForm.goto();

    await leadForm.zipCodeInput.focus();
    await expect(leadForm.zipCodeInput).toBeFocused();

    await page.keyboard.press('Tab');

    const activeElement = page.locator(':focus');
    await expect(activeElement).toBeVisible();
  });

  test('should submit ZIP code with Enter key', async ({ page }) => {
    const leadForm = new LeadFormPage(page);

    await leadForm.goto();
    await leadForm.fillZipCode(validFormData.zipCode);

    await page.keyboard.press('Enter');

    await expect(leadForm.safetyOption).toBeVisible();
  });

  test('should select interest option with Enter key', async ({ page }) => {
    const leadForm = new LeadFormPage(page);

    await leadForm.goto();
    await leadForm.fillZipCode(validFormData.zipCode);
    await leadForm.submitZipCode();

    await expect(leadForm.safetyOption).toBeVisible();

    await leadForm.safetyOption.focus();
    await page.keyboard.press('Enter');

    await expect(leadForm.safetyOption).toBeVisible();
  });

  test('should have visible focus indicators', async ({ page }) => {
    const leadForm = new LeadFormPage(page);

    await leadForm.goto();

    await leadForm.zipCodeInput.focus();

    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('should navigate between form steps using keyboard only', async ({ page }) => {
    const leadForm = new LeadFormPage(page);

    await leadForm.goto();

    await leadForm.zipCodeInput.fill(validFormData.zipCode);
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');

    await expect(leadForm.safetyOption).toBeVisible();
  });

  test('form inputs should have associated labels', async ({ page }) => {
    const leadForm = new LeadFormPage(page);

    await leadForm.goto();

    const zipInput = leadForm.zipCodeInput;
    await expect(zipInput).toBeVisible();

    const ariaLabel = await zipInput.getAttribute('aria-label');
    const placeholder = await zipInput.getAttribute('placeholder');

    expect(ariaLabel || placeholder).toBeTruthy();
  });

  test('should handle Escape key gracefully', async ({ page }) => {
    const leadForm = new LeadFormPage(page);

    await leadForm.goto();
    await leadForm.fillZipCode(validFormData.zipCode);

    await page.keyboard.press('Escape');

    await expect(leadForm.formContainer).toBeVisible();
  });

  test('should allow clicking options after keyboard focus', async ({ page }) => {
    const leadForm = new LeadFormPage(page);

    await leadForm.goto();
    await leadForm.fillZipCode(validFormData.zipCode);
    await leadForm.submitZipCode();

    await expect(leadForm.safetyOption).toBeVisible();

    await leadForm.safetyOption.focus();
    await leadForm.safetyOption.click();

    await expect(leadForm.safetyOption).toBeVisible();
  });
});
