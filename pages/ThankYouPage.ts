import { Page, Locator, expect } from '@playwright/test';

export class ThankYouPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly confirmationMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Thank you!' });
    this.confirmationMessage = page.getByText('We will be calling within the next 10 minutes');
  }

  async verifyOnThankYouPage() {
    await expect(this.page).toHaveURL(/.*\/thankyou/);
    await expect(this.heading).toBeVisible();
  }
}
