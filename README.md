# CapsLock QA Test Automation

Automated end-to-end tests for the CapsLock Walk-In Bath lead form using Playwright with TypeScript.

## Prerequisites

- Node.js 18 or higher
- npm

## Installation

```bash
npm install
npx playwright install chromium
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests with browser visible
npm run test:headed

# Run tests in debug mode
npm run test:debug

# View HTML report after tests
npm run test:report
```

## Project Structure

```
capslock/
├── tests/                  # Test specifications
│   └── lead-form.spec.ts   # Main test file
├── pages/                  # Page Object Models
│   ├── LeadFormPage.ts     # Lead form page object
│   └── ThankYouPage.ts     # Thank you page object
├── test-data/              # Test data constants
│   └── form-data.ts        # Form validation data
├── playwright.config.ts    # Playwright configuration
└── package.json
```

---

## Test Scenario Selection Rationale

### Why These Scenarios Were Selected

The 14 implemented tests cover the most critical paths of the lead generation form. Here's the rationale for each category:

#### 1. Happy Path (1 test)
- **Complete form submission with valid data**: This is the most critical scenario as it represents the primary business flow. A user successfully submitting their information is the main conversion goal.

#### 2. ZIP Code Validation (4 tests)
- ZIP code is the first user interaction and determines the entire form flow
- Invalid ZIP codes (too short, too long, with letters, empty) must be caught to prevent bad data
- ZIP codes also route users to different flows (in-area vs out-of-area)

#### 3. Email Validation (2 tests)
- Email is essential for lead follow-up and marketing
- Invalid emails result in lost business opportunities
- Required field validation prevents empty submissions

#### 4. Phone Validation (2 tests)
- Phone is the primary contact method for sales follow-up
- Invalid phone numbers make leads unreachable
- Required field validation prevents empty submissions

#### 5. Out of Area Flow (2 tests)
- Tests the alternative user journey for non-serviceable areas
- Ensures potential customers can still sign up for notifications
- Important for capturing leads in expansion areas

#### 6. Required Fields (1 test)
- Name is required for personalized follow-up
- Verifies that the form enforces mandatory fields

#### 7. Multi-step Navigation (2 tests)
- Verifies the form progression indicator works correctly
- Tests multi-select functionality on interest options
- Ensures users understand their progress through the form

---

## Identified Defects

### BUG-001: Phone Number Input Mask Issue

**Description**: When using standard `fill()` method to enter a phone number, the first digit gets dropped by the input mask.

**Steps to Reproduce**:
1. Navigate to the lead form
2. Complete steps 1-4 with valid data
3. On step 5, use `input.fill('1234567890')` to enter phone
4. Submit the form

**Expected**: Phone displays as `(123)456-7890`
**Actual**: Phone displays as `(234)567-890_` with "Wrong phone number" error

**Workaround**: Use `pressSequentially()` instead of `fill()` to type characters one by one, which works correctly with the input mask.

**Severity**: Medium - Affects automated testing, may also affect users with autofill or paste functionality.

---

## Potential Improvements

### Scalability and Maintainability

1. **Environment Configuration**: Add support for multiple environments (dev, staging, prod) using `.env` files or Playwright's project configuration.

2. **Data-Driven Testing**: Implement data-driven tests using Playwright's `test.describe.each()` for testing multiple invalid input combinations without code duplication.

3. **Custom Reporter**: Add Allure or another custom reporter for better CI/CD integration and test result visualization.

4. **API Mocking**: Implement request interception to test edge cases like network failures, slow responses, or specific API error conditions.

5. **Visual Regression Testing**: Add screenshot comparison tests for critical UI states to catch unintended visual changes.

6. **Retry Logic**: Configure smart retry strategies for flaky network-dependent tests.

7. **Test Tags**: Add tags/annotations (`@smoke`, `@regression`, `@critical`) to enable selective test execution.

### Additional Tests to Consider

- Form data persistence (if user navigates back)
- Browser back button behavior
- Mobile viewport testing
- Keyboard navigation/accessibility
- Form submission rate limiting
- Cross-browser testing (Firefox, WebKit)
- Performance metrics (page load time, interaction delays)

---

## CI Configuration (Example)

```yaml
# .github/workflows/playwright.yml
name: Playwright Tests
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm test
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Author

Bogdan Iordache
