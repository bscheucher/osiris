import { Locator, Page, expect } from '@playwright/test'
import path from 'path'

/**
 * Page Object Model for Mitarbeiter Stammdaten Erfassen (Employee Personal Data Entry)
 *
 * This POM encapsulates all interactions with the employee onboarding personal data form.
 * The form is divided into sections:
 * - Personendaten (Personal Data)
 * - Kontaktdaten (Contact Data)
 * - Abweichende Postadresse (Alternative Address)
 * - Bankdaten (Bank Data)
 * - Arbeitsgenehmigung (Work Permit)
 * - Arbeitsbereitschaft (Work Readiness - Austrian states)
 */
export class MitarbeiterStammdatenErfassenPage {
  readonly page: Page

  // Page elements
  readonly pageTitle: Locator
  readonly loader: Locator
  readonly saveButton: Locator
  readonly saveButtonTop: Locator

  // Personendaten (Personal Data) section
  readonly personalnummerInput: Locator
  readonly firmaInput: Locator
  readonly anredeSelect: Locator
  readonly titelSelect: Locator
  readonly titel2Select: Locator
  readonly geschlechtSelect: Locator
  readonly vornameInput: Locator
  readonly nachnameInput: Locator
  readonly geburtsnameInput: Locator
  readonly familienstandSelect: Locator
  readonly staatsbuergerschaftCombo: Locator
  readonly mutterspracheCombo: Locator
  readonly svnrInput: Locator
  readonly geburtsDatumInput: Locator
  readonly alterInput: Locator
  readonly ecardFileInput: Locator
  readonly ecardUploadButton: Locator
  readonly ecardFilename: Locator

  // Kontaktdaten (Contact Data) section
  readonly strasseInput: Locator
  readonly plzInput: Locator
  readonly ortInput: Locator
  readonly landCombo: Locator
  readonly landButton: Locator
  readonly emailInput: Locator
  readonly mobilnummerInput: Locator
  readonly handySignaturToggle: Locator

  // Abweichende Postadresse (Alternative Address) section
  readonly astrasseInput: Locator
  readonly aplzInput: Locator
  readonly aortInput: Locator
  readonly alandCombo: Locator

  // Bankdaten (Bank Data) section
  readonly bankInput: Locator
  readonly ibanInput: Locator
  readonly bicInput: Locator
  readonly bankcardFileInput: Locator
  readonly bankcardUploadButton: Locator
  readonly bankcardFilename: Locator

  // Arbeitsgenehmigung (Work Permit) section
  readonly arbeitsgenehmigungDokFileInput: Locator
  readonly arbeitsgenehmigungDokUploadButton: Locator
  readonly arbeitsgenehmigungDokFilename: Locator
  readonly arbeitsgenehmigungCombo: Locator
  readonly gueltigBisInput: Locator
  readonly fotoFileInput: Locator
  readonly fotoUploadButton: Locator
  readonly fotoFilename: Locator

  // Arbeitsbereitschaft (Work Readiness) section - Austrian states
  readonly burgenlandCheckbox: Locator
  readonly kaerntenCheckbox: Locator
  readonly niederoesterreichCheckbox: Locator
  readonly oberoesterreichCheckbox: Locator
  readonly salzburgCheckbox: Locator
  readonly steiermarkCheckbox: Locator
  readonly tirolCheckbox: Locator
  readonly vorarlbergCheckbox: Locator
  readonly wienCheckbox: Locator

  // Validation errors
  readonly anredeError: Locator
  readonly geschlechtError: Locator
  readonly vornameError: Locator
  readonly nachnameError: Locator
  readonly staatsbuergerschaftError: Locator
  readonly svnrError: Locator
  readonly geburtsDatumError: Locator
  readonly ecardError: Locator
  readonly strasseError: Locator
  readonly plzError: Locator
  readonly ortError: Locator
  readonly landError: Locator
  readonly emailError: Locator
  readonly mobilnummerError: Locator
  readonly bankError: Locator
  readonly ibanError: Locator
  readonly bicError: Locator
  readonly bankcardError: Locator

  // Toast notifications
  readonly toastContainer: Locator

