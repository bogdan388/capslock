import { Page, Locator } from '@playwright/test';

export class LeadFormLocators {
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
    const container = page.locator('#form-container-1');
    this.formContainer = container;

    this.zipCodeInput = container.getByRole('textbox', { name: 'Enter ZIP Code' });
    this.zipNextButton = container.getByRole('button', { name: 'Next ' });
    this.zipErrorMessage = container.locator('text=Wrong zip');

    this.independenceOption = container.getByText('Independence');
    this.safetyOption = container.getByText('Safety');
    this.therapyOption = container.getByText('Therapy');
    this.otherOption = container.locator('[class*="checkbox"]').filter({ hasText: 'Other' });
    this.interestNextButton = container.getByRole('button', { name: 'Next ' });

    this.ownedHouseOption = container.getByText('Owned House / Condo');
    this.rentalPropertyOption = container.getByText('Rental Property');
    this.mobileHomeOption = container.getByText('Mobile Home');
    this.propertyNextButton = container.getByRole('button', { name: 'Next ' });

    this.nameInput = container.getByRole('textbox', { name: 'Enter Your Name' });
    this.emailInput = container.getByRole('textbox', { name: 'Enter Your Email' });
    this.goToEstimateButton = container.getByRole('button', { name: 'Go To Estimate' });
    this.nameErrorMessage = container.locator('text=Wrong name');
    this.emailErrorMessage = container.locator('text=Wrong email');

    this.phoneInput = container.getByRole('textbox', { name: '(XXX)XXX-XXXX' });
    this.submitButton = container.getByRole('button', { name: 'Submit Your Request' });
    this.phoneErrorMessage = container.locator('text=Wrong phone number');

    this.outOfAreaMessage = container.getByText(/Sorry, unfortunately we don.t yet install in your area/);
    this.outOfAreaEmailInput = container.getByRole('textbox', { name: 'Email Address' });
    this.outOfAreaSubmitButton = container.getByRole('button', { name: 'Submit' });

    this.stepIndicator = container.locator('text=/\\d+ of \\d+/');
  }
}
