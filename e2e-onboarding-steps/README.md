# E2E Tests for Employee Onboarding Workflow (Steps 4-9)

This folder contains comprehensive End-to-End (E2E) tests and Page Object Models (POMs) for steps 4-9 of the employee onboarding workflow (Onboarding Mitarbeiter).

## Overview

The employee onboarding workflow consists of 10 steps. This test suite covers steps 4-9:

| Step | WFI | Name | Type | Description |
|------|-----|------|------|-------------|
| 4 | 6 | Lohnverrechnung informieren | Manual | Notify payroll department |
| 5 | 7 | Mitarbeiterdaten prüfen | Manual | Review and approve employee data |
| 6 | 8 | Dienstvertrag erstellen | Automated | Generate employment contract PDF |
| 7 | 10 | Unterschriftenlauf starten | Manual | Send contract to Moxis for signature |
| 8 | 11 | Unterschriftenlauf durchführen | External | Execute signature via Moxis |
| 9 | 12 | Unterschriebene Dokumente speichern | Automated | Save signed documents |

## Folder Structure

```
e2e-onboarding-steps/
├── poms/                                           # Page Object Models
│   ├── lohnverrechnung-informieren.pom.ts          # Step 4 POM
│   ├── mitarbeiterdaten-pruefen.pom.ts             # Step 5 POM
│   ├── dienstvertrag-erstellen.pom.ts              # Step 6 POM
│   ├── unterschriftenlauf-starten.pom.ts           # Step 7 POM
│   ├── unterschriftenlauf-durchfuehren.pom.ts      # Step 8 POM
│   └── unterschriebene-dokumente-speichern.pom.ts  # Step 9 POM
├── tests/                                          # Test specifications
│   ├── 004-lohnverrechnung-informieren.spec.ts     # Step 4 tests
│   ├── 005-mitarbeiterdaten-pruefen.spec.ts        # Step 5 tests
│   ├── 006-dienstvertrag-erstellen.spec.ts         # Step 6 tests
│   ├── 007-unterschriftenlauf-starten.spec.ts      # Step 7 tests
│   ├── 008-unterschriftenlauf-durchfuehren.spec.ts # Step 8 tests
│   └── 009-unterschriebene-dokumente-speichern.spec.ts # Step 9 tests
├── test-utils.ts                                   # Shared utilities
└── README.md                                       # This file
```

## Prerequisites

Before running these tests, ensure:

1. **Previous Steps Completed**: Steps 1-3 must be completed:
   - Step 1: Stammdaten erfassen (Personal data entry)
   - Step 2: Vertragsdaten erfassen (Contract data entry)
   - Step 3: KV-Einstufung berechnen (Salary classification - automated)

2. **User Permissions**: Test user must have the following roles:
   - `MA_ONBOARDING_LV_INFORMIEREN` - For step 4
   - `MA_UEBERPRUEFEN` - For step 5

3. **Environment Setup**:
   - Application running at `http://localhost:3000`
   - Database seeded with test data
   - Test user credentials in `.env.local`
   - `TEST_PERSONALNUMMER` environment variable set

4. **External Services**:
   - Moxis signature service accessible (or mocked for testing)

## Running the Tests

### Run All Tests
```bash
# Run all onboarding steps tests
npx playwright test e2e-onboarding-steps/tests

# Run with UI
npx playwright test e2e-onboarding-steps/tests --ui

# Run in headed mode
npx playwright test e2e-onboarding-steps/tests --headed
```

### Run Individual Step Tests
```bash
# Step 4: Lohnverrechnung informieren
npx playwright test e2e-onboarding-steps/tests/004-lohnverrechnung-informieren.spec.ts

# Step 5: Mitarbeiterdaten prüfen
npx playwright test e2e-onboarding-steps/tests/005-mitarbeiterdaten-pruefen.spec.ts

# Step 6: Dienstvertrag erstellen
npx playwright test e2e-onboarding-steps/tests/006-dienstvertrag-erstellen.spec.ts

# Step 7: Unterschriftenlauf starten
npx playwright test e2e-onboarding-steps/tests/007-unterschriftenlauf-starten.spec.ts

# Step 8: Unterschriftenlauf durchführen
npx playwright test e2e-onboarding-steps/tests/008-unterschriftenlauf-durchfuehren.spec.ts

# Step 9: Unterschriebene Dokumente speichern
npx playwright test e2e-onboarding-steps/tests/009-unterschriebene-dokumente-speichern.spec.ts
```