  constructor(page: Page) {
    this.page = page

    // Page elements
    this.pageTitle = page.getByRole('heading', { level: 2 })
    this.loader = page.getByTestId('loader')
    this.saveButton = page.getByTestId('save-button')
    this.saveButtonTop = page.getByRole('button', { name: /speichern/i }).first()

    // Personendaten
    this.personalnummerInput = page.getByTestId('personalnummer')
    this.firmaInput = page.getByTestId('firma')
    this.anredeSelect = page.getByTestId('anrede')
    this.titelSelect = page.getByTestId('titel')
    this.titel2Select = page.getByTestId('titel2')
    this.geschlechtSelect = page.getByTestId('geschlecht')
    this.vornameInput = page.getByTestId('vorname')
    this.nachnameInput = page.getByTestId('nachname')
    this.geburtsnameInput = page.getByTestId('geburtsname')
    this.familienstandSelect = page.getByTestId('familienstand')
    this.staatsbuergerschaftCombo = page.getByTestId('staatsbuergerschaft')
    this.mutterspracheCombo = page.getByTestId('muttersprache')
    this.svnrInput = page.getByTestId('svnr')
    this.geburtsDatumInput = page.locator('#geburtsDatum')
    this.alterInput = page.getByTestId('alter')
    this.ecardFileInput = page.getByTestId('ecard')
    this.ecardUploadButton = page.getByTestId('ecard-upload-button')
    this.ecardFilename = page.getByTestId('ecard-filename')

    // Kontaktdaten
    this.strasseInput = page.getByTestId('strasse')
    this.plzInput = page.getByTestId('plz')
    this.ortInput = page.getByTestId('ort')
    this.landCombo = page.getByTestId('land')
    this.landButton = page.getByTestId('land-button')
    this.emailInput = page.getByTestId('email')
    this.mobilnummerInput = page.getByTestId('mobilnummer')
    this.handySignaturToggle = page.getByTestId('handySignatur')

    // Abweichende Postadresse
    this.astrasseInput = page.getByTestId('astrasse')
    this.aplzInput = page.getByTestId('aplz')
    this.aortInput = page.getByTestId('aort')
    this.alandCombo = page.getByTestId('aland')

    // Bankdaten
    this.bankInput = page.getByTestId('bank')
    this.ibanInput = page.getByTestId('iban')
    this.bicInput = page.getByTestId('bic')
    this.bankcardFileInput = page.getByTestId('bankcard')
    this.bankcardUploadButton = page.getByTestId('bankcard-upload-button')
    this.bankcardFilename = page.getByTestId('bankcard-filename')

    // Arbeitsgenehmigung
    this.arbeitsgenehmigungDokFileInput = page.getByTestId('arbeitsgenehmigungDok')
    this.arbeitsgenehmigungDokUploadButton = page.getByTestId('arbeitsgenehmigungDok-upload-button')
    this.arbeitsgenehmigungDokFilename = page.getByTestId('arbeitsgenehmigungDok-filename')
    this.arbeitsgenehmigungCombo = page.getByTestId('arbeitsgenehmigung')
    this.gueltigBisInput = page.locator('#gueltigBis')
    this.fotoFileInput = page.getByTestId('foto')
    this.fotoUploadButton = page.getByTestId('foto-upload-button')
    this.fotoFilename = page.getByTestId('foto-filename')

    // Arbeitsbereitschaft checkboxes
    this.burgenlandCheckbox = page.getByTestId('burgenland')
    this.kaerntenCheckbox = page.getByTestId('kaernten')
    this.niederoesterreichCheckbox = page.getByTestId('niederoesterreich')
    this.oberoesterreichCheckbox = page.getByTestId('oberoesterreich')
    this.salzburgCheckbox = page.getByTestId('salzburg')
    this.steiermarkCheckbox = page.getByTestId('steiermark')
    this.tirolCheckbox = page.getByTestId('tirol')
    this.vorarlbergCheckbox = page.getByTestId('vorarlberg')
    this.wienCheckbox = page.getByTestId('wien')

    // Validation errors
    this.anredeError = page.getByTestId('anrede-error')
    this.geschlechtError = page.getByTestId('geschlecht-error')
    this.vornameError = page.getByTestId('vorname-error')
    this.nachnameError = page.getByTestId('nachname-error')
    this.staatsbuergerschaftError = page.getByTestId('staatsbuergerschaft-error')
    this.svnrError = page.getByTestId('svnr-error')
    this.geburtsDatumError = page.getByTestId('geburtsDatum-error')
    this.ecardError = page.getByTestId('ecard-error')
    this.strasseError = page.getByTestId('strasse-error')
    this.plzError = page.getByTestId('plz-error')
    this.ortError = page.getByTestId('ort-error')
    this.landError = page.getByTestId('land-error')
    this.emailError = page.getByTestId('email-error')
    this.mobilnummerError = page.getByTestId('mobilnummer-error')
    this.bankError = page.getByTestId('bank-error')
    this.ibanError = page.getByTestId('iban-error')
    this.bicError = page.getByTestId('bic-error')
    this.bankcardError = page.getByTestId('bankcard-error')

    // Toast notifications
    this.toastContainer = page.locator('.toast-container').first()
  }

