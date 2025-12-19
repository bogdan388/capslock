import { test, expect } from '@playwright/test';
import { LeadFormPage } from '../pages/LeadFormPage';
import { validFormData } from '../test-data/form-data';

test.describe('Lead Form - API Mocking @regression', () => {
  test('should handle network failure gracefully', async ({ page }) => {
    const leadForm = new LeadFormPage(page);

    await leadForm.goto();

    await page.route('**/api/**', (route) => {
      route.abort('failed');
    });

    await leadForm.fillZipCode(validFormData.zipCode);
    await leadForm.submitZipCode();

    await expect(leadForm.formContainer).toBeVisible();
  });

  test('should handle slow API response', async ({ page }) => {
    const leadForm = new LeadFormPage(page);

    await leadForm.goto();

    await page.route('**/api/**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      await route.continue();
    });

    await leadForm.fillZipCode(validFormData.zipCode);
    await leadForm.submitZipCode();

    await expect(leadForm.formContainer).toBeVisible();
  });

  test('should handle 500 server error', async ({ page }) => {
    const leadForm = new LeadFormPage(page);

    await leadForm.goto();

    await page.route('**/api/**', (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
    });

    await leadForm.fillZipCode(validFormData.zipCode);
    await leadForm.submitZipCode();

    await expect(leadForm.formContainer).toBeVisible();
  });

  test('should handle 429 rate limit response', async ({ page }) => {
    const leadForm = new LeadFormPage(page);

    await leadForm.goto();

    await page.route('**/api/**', (route) => {
      route.fulfill({
        status: 429,
        body: JSON.stringify({ error: 'Too Many Requests' }),
      });
    });

    await leadForm.fillZipCode(validFormData.zipCode);
    await leadForm.submitZipCode();

    await expect(leadForm.formContainer).toBeVisible();
  });

  test('should handle malformed JSON response', async ({ page }) => {
    const leadForm = new LeadFormPage(page);

    await leadForm.goto();

    await page.route('**/api/**', (route) => {
      route.fulfill({
        status: 200,
        body: 'not valid json{',
        contentType: 'application/json',
      });
    });

    await leadForm.fillZipCode(validFormData.zipCode);
    await leadForm.submitZipCode();

    await expect(leadForm.formContainer).toBeVisible();
  });

  test('should handle timeout scenario', async ({ page }) => {
    const leadForm = new LeadFormPage(page);

    await leadForm.goto();

    await page.route('**/api/**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 35000));
      await route.continue();
    });

    await leadForm.fillZipCode(validFormData.zipCode);

    const submitPromise = leadForm.submitZipCode();

    await expect(leadForm.formContainer).toBeVisible();

    await page.unroute('**/api/**');
  });
});
