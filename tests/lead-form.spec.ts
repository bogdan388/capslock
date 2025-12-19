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

test.describe('Lead Form - Happy Path @smoke @critical', () => {
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

const zipCodeTestCases = [
  { name: 'too short', value: invalidZipCodes.tooShort, description: 'less than 5 digits' },
  { name: 'too long', value: invalidZipCodes.tooLong, description: 'more than 5 digits' },
  { name: 'with letters', value: invalidZipCodes.withLetters, description: 'containing letters' },
  { name: 'empty', value: '', description: 'empty value' },
];

test.describe('Lead Form - ZIP Code Validation @regression', () => {
  for (const testCase of zipCodeTestCases) {
    test(`should not proceed with ZIP code ${testCase.description}`, async ({ page }) => {
      const leadForm = new LeadFormPage(page);

      await leadForm.goto();
      if (testCase.value) {
        await leadForm.fillZipCode(testCase.value);
      }
      await leadForm.submitZipCode();

      await expect(leadForm.zipCodeInput).toBeVisible();
      await expect(leadForm.safetyOption).not.toBeVisible();
    });
  }
});

const emailTestCases = [
  { name: 'no @ sign', value: invalidEmails.noAtSign },
  { name: 'no domain', value: invalidEmails.noDomain },
  { name: 'no username', value: invalidEmails.noUsername },
];

test.describe('Lead Form - Email Validation @regression', () => {
  for (const testCase of emailTestCases) {
    test(`should not proceed with invalid email (${testCase.name})`, async ({ page }) => {
      const leadForm = new LeadFormPage(page);

      await leadForm.goto();
      await leadForm.completeFormUntilPhone({
        zipCode: validFormData.zipCode,
        interest: 'Safety',
        propertyType: 'Owned House / Condo',
        name: validFormData.name,
        email: testCase.value,
      });

      await expect(leadForm.phoneInput).not.toBeVisible();
    });
  }

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

const phoneTestCases = [
  { name: 'too short', value: invalidPhones.tooShort },
  { name: 'with letters', value: invalidPhones.withLetters },
];

test.describe('Lead Form - Phone Validation @regression', () => {
  for (const testCase of phoneTestCases) {
    test(`should not submit with phone number ${testCase.name}`, async ({ page }) => {
      const leadForm = new LeadFormPage(page);

      await leadForm.goto();
      await leadForm.completeFormUntilPhone({
        zipCode: validFormData.zipCode,
        interest: 'Safety',
        propertyType: 'Owned House / Condo',
        name: validFormData.name,
        email: validFormData.email,
      });

      await leadForm.fillPhone(testCase.value);
      await leadForm.submitPhone();

      await expect(leadForm.phoneErrorMessage).toBeVisible();
      await expect(page).not.toHaveURL(/.*\/thankyou/);
    });
  }

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

test.describe('Lead Form - Out of Area Flow @smoke', () => {
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

test.describe('Lead Form - Required Fields @regression', () => {
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

test.describe('Lead Form - Multi-step Navigation @regression', () => {
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