  /**
   * Navigate to the Mitarbeiter Stammdaten page for a specific employee
   * @param personalnummer - Employee personnel number
   * @param wfi - Workflow item ID (default: 3 for MA Stammdaten erfassen)
   */
  async goto(personalnummer: string, wfi: number = 3) {
    await this.page.goto(`/mitarbeiter/onboarding/${personalnummer}?wfi=${wfi}`)
    await this.waitForPageLoad()
  }

  /**
   * Wait for the page to finish loading
   */
  async waitForPageLoad() {
    await this.loader.waitFor({ state: 'hidden', timeout: 10000 })
  }

  /**
   * Wait for the loader to appear and disappear (during save operations)
   */
  async waitForLoader() {
    await this.loader.first().waitFor({ state: 'visible', timeout: 20000 })
    await this.loader.first().waitFor({ state: 'hidden', timeout: 20000 })
  }

  /**
   * Click the save button and wait for the operation to complete
   */
  async save() {
    await this.saveButton.click()
    await this.waitForLoader()
  }

  /**
   * Fill in all Personendaten (Personal Data) fields
   */
  async fillPersonendaten(data: {
    anrede?: string
    titel?: string
    titel2?: string
    geschlecht?: string
    vorname: string
    nachname: string
    geburtsname?: string
    familienstand?: string
    staatsbuergerschaft: string
    muttersprache?: string
    svnr: string
    geburtsDatum: string
    ecardPath?: string
  }) {
    if (data.anrede) {
      await this.anredeSelect.selectOption(data.anrede)
    }

    if (data.titel) {
      await this.titelSelect.selectOption(data.titel)
    }

    if (data.titel2) {
      await this.titel2Select.selectOption(data.titel2)
    }

    if (data.geschlecht) {
      await this.geschlechtSelect.selectOption(data.geschlecht)
    }

    await this.vornameInput.fill(data.vorname)
    await this.nachnameInput.fill(data.nachname)

    if (data.geburtsname) {
      await this.geburtsnameInput.fill(data.geburtsname)
    }

    if (data.familienstand) {
      await this.familienstandSelect.selectOption(data.familienstand)
    }

    // Staatsbuergerschaft is a combobox
    await this.staatsbuergerschaftCombo.fill(data.staatsbuergerschaft)
    await this.page.getByTestId(`staatsbuergerschaft-option-${data.staatsbuergerschaft}`).click()

    if (data.muttersprache) {
      await this.mutterspracheCombo.fill(data.muttersprache)
      await this.page.getByTestId(`muttersprache-option-${data.muttersprache}`).click()
    }

    await this.svnrInput.fill(data.svnr)

    await this.geburtsDatumInput.click()
    await this.geburtsDatumInput.fill(data.geburtsDatum)

    if (data.ecardPath) {
      await this.uploadEcard(data.ecardPath)
    }
  }

  /**
   * Upload ecard file
   * @param filePath - Path to the ecard file (relative to test file or absolute)
   */
  async uploadEcard(filePath: string) {
    await this.ecardFileInput.setInputFiles(filePath)
    await this.ecardUploadButton.click()
    await expect(this.toastContainer).toBeVisible({ timeout: 10000 })
  }