### Run Specific Test Cases
```bash
# Run specific test by name (grep)
npx playwright test e2e-onboarding-steps/tests -g "should successfully inform payroll"

# Run tests in debug mode
npx playwright test e2e-onboarding-steps/tests --debug
```

## Test Coverage

### Step 4: Lohnverrechnung informieren
- ✅ Page display and UI elements
- ✅ Button visibility and state
- ✅ Click action and API call
- ✅ Workflow status transitions
- ✅ Next step activation
- ✅ Permission validation
- ✅ Navigation via workflow navigator

### Step 5: Mitarbeiterdaten prüfen
- ✅ Form state and field visibility
- ✅ Document download (bankcard, e-card, work permit)
- ✅ Accept/reject toggles
- ✅ Conditional work permit section (based on nationality)
- ✅ Form validation
- ✅ Accept all documents (happy path)
- ✅ Reject documents (error path)
- ✅ Related steps error propagation
- ✅ Error recovery workflow

### Step 6: Dienstvertrag erstellen (Automated)
- ✅ Automated completion verification
- ✅ Workflow status badge styling
- ✅ Completed placeholder display
- ✅ Navigation accessibility
- ✅ State persistence across refreshes
- ✅ Performance timing
- ✅ Workflow sequence validation

### Step 7: Unterschriftenlauf starten
- ✅ PDF preview loading and display
- ✅ Info text and button visibility
- ✅ Sending contract to Moxis
- ✅ Workflow transitions
- ✅ Loading states
- ✅ Read-only mode activation
- ✅ Error handling

### Step 8: Unterschriftenlauf durchführen
- ✅ In-progress state display
- ✅ Cancel functionality
- ✅ Completed state with success icon
- ✅ Error states (SIGNATURE_DENIED, TIMEOUT, CANCELLED)
- ✅ Status polling
- ✅ Timestamp display
- ✅ External signature integration

### Step 9: Unterschriebene Dokumente speichern (Automated)
- ✅ Automated completion after signature
- ✅ Workflow badge styling
- ✅ Completed placeholder
- ✅ Navigation accessibility
- ✅ State persistence
- ✅ Performance timing
- ✅ Complete workflow validation

## Page Object Model (POM) Architecture

Each step has a corresponding POM class that encapsulates:

### Structure
```typescript
export class StepNamePage {
  readonly page: Page
  readonly personalnummer: string

  // Locators for UI elements
  readonly pageTitle: Locator
  readonly actionButton: Locator
  // ... more locators

  constructor(page: Page, personalnummer: string) {
    // Initialize locators
  }

  // Navigation methods
  async goto(): Promise<void> { }

  // Action methods
  async performAction(): Promise<void> { }

  // Validation methods
  async isCompleted(): Promise<boolean> { }
}
```

### Benefits
- **Maintainability**: UI changes only require POM updates
- **Reusability**: POMs can be used across multiple tests
- **Readability**: Tests read like user stories
- **Type Safety**: TypeScript provides compile-time checks

## Utility Functions

### `test-utils.ts`
Common utilities shared across all tests:

```typescript
// Wait for loader to appear and disappear
waitForLoader(page: Page, timeout?: number): Promise<void>

// Navigate to specific workflow step
navigateToWorkflowStep(page: Page, personalnummer: string, wfi: number): Promise<void>

// Click workflow navigator item
clickWorkflowNavigatorItem(page: Page, stepName: string): Promise<void>

// Check workflow status
waitForWorkflowStatus(page: Page, stepName: string, status: string): Promise<void>
hasWorkflowStatus(page: Page, stepName: string, status: string): Promise<boolean>

// Toast notifications
waitForSuccessToast(page: Page): Promise<void>
waitForErrorToast(page: Page): Promise<void>

// URL helpers
getPersonalnummerFromUrl(url: string): string | null

// API response helpers
waitForApiResponse(page: Page, endpoint: string, timeout?: number): Promise<void>
```

