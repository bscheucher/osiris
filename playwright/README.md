# Playwright Tests - Page Object Model (POM) Structure

This directory contains Playwright tests using the Page Object Model (POM) pattern for testing the employee onboarding workflow.

## Directory Structure

```
playwright/
├── pages/                          # Page Object Models
│   └── mitarbeiter-stammdaten-erfassen.page.ts
├── tests/                          # Test specifications
│   └── mitarbeiter-stammdaten-onboarding.spec.ts
├── utils/                          # Test utilities and helpers
│   └── test-helpers.ts
├── test-files/                     # Test files (images, documents)
│   ├── ecard.png
│   ├── debitkarte.jpg
│   ├── arbeitsgenehmigung.jpg
│   └── ...
├── storage/                        # Runtime storage for test data
│   ├── personalnummer.json
│   └── session.json
└── README.md
```

## Page Object Models (POMs)

### MitarbeiterStammdatenErfassenPage

Page Object Model for the Employee Personal Data Entry form (`mitarbeiter-stammdaten-erfassen-view.tsx`).

**Features:**
- Encapsulates all form elements and interactions
- Provides high-level methods for common workflows
- Handles waiting and loading states automatically
- Includes validation helpers

**Example Usage:**

```typescript
import { MitarbeiterStammdatenErfassenPage } from '../pages/mitarbeiter-stammdaten-erfassen.page'

test('fill personal data form', async ({ page }) => {
  const stammdatenPage = new MitarbeiterStammdatenErfassenPage(page)

  // Navigate to the form
  await stammdatenPage.goto('12345', 3)

  // Fill personal data section
  await stammdatenPage.fillPersonendaten({
    anrede: 'Herr',
    geschlecht: 'männlich',
    vorname: 'Max',
    nachname: 'Mustermann',
    staatsbuergerschaft: 'Österreich',
    svnr: '1234567890',
    geburtsDatum: '01.01.1990',
    ecardPath: './test-files/ecard.png',
  })

  // Save and verify
  await stammdatenPage.save()
  await stammdatenPage.verifyWorkflowCompleted()
})
```

## Test Utilities

The `test-helpers.ts` file provides reusable utility classes:

### DateHelpers

```typescript
// Calculate age from birthday
const age = DateHelpers.getAgeAsString('1990-01-01')

// Format date to DD.MM.YYYY
const formatted = DateHelpers.formatToDDMMYYYY(new Date())

// Get random date between two dates
const randomDate = DateHelpers.getRandomDateBetween('2025-01-01', '2025-12-31')
```

### PersonalnummerStorage

```typescript
// Save employee number
await PersonalnummerStorage.save('12345')

// Load employee number
const personalnummer = await PersonalnummerStorage.load()

// Delete employee number
await PersonalnummerStorage.delete()
```

### SessionStorage

```typescript
// Save session (cookies)
await SessionStorage.save(context)

// Load session
const session = await SessionStorage.load()

// Delete session
await SessionStorage.delete()
```

### AuthHelpers

```typescript
// Login manually
await AuthHelpers.login(page)

// Restore session or login
await AuthHelpers.restoreSessionOrLogin(context, page)
```

### URLHelpers

```typescript
// Verify URL matches expected pattern
await URLHelpers.expectURL(page, {
  pathname: '/mitarbeiter/onboarding/12345',
  searchParams: { wfi: '3' }
})
```

### WaitHelpers

```typescript
// Wait for loader to appear and disappear
await WaitHelpers.waitForLoader(page)

// Wait for loader to disappear only
await WaitHelpers.waitForLoaderToDisappear(page)

// Wait for toast notification
await WaitHelpers.waitForToast(page)
```

### FormHelpers

```typescript
// Fill combobox
await FormHelpers.fillCombobox(page, 'land', 'Österreich')

// Upload file
await FormHelpers.uploadFile(page, 'ecard', './test-files/ecard.png')

// Fill date field
await FormHelpers.fillDate(page, 'geburtsDatum', '01.01.1990')
```

### WorkflowHelpers

```typescript
// Verify workflow status
await WorkflowHelpers.verifyWorkflowStatus(page, 'Stammdaten erfassen', 'completed')

// Navigate to workflow step
await WorkflowHelpers.navigateToStep(page, '12345', 3, 'mitarbeiter')
```

## Form Sections

The Mitarbeiter Stammdaten form is divided into sections:

### 1. Personendaten (Personal Data)
- Anrede (Salutation)
- Titel (Title)
- Geschlecht (Gender)
- Vorname (First Name)
- Nachname (Last Name)
- Geburtsname (Birth Name)
- Familienstand (Marital Status)
- Staatsbürgerschaft (Citizenship)
- Muttersprache (Native Language)
- SVNR (Social Security Number)
- Geburtsdatum (Birth Date)
- Alter (Age - calculated)
- eCard Upload