  /**
   * Fill in all Kontaktdaten (Contact Data) fields
   */
  async fillKontaktdaten(data: {
    strasse: string
    plz: string
    ort: string
    land: string
    email: string
    mobilnummer: string
    handySignatur?: boolean
  }) {
    await this.strasseInput.fill(data.strasse)
    await this.plzInput.fill(data.plz)
    await this.ortInput.fill(data.ort)

    // Land is a combobox - can be filled directly or clicked
    await this.landCombo.fill(data.land)
    await this.page.getByTestId(`land-option-${data.land}`).click()

    await this.emailInput.fill(data.email)
    await this.mobilnummerInput.fill(data.mobilnummer)

    if (data.handySignatur !== undefined) {
      // Toggle is a switch component - click to toggle
      const isChecked = await this.handySignaturToggle.isChecked()
      if (isChecked !== data.handySignatur) {
        await this.handySignaturToggle.click()
      }
    }
  }

  /**
   * Fill in alternative address (Abweichende Postadresse) fields
   */
  async fillAlternativeAddress(data: {
    astrasse?: string
    aplz?: string
    aort?: string
    aland?: string
  }) {
    if (data.astrasse) {
      await this.astrasseInput.fill(data.astrasse)
    }

    if (data.aplz) {
      await this.aplzInput.fill(data.aplz)
    }

    if (data.aort) {
      await this.aortInput.fill(data.aort)
    }

    if (data.aland) {
      await this.alandCombo.fill(data.aland)
      await this.page.getByTestId(`aland-option-${data.aland}`).click()
    }
  }

  /**
   * Fill in all Bankdaten (Bank Data) fields
   */
  async fillBankdaten(data: {
    bank: string
    iban: string
    bic: string
    bankcardPath?: string
  }) {
    await this.bankInput.fill(data.bank)
    await this.ibanInput.fill(data.iban)
    await this.bicInput.fill(data.bic)

    if (data.bankcardPath) {
      await this.uploadBankcard(data.bankcardPath)
    }
  }

  /**
   * Upload bankcard file
   * @param filePath - Path to the bankcard file
   */
  async uploadBankcard(filePath: string) {
    await this.bankcardFileInput.setInputFiles(filePath)
    await this.bankcardUploadButton.click()
    await expect(this.toastContainer).toBeVisible({ timeout: 10000 })
  }

  /**
   * Fill in work permit (Arbeitsgenehmigung) fields
   */
  async fillArbeitsgenehmigung(data: {
    arbeitsgenehmigungDokPath?: string
    arbeitsgenehmigung?: string
    gueltigBis?: string
    fotoPath?: string
  }) {
    if (data.arbeitsgenehmigungDokPath) {
      await this.arbeitsgenehmigungDokFileInput.setInputFiles(data.arbeitsgenehmigungDokPath)
      await this.arbeitsgenehmigungDokUploadButton.click()
      await expect(this.toastContainer).toBeVisible({ timeout: 10000 })
    }

    if (data.arbeitsgenehmigung) {
      await this.arbeitsgenehmigungCombo.fill(data.arbeitsgenehmigung)
      await this.page.getByTestId(`arbeitsgenehmigung-option-${data.arbeitsgenehmigung}`).click()
    }

    if (data.gueltigBis) {
      await this.gueltigBisInput.click()
      await this.gueltigBisInput.fill(data.gueltigBis)
    }

    if (data.fotoPath) {
      await this.fotoFileInput.setInputFiles(data.fotoPath)
      await this.fotoUploadButton.click()
      await expect(this.toastContainer).toBeVisible({ timeout: 10000 })
    }
  }

  /**
   * Set work readiness states (Arbeitsbereitschaft)
   * @param states - Array of Austrian state names to check
   */
  async setArbeitsbereitschaft(states: string[]) {
    const stateMapping: { [key: string]: Locator } = {
      'Burgenland': this.burgenlandCheckbox,
      'Kärnten': this.kaerntenCheckbox,
      'Niederösterreich': this.niederoesterreichCheckbox,
      'Oberösterreich': this.oberoesterreichCheckbox,
      'Salzburg': this.salzburgCheckbox,
      'Steiermark': this.steiermarkCheckbox,
      'Tirol': this.tirolCheckbox,
      'Vorarlberg': this.vorarlbergCheckbox,
      'Wien': this.wienCheckbox,
    }

    for (const state of states) {
      const checkbox = stateMapping[state]
      if (checkbox) {
        await checkbox.check()
      }
    }
  }

