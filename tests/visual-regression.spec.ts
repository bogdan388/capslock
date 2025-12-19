import { test, expect } from '@playwright/test';
import { LeadFormPage } from '../pages/LeadFormPage';
import { validFormData, outOfAreaZipCode } from '../test-data/form-data';

test.describe('Visual Regression Tests @visual', () => {
  test('step 1 - ZIP code input should match baseline', async ({ page }) => {
    const leadForm = new LeadFormPage(page);
    await leadForm.goto();

    await expect(leadForm.formContainer).toHaveScreenshot('step1-zip-input.png');
  });

  test('step 2 - interest selection should match baseline', async ({ page }) => {
    const leadForm = new LeadFormPage(page);
    await leadForm.goto();

    await leadForm.fillZipCode(validFormData.zipCode);
    await leadForm.submitZipCode();

    await expect(leadForm.safetyOption).toBeVisible();
    await expect(leadForm.formContainer).toHaveScreenshot('step2-interest-selection.png');
  });

  test('step 3 - property type selection should match baseline', async ({ page }) => {
    const leadForm = new LeadFormPage(page);
    await leadForm.goto();

    await leadForm.fillZipCode(validFormData.zipCode);
    await leadForm.submitZipCode();
    await leadForm.selectInterest('Safety');
    await leadForm.submitInterest();

    await expect(leadForm.ownedHouseOption).toBeVisible();
    await expect(leadForm.formContainer).toHaveScreenshot('step3-property-type.png');
  });

  test('step 4 - name and email input should match baseline', async ({ page }) => {
    const leadForm = new LeadFormPage(page);
    await leadForm.goto();

    await leadForm.fillZipCode(validFormData.zipCode);
    await leadForm.submitZipCode();
    await leadForm.selectInterest('Safety');
    await leadForm.submitInterest();
    await leadForm.selectPropertyType('Owned House / Condo');
    await leadForm.submitPropertyType();

    await expect(leadForm.nameInput).toBeVisible();
    await expect(leadForm.formContainer).toHaveScreenshot('step4-name-email.png');
  });

  test('step 5 - phone input should match baseline', async ({ page }) => {
    const leadForm = new LeadFormPage(page);
    await leadForm.goto();

    await leadForm.completeFormUntilPhone({
      zipCode: validFormData.zipCode,
      interest: 'Safety',
      propertyType: 'Owned House / Condo',
      name: validFormData.name,
      email: validFormData.email,
    });

    await expect(leadForm.phoneInput).toBeVisible();
    await expect(leadForm.formContainer).toHaveScreenshot('step5-phone-input.png');
  });

  test('out of area message should match baseline', async ({ page }) => {
    const leadForm = new LeadFormPage(page);
    await leadForm.goto();

    await leadForm.fillZipCode(outOfAreaZipCode);
    await leadForm.submitZipCode();

    await expect(leadForm.outOfAreaMessage).toBeVisible();
    await expect(leadForm.formContainer).toHaveScreenshot('out-of-area-message.png');
  });

  test('form with validation error should match baseline', async ({ page }) => {
    const leadForm = new LeadFormPage(page);
    await leadForm.goto();

    await leadForm.completeFormUntilPhone({
      zipCode: validFormData.zipCode,
      interest: 'Safety',
      propertyType: 'Owned House / Condo',
      name: validFormData.name,
      email: validFormData.email,
    });

    await leadForm.fillPhone('123');
    await leadForm.submitPhone();

    await expect(leadForm.phoneErrorMessage).toBeVisible();
    await expect(leadForm.formContainer).toHaveScreenshot('phone-validation-error.png');
  });
});
