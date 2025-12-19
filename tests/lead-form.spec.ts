import { test, expect } from '@playwright/test';
import { LeadFormPage } from '../pages/LeadFormPage';
import { ThankYouPage } from '../pages/ThankYouPage';
import {
  validFormData,
  invalidZipCodes,
  invalidEmails,
  invalidPhones,
  outOfAreaZipCode,
} from '../test-data/form-data';

test.describe('Lead Form - Happy Path', () => {
  test('should successfully submit the form with valid data and redirect to thank you page', async ({ page }) => {
    const leadForm = new LeadFormPage(page);
    const thankYouPage = new ThankYouPage(page);

    await leadForm.goto();

    await leadForm.fillZipCode(validFormData.zipCode);
    await leadForm.submitZipCode();

    await expect(leadForm.safetyOption).toBeVisible();
    await leadForm.selectInterest('Safety');
    await leadForm.submitInterest();

    await expect(leadForm.ownedHouseOption).toBeVisible();
    await leadForm.selectPropertyType('Owned House / Condo');
    await leadForm.submitPropertyType();

    await expect(leadForm.nameInput).toBeVisible();
    await leadForm.fillName(validFormData.name);
    await leadForm.fillEmail(validFormData.email);
    await leadForm.submitNameAndEmail();

    await expect(leadForm.phoneInput).toBeVisible();
    await leadForm.fillPhone(validFormData.phone);
    await leadForm.submitPhone();

    await thankYouPage.verifyOnThankYouPage();
    await expect(thankYouPage.confirmationMessage).toBeVisible();
  });
});

test.describe('Lead Form - ZIP Code Validation', () => {
  test('should not proceed with ZIP code less than 5 digits', async ({ page }) => {
    const leadForm = new LeadFormPage(page);

    await leadForm.goto();
    await leadForm.fillZipCode(invalidZipCodes.tooShort);
    await leadForm.submitZipCode();

    await expect(leadForm.zipCodeInput).toBeVisible();
    await expect(leadForm.safetyOption).not.toBeVisible();
  });

  test('should not proceed with ZIP code more than 5 digits', async ({ page }) => {
    const leadForm = new LeadFormPage(page);

    await leadForm.goto();
    await leadForm.fillZipCode(invalidZipCodes.tooLong);
    await leadForm.submitZipCode();

    await expect(leadForm.zipCodeInput).toBeVisible();
  });

  test('should not accept ZIP code with letters', async ({ page }) => {
    const leadForm = new LeadFormPage(page);

    await leadForm.goto();
    await leadForm.fillZipCode(invalidZipCodes.withLetters);
    await leadForm.submitZipCode();

    await expect(leadForm.zipCodeInput).toBeVisible();
    await expect(leadForm.safetyOption).not.toBeVisible();
  });

  test('should not proceed with empty ZIP code', async ({ page }) => {
    const leadForm = new LeadFormPage(page);

    await leadForm.goto();
    await leadForm.submitZipCode();

    await expect(leadForm.zipCodeInput).toBeVisible();
    await expect(leadForm.safetyOption).not.toBeVisible();
  });
});

test.describe('Lead Form - Email Validation', () => {
  test('should not proceed with invalid email format (no @ sign)', async ({ page }) => {
    const leadForm = new LeadFormPage(page);

    await leadForm.goto();
    await leadForm.completeFormUntilPhone({
      zipCode: validFormData.zipCode,
      interest: 'Safety',
      propertyType: 'Owned House / Condo',
      name: validFormData.name,
      email: invalidEmails.noAtSign,
    });

    await expect(leadForm.phoneInput).not.toBeVisible();
  });

  test('should not proceed with empty email', async ({ page }) => {
    const leadForm = new LeadFormPage(page);

    await leadForm.goto();

    await leadForm.fillZipCode(validFormData.zipCode);
    await leadForm.submitZipCode();
    await leadForm.selectInterest('Safety');
    await leadForm.submitInterest();
    await leadForm.selectPropertyType('Owned House / Condo');
    await leadForm.submitPropertyType();

    await leadForm.fillName(validFormData.name);
    await leadForm.submitNameAndEmail();

    await expect(leadForm.phoneInput).not.toBeVisible();
  });
});

