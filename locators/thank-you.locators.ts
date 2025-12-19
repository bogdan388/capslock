import { Page, Locator } from '@playwright/test';

export class ThankYouLocators {
  readonly heading: Locator;
  readonly confirmationMessage: Locator;

  constructor(page: Page) {
    this.heading = page.getByRole('heading', { name: 'Thank you!' });
    this.confirmationMessage = page.getByText('We will be calling within the next 10 minutes');
  }
}
