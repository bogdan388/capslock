import { Page, expect } from '@playwright/test';
import { LeadFormLocators } from '../locators/lead-form.locators';

export class LeadFormPage {
  readonly page: Page;
  private readonly locators: LeadFormLocators;

  constructor(page: Page) {
    this.page = page;
    this.locators = new LeadFormLocators(page);
  }

  async goto() {
    await this.page.goto('/');
    await this.locators.formContainer.scrollIntoViewIfNeeded();
  }

  async fillZipCode(zipCode: string) {
    await this.locators.zipCodeInput.fill(zipCode);
  }

  async clearZipCode() {
    await this.locators.zipCodeInput.fill('');
  }

  async submitZipCode() {
    await this.locators.zipNextButton.click();
  }

  async selectInterest(interest: 'Independence' | 'Safety' | 'Therapy' | 'Other') {
    const optionMap = {
      Independence: this.locators.independenceOption,
      Safety: this.locators.safetyOption,
      Therapy: this.locators.therapyOption,
      Other: this.locators.otherOption,
    };
    await optionMap[interest].click();
  }

  async submitInterest() {
    await this.locators.interestNextButton.click();
  }

  async selectPropertyType(type: 'Owned House / Condo' | 'Rental Property' | 'Mobile Home') {
    const optionMap = {
      'Owned House / Condo': this.locators.ownedHouseOption,
      'Rental Property': this.locators.rentalPropertyOption,
      'Mobile Home': this.locators.mobileHomeOption,
    };
    await optionMap[type].click();
  }

  async submitPropertyType() {
    await this.locators.propertyNextButton.click();
  }

  async fillName(name: string) {
    await this.locators.nameInput.fill(name);
  }

  async fillEmail(email: string) {
    await this.locators.emailInput.fill(email);
  }

  async submitNameAndEmail() {
    await this.locators.goToEstimateButton.click();
  }

  async fillPhone(phone: string) {
    await this.locators.phoneInput.click();
    await this.locators.phoneInput.pressSequentially(phone, { delay: 50 });
  }

  async submitPhone() {
    await this.locators.submitButton.scrollIntoViewIfNeeded();
    await this.locators.submitButton.click();
  }

  async fillOutOfAreaEmail(email: string) {
    await this.locators.outOfAreaEmailInput.fill(email);
  }

  async submitOutOfAreaEmail() {
    await this.locators.outOfAreaSubmitButton.click();
  }

  async getCurrentStep(): Promise<string> {
    return await this.locators.stepIndicator.textContent() || '';
  }

  async completeFormUntilPhone(data: {
    zipCode: string;
    interest: 'Independence' | 'Safety' | 'Therapy' | 'Other';
    propertyType: 'Owned House / Condo' | 'Rental Property' | 'Mobile Home';
    name: string;
    email: string;
  }) {
    await this.fillZipCode(data.zipCode);
    await this.submitZipCode();
    await this.selectInterest(data.interest);
    await this.submitInterest();
    await this.selectPropertyType(data.propertyType);
    await this.submitPropertyType();
    await this.fillName(data.name);
    await this.fillEmail(data.email);
    await this.submitNameAndEmail();
  }

  async completeFullForm(data: {
    zipCode: string;
    interest: 'Independence' | 'Safety' | 'Therapy' | 'Other';
    propertyType: 'Owned House / Condo' | 'Rental Property' | 'Mobile Home';
    name: string;
    email: string;
    phone: string;
  }) {
    await this.completeFormUntilPhone(data);
    await this.fillPhone(data.phone);
    await this.submitPhone();
  }

  async expectFormContainerVisible() {
    await expect(this.locators.formContainer).toBeVisible();
  }

  async expectFormContainerVisibleWithTimeout(timeout: number) {
    await expect(this.locators.formContainer).toBeVisible({ timeout });
  }

  async expectZipCodeInputVisible() {
    await expect(this.locators.zipCodeInput).toBeVisible();
  }

  async expectZipErrorVisible() {
    await expect(this.locators.zipErrorMessage).toBeVisible();
  }

  async expectInterestOptionsVisible() {
    await expect(this.locators.safetyOption).toBeVisible();
  }

  async expectInterestOptionsNotVisible() {
    await expect(this.locators.safetyOption).not.toBeVisible();
  }

  async expectPropertyOptionsVisible() {
    await expect(this.locators.ownedHouseOption).toBeVisible();
  }

  async expectNameInputVisible() {
    await expect(this.locators.nameInput).toBeVisible();
  }

  async expectPhoneInputVisible() {
    await expect(this.locators.phoneInput).toBeVisible();
  }

  async expectPhoneInputNotVisible() {
    await expect(this.locators.phoneInput).not.toBeVisible();
  }

  async expectPhoneErrorVisible() {
    await expect(this.locators.phoneErrorMessage).toBeVisible();
  }

  async expectOutOfAreaMessageVisible() {
    await expect(this.locators.outOfAreaMessage).toBeVisible();
  }

  async expectOutOfAreaEmailInputVisible() {
    await expect(this.locators.outOfAreaEmailInput).toBeVisible();
  }

  async expectOutOfAreaEmailValue(email: string) {
    await expect(this.locators.outOfAreaEmailInput).toHaveValue(email);
  }

  async expectNotOnThankYouPage() {
    await expect(this.page).not.toHaveURL(/.*\/thankyou/);
  }

  expectStepContains(stepText: string, expected: string) {
    expect(stepText).toContain(expected);
  }
}