## Environment Variables

Set these in your `.env.local` file:

```bash
# Test user credentials (from playwright.config.ts setup)
E2E_USER=test.user@example.com
E2E_PASSWORD=secure_password

# Personalnummer for testing (optional, can be generated)
TEST_PERSONALNUMMER=12345
```

## Key Testing Patterns

### 1. Workflow Status Verification
```typescript
await test.step('verify workflow status', async () => {
  const isCompleted = await page.isCompleted()
  expect(isCompleted).toBe(true)
})
```

### 2. Waiting for Loaders
```typescript
await waitForLoader(page)
```

### 3. File Downloads
```typescript
const download = await page.downloadBankcard()
expect(download.suggestedFilename()).toContain('BANKCARD')
```

### 4. Polling for Automated Steps
```typescript
await page.waitForAutomatedCompletion(30000)
```

### 5. Error State Handling
```typescript
const hasError = await page.hasError()
if (hasError) {
  const errorMessage = await page.getErrorMessage()
  expect(errorMessage).toBeTruthy()
}
```

## Common Issues and Solutions

### Issue: Tests fail with timeout
**Solution**: Increase timeout for slow automated steps or external services
```typescript
await page.waitForCompletion(60000) // 60 seconds
```

### Issue: Permission errors
**Solution**: Ensure test user has required roles in database

### Issue: Previous steps not completed
**Solution**: Run setup tests (steps 1-3) first or use test fixtures

### Issue: Moxis integration fails
**Solution**: Mock Moxis responses or use test environment with mock service

## Best Practices

1. **Test Isolation**: Each test should be independent
2. **Use POMs**: Always use Page Object Models for UI interactions
3. **Descriptive Names**: Test names should clearly describe what they test
4. **Test Steps**: Break complex tests into logical steps using `test.step()`
5. **Assertions**: Use meaningful assertions with clear error messages
6. **Timeouts**: Set appropriate timeouts for async operations
7. **Cleanup**: Reset state between tests if needed
8. **Documentation**: Comment complex logic and edge cases

## Debugging

### View Test Results
```bash
# Open HTML report
npx playwright show-report
```

### Debug Specific Test
```bash
# Debug mode with inspector
npx playwright test e2e-onboarding-steps/tests/005-mitarbeiterdaten-pruefen.spec.ts --debug

# Headed mode with slow motion
npx playwright test e2e-onboarding-steps/tests/005-mitarbeiterdaten-pruefen.spec.ts --headed --slow-mo=1000
```

### Screenshots and Videos
Playwright automatically captures screenshots on failure and videos when configured.

## Integration with CI/CD

### Example GitHub Actions
```yaml
- name: Run Onboarding E2E Tests
  run: npx playwright test e2e-onboarding-steps/tests

- name: Upload Test Results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## Future Enhancements

- [ ] Add visual regression testing
- [ ] Mock Moxis service for deterministic tests
- [ ] Add performance benchmarking
- [ ] Implement test data factories
- [ ] Add accessibility testing
- [ ] Create test fixtures for setup/teardown
- [ ] Add API testing alongside E2E tests

## Support

For questions or issues:
1. Check existing test patterns in this folder
2. Review the main workflow analysis documentation
3. Consult the component source code in `src/`
4. Reach out to the QA team

## Related Documentation

- Main E2E tests: `/e2e/`
- Playwright config: `/playwright.config.ts`
- Component source: `/src/components/organisms/`
- Workflow utilities: `/src/lib/utils/mitarbeiter/workflow-utils.ts`
- Workflow constants: `/src/lib/constants/mitarbeiter-constants.ts`