test.describe('Lead Form - Phone Validation', () => {
  test('should not submit with phone number less than 10 digits', async ({ page }) => {
    const leadForm = new LeadFormPage(page);

    await leadForm.goto();
    await leadForm.completeFormUntilPhone({
      zipCode: validFormData.zipCode,
      interest: 'Safety',
      propertyType: 'Owned House / Condo',
      name: validFormData.name,
      email: validFormData.email,
    });

    await leadForm.fillPhone(invalidPhones.tooShort);
    await leadForm.submitPhone();

    await expect(leadForm.phoneErrorMessage).toBeVisible();
    await expect(page).not.toHaveURL(/.*\/thankyou/);
  });

  test('should not submit with empty phone number', async ({ page }) => {
    const leadForm = new LeadFormPage(page);

    await leadForm.goto();
    await leadForm.completeFormUntilPhone({
      zipCode: validFormData.zipCode,
      interest: 'Safety',
      propertyType: 'Owned House / Condo',
      name: validFormData.name,
      email: validFormData.email,
    });

    await leadForm.submitPhone();

    await expect(page).not.toHaveURL(/.*\/thankyou/);
  });
});

test.describe('Lead Form - Out of Area Flow', () => {
  test('should show out of area message for non-Michigan ZIP codes', async ({ page }) => {
    const leadForm = new LeadFormPage(page);

    await leadForm.goto();
    await leadForm.fillZipCode(outOfAreaZipCode);
    await leadForm.submitZipCode();

    await expect(leadForm.outOfAreaMessage).toBeVisible();
    await expect(leadForm.outOfAreaEmailInput).toBeVisible();
  });

  test('should allow email signup for out of area users', async ({ page }) => {
    const leadForm = new LeadFormPage(page);

    await leadForm.goto();
    await leadForm.fillZipCode(outOfAreaZipCode);
    await leadForm.submitZipCode();

    await expect(leadForm.outOfAreaEmailInput).toBeVisible();
    await leadForm.fillOutOfAreaEmail(validFormData.email);

    await expect(leadForm.outOfAreaEmailInput).toHaveValue(validFormData.email);
  });
});

test.describe('Lead Form - Required Fields', () => {
  test('should not proceed from step 4 without name', async ({ page }) => {
    const leadForm = new LeadFormPage(page);

    await leadForm.goto();

    await leadForm.fillZipCode(validFormData.zipCode);
    await leadForm.submitZipCode();
    await leadForm.selectInterest('Safety');
    await leadForm.submitInterest();
    await leadForm.selectPropertyType('Owned House / Condo');
    await leadForm.submitPropertyType();

    await leadForm.fillEmail(validFormData.email);
    await leadForm.submitNameAndEmail();

    await expect(leadForm.phoneInput).not.toBeVisible();
  });
});

test.describe('Lead Form - Multi-step Navigation', () => {
  test('should display correct step indicator during form progression', async ({ page }) => {
    const leadForm = new LeadFormPage(page);

    await leadForm.goto();

    await leadForm.fillZipCode(validFormData.zipCode);
    await leadForm.submitZipCode();

    const step2Text = await leadForm.getCurrentStep();
    expect(step2Text).toContain('2 of 5');

    await leadForm.selectInterest('Safety');
    await leadForm.submitInterest();

    await leadForm.selectPropertyType('Owned House / Condo');
    await leadForm.submitPropertyType();

    const step4Text = await leadForm.getCurrentStep();
    expect(step4Text).toContain('4 of 5');

    await leadForm.fillName(validFormData.name);
    await leadForm.fillEmail(validFormData.email);
    await leadForm.submitNameAndEmail();

    const step5Text = await leadForm.getCurrentStep();
    expect(step5Text).toContain('5 of 5');
  });

  test('should allow selecting multiple interests in step 2', async ({ page }) => {
    const leadForm = new LeadFormPage(page);

    await leadForm.goto();
    await leadForm.fillZipCode(validFormData.zipCode);
    await leadForm.submitZipCode();

    await leadForm.selectInterest('Safety');
    await leadForm.selectInterest('Independence');
    await leadForm.selectInterest('Therapy');

    await leadForm.submitInterest();

    await expect(leadForm.ownedHouseOption).toBeVisible();
  });
});