  /**
   * Fill the complete form with all data
   */
  async fillCompleteForm(data: {
    personendaten: Parameters<typeof this.fillPersonendaten>[0]
    kontaktdaten: Parameters<typeof this.fillKontaktdaten>[0]
    alternativeAddress?: Parameters<typeof this.fillAlternativeAddress>[0]
    bankdaten: Parameters<typeof this.fillBankdaten>[0]
    arbeitsgenehmigung?: Parameters<typeof this.fillArbeitsgenehmigung>[0]
    arbeitsbereitschaft?: string[]
  }) {
    await this.fillPersonendaten(data.personendaten)
    await this.fillKontaktdaten(data.kontaktdaten)

    if (data.alternativeAddress) {
      await this.fillAlternativeAddress(data.alternativeAddress)
    }

    await this.fillBankdaten(data.bankdaten)

    if (data.arbeitsgenehmigung) {
      await this.fillArbeitsgenehmigung(data.arbeitsgenehmigung)
    }

    if (data.arbeitsbereitschaft) {
      await this.setArbeitsbereitschaft(data.arbeitsbereitschaft)
    }

    await this.save()
  }

  /**
   * Verify that all required field errors are visible
   */
  async verifyRequiredFieldErrors() {
    await expect(this.anredeError).toBeVisible()
    await expect(this.geschlechtError).toBeVisible()
    await expect(this.vornameError).toBeVisible()
    await expect(this.nachnameError).toBeVisible()
    await expect(this.staatsbuergerschaftError).toBeVisible()
    await expect(this.svnrError).toBeVisible()
    await expect(this.geburtsDatumError).toBeVisible()
    await expect(this.ecardError).toBeVisible()
    await expect(this.strasseError).toBeVisible()
    await expect(this.plzError).toBeVisible()
    await expect(this.ortError).toBeVisible()
    await expect(this.landError).toBeVisible()
    await expect(this.emailError).toBeVisible()
    await expect(this.mobilnummerError).toBeVisible()
    await expect(this.bankError).toBeVisible()
    await expect(this.ibanError).toBeVisible()
    await expect(this.bicError).toBeVisible()
    await expect(this.bankcardError).toBeVisible()
  }

  /**
   * Verify that all required field errors are hidden
   */
  async verifyNoRequiredFieldErrors() {
    await expect(this.anredeError).toBeHidden()
    await expect(this.geschlechtError).toBeHidden()
    await expect(this.vornameError).toBeHidden()
    await expect(this.nachnameError).toBeHidden()
    await expect(this.staatsbuergerschaftError).toBeHidden()
    await expect(this.svnrError).toBeHidden()
    await expect(this.geburtsDatumError).toBeHidden()
    await expect(this.ecardError).toBeHidden()
    await expect(this.strasseError).toBeHidden()
    await expect(this.plzError).toBeHidden()
    await expect(this.ortError).toBeHidden()
    await expect(this.landError).toBeHidden()
    await expect(this.emailError).toBeHidden()
    await expect(this.mobilnummerError).toBeHidden()
    await expect(this.bankError).toBeHidden()
    await expect(this.ibanError).toBeHidden()
    await expect(this.bicError).toBeHidden()
    await expect(this.bankcardError).toBeHidden()
  }

  /**
   * Verify that the workflow badge for "Stammdaten erfassen" shows completed status
   */
  async verifyWorkflowCompleted() {
    const stammdatenWFI = this.page.getByTestId('Stammdaten erfassen-completed')
    await expect(stammdatenWFI).toBeVisible({ timeout: 10000 })
    await expect(stammdatenWFI).toHaveClass(/bg-green-600/)
  }

  /**
   * Verify that the workflow badge shows error status
   */
  async verifyWorkflowError() {
    const stammdatenWFI = this.page.getByTestId('Stammdaten erfassen-error')
    await expect(stammdatenWFI).toBeVisible({ timeout: 10000 })
    await expect(stammdatenWFI).toHaveClass(/bg-red-600/)
  }

  /**
   * Verify success toast message is shown
   */
  async verifySuccessToast() {
    await expect(this.toastContainer).toBeVisible({ timeout: 3000 })
  }
}