### 2. Kontaktdaten (Contact Data)
- Straße (Street)
- PLZ (Postal Code)
- Ort (City)
- Land (Country)
- Email
- Mobilnummer (Mobile Number)
- Handy-Signatur (Mobile Signature)

### 3. Abweichende Postadresse (Alternative Address)
- Alternative Straße, PLZ, Ort, Land

### 4. Bankdaten (Bank Data)
- Bank
- IBAN
- BIC
- Bankcard Upload

### 5. Arbeitsgenehmigung (Work Permit)
- Arbeitsgenehmigung Dokument (Work Permit Document)
- Arbeitsgenehmigung (Work Permit Type)
- Gültig bis (Valid Until)
- Foto Upload

### 6. Arbeitsbereitschaft (Work Readiness)
Checkboxes for Austrian states:
- Burgenland
- Kärnten
- Niederösterreich
- Oberösterreich
- Salzburg
- Steiermark
- Tirol
- Vorarlberg
- Wien

## Running Tests

### Run all tests
```bash
npx playwright test playwright/tests
```

### Run specific test file
```bash
npx playwright test playwright/tests/mitarbeiter-stammdaten-onboarding.spec.ts
```

### Run in headed mode (see browser)
```bash
npx playwright test playwright/tests --headed
```

### Run in debug mode
```bash
npx playwright test playwright/tests --debug
```

### Run with UI mode
```bash
npx playwright test playwright/tests --ui
```

## Environment Variables

The tests require the following environment variables:

```env
E2E_USER=your_test_user
E2E_PASSWORD=your_test_password
```

## Test Files

Place test files in the `test-files/` directory:

- `ecard.png` - Sample eCard image
- `debitkarte.jpg` - Sample debit card image
- `arbeitsgenehmigung.jpg` - Sample work permit document
- `kompetenzprofil.pdf` - Sample competency profile
- `arbeitsnachweis.pdf` - Sample work certificate

## Best Practices

1. **Use POMs for all page interactions** - Never interact with page elements directly in tests
2. **Keep tests readable** - Use `test.step()` to organize test logic
3. **Reuse utilities** - Leverage the helper classes for common operations
4. **Wait properly** - Use the built-in wait methods in POMs
5. **Verify state** - Always verify the result of actions (e.g., `verifyWorkflowCompleted()`)
6. **Generate realistic data** - Use Faker for test data generation
7. **Isolate tests** - Each test should be independent and not rely on others

## Creating New POMs

When creating a new POM:

1. **Read the view/form file** to understand the structure
2. **Create locators** for all interactive elements
3. **Add high-level methods** for common workflows
4. **Include validation helpers** for assertions
5. **Document the POM** with JSDoc comments
6. **Create example tests** showing how to use the POM

### POM Template

```typescript
import { Locator, Page, expect } from '@playwright/test'

export class YourPage {
  readonly page: Page
  readonly someElement: Locator

  constructor(page: Page) {
    this.page = page
    this.someElement = page.getByTestId('some-element')
  }

  async goto() {
    await this.page.goto('/your-path')
  }

  async fillForm(data: any) {
    // Fill form logic
  }

  async save() {
    // Save logic
  }

  async verify() {
    // Verification logic
  }
}
```

## Workflow IDs

Important workflow item IDs for testing:

### Mitarbeiter (MA)
- **3** - Stammdaten erfassen
- **4** - Vertragsdaten erfassen
- **5** - KV-Einstufung berechnen
- **6** - Lohnverrechnung informieren
- **7** - Mitarbeitendedaten prüfen
- **8** - Dienstvertrag erstellen

### Teilnehmer (TN)
- **18** - Stammdaten erfassen (Teilnehmende)
- **19** - Vertragsdaten erfassen (Teilnehmende)
- **20** - Lohnverrechnung informieren (Teilnehmende)
- **21** - Mitarbeitendedaten prüfen (Teilnehmende)
- **22** - Daten an LHR übergeben (Teilnehmende)
- **23** - Stakeholder informieren (Teilnehmende)

## Contributing

When adding new tests or POMs:

1. Follow the existing structure and naming conventions
2. Add JSDoc comments for all public methods
3. Include example tests demonstrating usage
4. Update this README with any new utilities or patterns
5. Ensure all tests pass before committing

## Troubleshooting

### Common Issues

**Test timeout**
- Increase timeout in `waitFor()` calls
- Check if loader is properly hidden
- Verify network requests complete

**Element not found**
- Verify `data-testid` attributes exist in the component
- Check if element is inside a shadow DOM
- Ensure page is fully loaded

**File upload fails**
- Verify file path is correct
- Check file exists in `test-files/` directory
- Ensure file is not too large

**Session expired**
- Delete `storage/session.json`
- Re-run tests to create new session
