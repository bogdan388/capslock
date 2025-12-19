import { test, expect } from '@playwright/test';
import { LeadFormPage } from '../pages/LeadFormPage';
import { validFormData } from '../test-data/form-data';

test.describe('Lead Form - Navigation @regression', () => {
  test('should stay on page when browser back button is pressed from step 2', async ({ page }) => {
    const leadForm = new LeadFormPage(page);

    await leadForm.goto();
    await leadForm.fillZipCode(validFormData.zipCode);
    await leadForm.submitZipCode();

    await expect(leadForm.safetyOption).toBeVisible();

    await page.goBack();
    await page.goForward();

    await leadForm.goto();
    await expect(leadForm.formContainer).toBeVisible();
  });

  test('should allow restarting form after navigation', async ({ page }) => {
    const leadForm = new LeadFormPage(page);

    await leadForm.goto();
    await leadForm.fillZipCode(validFormData.zipCode);
    await leadForm.submitZipCode();
    await leadForm.selectInterest('Safety');
    await leadForm.submitInterest();

    await expect(leadForm.ownedHouseOption).toBeVisible();

    await leadForm.goto();

    await expect(leadForm.formContainer).toBeVisible();
  });

  test('should handle browser forward button', async ({ page }) => {
    const leadForm = new LeadFormPage(page);

    await leadForm.goto();
    await leadForm.fillZipCode(validFormData.zipCode);
    await leadForm.submitZipCode();

    await expect(leadForm.safetyOption).toBeVisible();

    await page.goBack();
    await page.goForward();

    await expect(leadForm.formContainer).toBeVisible();
  });

  test('should handle page refresh on step 2', async ({ page }) => {
    const leadForm = new LeadFormPage(page);

    await leadForm.goto();
    await leadForm.fillZipCode(validFormData.zipCode);
    await leadForm.submitZipCode();

    await expect(leadForm.safetyOption).toBeVisible();

    await page.reload();

    await expect(leadForm.formContainer).toBeVisible();
  });

  test('should handle page refresh on step 4', async ({ page }) => {
    const leadForm = new LeadFormPage(page);

    await leadForm.goto();
    await leadForm.fillZipCode(validFormData.zipCode);
    await leadForm.submitZipCode();
    await leadForm.selectInterest('Safety');
    await leadForm.submitInterest();
    await leadForm.selectPropertyType('Owned House / Condo');
    await leadForm.submitPropertyType();

    await expect(leadForm.nameInput).toBeVisible();

    await page.reload();

    await expect(leadForm.formContainer).toBeVisible();
  });

  test('should preserve form data after refresh if supported', async ({ page }) => {
    const leadForm = new LeadFormPage(page);

    await leadForm.goto();
    await leadForm.fillZipCode(validFormData.zipCode);
    await leadForm.submitZipCode();
    await leadForm.selectInterest('Safety');
    await leadForm.submitInterest();
    await leadForm.selectPropertyType('Owned House / Condo');
    await leadForm.submitPropertyType();

    await leadForm.fillName(validFormData.name);
    await leadForm.fillEmail(validFormData.email);

    await page.reload();

    await expect(leadForm.formContainer).toBeVisible();
  });

  test('should handle form restart after navigation away', async ({ page }) => {
    const leadForm = new LeadFormPage(page);

    await leadForm.goto();
    await leadForm.fillZipCode(validFormData.zipCode);
    await leadForm.submitZipCode();

    await expect(leadForm.safetyOption).toBeVisible();

    await page.goto('about:blank');
    await leadForm.goto();

    await expect(leadForm.formContainer).toBeVisible();
  });
});
