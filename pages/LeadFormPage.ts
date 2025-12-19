import { Page, Locator } from '@playwright/test';

export class LeadFormPage {
  readonly page: Page;
  readonly formContainer: Locator;

  readonly zipCodeInput: Locator;
  readonly zipNextButton: Locator;
  readonly zipErrorMessage: Locator;

  readonly independenceOption: Locator;
  readonly safetyOption: Locator;
  readonly therapyOption: Locator;
  readonly otherOption: Locator;
  readonly interestNextButton: Locator;

  readonly ownedHouseOption: Locator;
  readonly rentalPropertyOption: Locator;
  readonly mobileHomeOption: Locator;
  readonly propertyNextButton: Locator;

  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly goToEstimateButton: Locator;
  readonly nameErrorMessage: Locator;
  readonly emailErrorMessage: Locator;

  readonly phoneInput: Locator;
  readonly submitButton: Locator;
  readonly phoneErrorMessage: Locator;

  readonly outOfAreaMessage: Locator;
  readonly outOfAreaEmailInput: Locator;
  readonly outOfAreaSubmitButton: Locator;

  readonly stepIndicator: Locator;

  constructor(page: Page) {
    this.page = page;
    this.formContainer = page.locator('#form-container-1');

    this.zipCodeInput = this.formContainer.getByRole('textbox', { name: 'Enter ZIP Code' });
    this.zipNextButton = this.formContainer.getByRole('button', { name: 'Next ' });
    this.zipErrorMessage = this.formContainer.locator('text=Wrong zip');

    this.independenceOption = this.formContainer.getByText('Independence');
    this.safetyOption = this.formContainer.getByText('Safety');
    this.therapyOption = this.formContainer.getByText('Therapy');
    this.otherOption = this.formContainer.locator('[class*="checkbox"]').filter({ hasText: 'Other' });
    this.interestNextButton = this.formContainer.getByRole('button', { name: 'Next ' });

    this.ownedHouseOption = this.formContainer.getByText('Owned House / Condo');
    this.rentalPropertyOption = this.formContainer.getByText('Rental Property');
    this.mobileHomeOption = this.formContainer.getByText('Mobile Home');
    this.propertyNextButton = this.formContainer.getByRole('button', { name: 'Next ' });

    this.nameInput = this.formContainer.getByRole('textbox', { name: 'Enter Your Name' });
    this.emailInput = this.formContainer.getByRole('textbox', { name: 'Enter Your Email' });
    this.goToEstimateButton = this.formContainer.getByRole('button', { name: 'Go To Estimate' });
    this.nameErrorMessage = this.formContainer.locator('text=Wrong name');
    this.emailErrorMessage = this.formContainer.locator('text=Wrong email');

    this.phoneInput = this.formContainer.getByRole('textbox', { name: '(XXX)XXX-XXXX' });
    this.submitButton = this.formContainer.getByRole('button', { name: 'Submit Your Request' });
    this.phoneErrorMessage = this.formContainer.locator('text=Wrong phone number');

    this.outOfAreaMessage = this.formContainer.getByText(/Sorry, unfortunately we don.t yet install in your area/);
    this.outOfAreaEmailInput = this.formContainer.getByRole('textbox', { name: 'Email Address' });
    this.outOfAreaSubmitButton = this.formContainer.getByRole('button', { name: 'Submit' });

    this.stepIndicator = this.formContainer.locator('text=/\\d+ of \\d+/');
  }

  async goto() {
    await this.page.goto('/');
    await this.formContainer.scrollIntoViewIfNeeded();
  }

  async fillZipCode(zipCode: string) {
    await this.zipCodeInput.fill(zipCode);
  }

  async submitZipCode() {
    await this.zipNextButton.click();
  }

  async selectInterest(interest: 'Independence' | 'Safety' | 'Therapy' | 'Other') {
    const optionMap = {
      Independence: this.independenceOption,
      Safety: this.safetyOption,
      Therapy: this.therapyOption,
      Other: this.otherOption,
    };
    await optionMap[interest].click();
  }

  async submitInterest() {
    await this.interestNextButton.click();
  }

  async selectPropertyType(type: 'Owned House / Condo' | 'Rental Property' | 'Mobile Home') {
    const optionMap = {
      'Owned House / Condo': this.ownedHouseOption,
      'Rental Property': this.rentalPropertyOption,
      'Mobile Home': this.mobileHomeOption,
    };
    await optionMap[type].click();
  }

  async submitPropertyType() {
    await this.propertyNextButton.click();
  }

  async fillName(name: string) {
    await this.nameInput.fill(name);
  }

  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }

  async submitNameAndEmail() {
    await this.goToEstimateButton.click();
  }

  async fillPhone(phone: string) {
    await this.phoneInput.click();
    await this.phoneInput.pressSequentially(phone, { delay: 50 });
  }

  async submitPhone() {
    await this.submitButton.scrollIntoViewIfNeeded();
    await this.submitButton.click();
  }

  async fillOutOfAreaEmail(email: string) {
    await this.outOfAreaEmailInput.fill(email);
  }

  async submitOutOfAreaEmail() {
    await this.outOfAreaSubmitButton.click();
  }

  async getCurrentStep(): Promise<string> {
    return await this.stepIndicator.textContent() || '';
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
}
