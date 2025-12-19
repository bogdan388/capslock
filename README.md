# CapsLock QA Test Automation

Automated end-to-end tests for the CapsLock Walk-In Bath lead form using Playwright with TypeScript.

## Prerequisites

- Node.js 18 or higher
- npm
- Allure CLI (optional, for Allure reports)

## Installation

```bash
npm install
npx playwright install --with-deps
```

## Running Tests

```bash
# Run all tests (all browsers)
npm test

# Run specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
npx playwright test --project=mobile-chrome
npx playwright test --project=mobile-safari

# Run tests with browser visible
npm run test:headed

# Run tests in debug mode
npm run test:debug

# View HTML report after tests
npm run test:report
```

## Test Tags

Run tests by category using grep patterns:

```bash
# Smoke tests (critical path)
npm run test:smoke

# Regression tests (full validation)
npm run test:regression

# Critical tests only
npm run test:critical

# Performance tests
npm run test:performance
```

## Environment Configuration

Run tests against different environments:

```bash
# Staging (default)
npm run test:staging

# Production
npm run test:production

# Development (localhost)
npm run test:dev

# Or set environment variable directly
TEST_ENV=staging npx playwright test
```

Available environments:
- `development` - http://localhost:3000
- `staging` - https://test-qa.capslock.global
- `production` - https://capslock.global

## Allure Reports

Generate and view Allure reports:

```bash
# Run tests first (generates allure-results)
npm test

# Generate Allure report
npm run allure:generate

# Open Allure report in browser
npm run allure:open
```

## Project Structure

```
capslock/
├── .github/workflows/      # CI/CD configuration
│   └── playwright.yml      # GitHub Actions workflow
├── environments/           # Environment configurations
│   ├── index.ts           # Environment loader
│   ├── development.config.ts
│   ├── staging.config.ts
│   └── production.config.ts
├── locators/               # Locator definitions (separated from pages)
│   ├── lead-form.locators.ts
│   └── thank-you.locators.ts
├── pages/                  # Page Object Models (actions + assertions)
│   ├── LeadFormPage.ts
│   └── ThankYouPage.ts
├── tests/                  # Test specifications
│   ├── lead-form.spec.ts   # Main form tests (data-driven)
│   ├── navigation.spec.ts  # Browser navigation tests
│   └── performance.spec.ts
├── test-data/              # Test data constants
│   └── form-data.ts
├── playwright.config.ts    # Playwright configuration
└── package.json
```

### Architecture Pattern

The project follows a strict separation of concerns:

- **Locators** (`locators/`): Pure locator definitions, no actions or assertions
- **Pages** (`pages/`): Action methods (fill, click, submit) and assertion methods (expectVisible, expectValue)
- **Tests** (`tests/`): Only call page methods, no direct locator access or `expect()` calls

This pattern ensures:
- Tests are readable and business-focused
- Locators are centralized and easy to maintain
- Assertions are encapsulated and reusable

---

## Test Scenario Selection Rationale

### Why These Scenarios Were Selected

The implemented tests cover the most critical paths of the lead generation form. Here's the rationale for each category:

#### 1. Happy Path (1 test) @smoke @critical
- **Complete form submission with valid data**: This is the most critical scenario as it represents the primary business flow. A user successfully submitting their information is the main conversion goal.

#### 2. ZIP Code Validation (4 tests) @regression
- ZIP code is the first user interaction and determines the entire form flow
- Invalid ZIP codes (too short, too long, with letters, empty) must be caught to prevent bad data
- ZIP codes also route users to different flows (in-area vs out-of-area)

#### 3. Email Validation (4 tests) @regression
- Email is essential for lead follow-up and marketing
- Invalid emails result in lost business opportunities
- Tests cover: no @ sign, no domain, no username, empty

#### 4. Phone Validation (3 tests) @regression
- Phone is the primary contact method for sales follow-up
- Invalid phone numbers make leads unreachable
- Tests cover: too short, with letters, empty

#### 5. Out of Area Flow (2 tests) @smoke
- Tests the alternative user journey for non-serviceable areas
- Ensures potential customers can still sign up for notifications
- Important for capturing leads in expansion areas

#### 6. Required Fields (1 test) @regression
- Name is required for personalized follow-up
- Verifies that the form enforces mandatory fields

#### 7. Multi-step Navigation (2 tests) @regression
- Verifies the form progression indicator works correctly
- Tests multi-select functionality on interest options
- Ensures users understand their progress through the form

#### 8. Navigation Tests (7 tests) @regression
- Browser back/forward button handling
- Page refresh behavior
- Form data persistence
- Rapid navigation handling

#### 9. Performance Tests (8 tests) @performance
- Page load time
- Step transition responsiveness
- Web Vitals metrics collection
- Memory leak detection
- Network request monitoring

**Note**: Performance tests use a warning-based approach rather than hard failures. When metrics exceed thresholds, tests still pass but add warning annotations to the Playwright report. This prevents flaky CI failures due to network or environment variability while still surfacing performance concerns.

Thresholds:
- Page load: 5000ms
- Step transition: 2000ms
- Form completion: 30000ms
- Memory growth: 100%

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

## CI/CD Pipeline

The project includes a GitHub Actions workflow with the following features:

### Triggers
- Push to `main` or `master` branches
- Pull requests to `main` or `master` branches
- Manual dispatch with custom reason and branch selection

### Cross-Browser Testing
Tests run across 5 browser matrix groups:
- Chromium (Desktop Chrome)
- Firefox (Desktop Firefox)
- WebKit (Desktop Safari)
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)

### Cross-OS Testing
Each browser runs on all 3 operating systems:
- Ubuntu (Linux)
- Windows
- macOS

### Parallel Execution
- 5 browsers × 3 OSes × 3 shards = 45 parallel test jobs
- Each browser matrix shows "9 jobs completed" (3 OSes × 3 shards)
- 2 workers per shard for optimal runner utilization
- Blob reporter for merging sharded results

### Workflow Structure
```
┌─────────────┐
│  chromium   │──┐
│ (9 jobs)    │  │
├─────────────┤  │
│  firefox    │  │
│ (9 jobs)    │  │
├─────────────┤  │    ┌────────────────┐
│mobile-chrome│  ├───►│ Merge Reports  │
│ (9 jobs)    │  │    │                │
├─────────────┤  │    │ - Merge blobs  │
│mobile-safari│  │    │ - Deploy Pages │
│ (9 jobs)    │  │    │ - Output URL   │
├─────────────┤  │    └────────────────┘
│   webkit    │──┘
│ (9 jobs)    │
└─────────────┘
```

### Report Access
After all tests complete, the merged HTML report is automatically deployed to GitHub Pages:
- **Report URL**: `https://<username>.github.io/<repo>/`
- URL is displayed in the workflow summary under "Merge Reports summary"
- Report includes results from all browsers, OSes, and shards in one view

### Artifacts
- Individual blob reports per shard (7-day retention)
- Merged HTML report after all tests complete (30-day retention)
- Traces and screenshots captured on failure

### Manual Trigger
Run tests manually via GitHub Actions UI with:
- **Reason**: Description of why tests are being run
- **Branch**: Target branch to test against

---

## Author

Bogdan Iordache
