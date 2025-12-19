import { Page, expect } from '@playwright/test';
import { ThankYouLocators } from '../locators/thank-you.locators';

export class ThankYouPage {
  readonly page: Page;
  private readonly locators: ThankYouLocators;

  constructor(page: Page) {
    this.page = page;
    this.locators = new ThankYouLocators(page);
  }

  async expectOnThankYouPage() {
    await expect(this.page).toHaveURL(/.*\/thankyou/);
    await expect(this.locators.heading).toBeVisible();
  }

  async expectConfirmationMessageVisible() {
    await expect(this.locators.confirmationMessage).toBeVisible();
  }
}
