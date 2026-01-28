import { type Locator, type Page, expect } from '@playwright/test'

/**
 * Page Object Model for the Teilnehmer Korrigieren (Correct Participant) page.
 * This page allows correction of participant data including personal data,
 * contact data, seminar data, and AMS data.
 */
export class TeilnehmerKorrigierenPage {
  readonly page: Page

  // Loaders
  readonly loader: Locator
  readonly buttonLoader: Locator

  // Page title
  readonly pageTitle: Locator

  // Personal Data Fields
  readonly anredeSelect: Locator
  readonly titelSelect: Locator
  readonly titel2Select: Locator
  readonly vornameInput: Locator
  readonly nachnameInput: Locator
  readonly svNummerInput: Locator
  readonly geschlechtSelect: Locator
  readonly geburtsdatumInput: Locator
  readonly nationInput: Locator
  readonly ursprungslandInput: Locator
  readonly geburtsortInput: Locator
  readonly mutterspracheInput: Locator

  // Contact Data Fields
  readonly strasseInput: Locator
  readonly plzInput: Locator
  readonly ortInput: Locator
  readonly landInput: Locator
  readonly telefonInput: Locator
  readonly emailInput: Locator

  // Seminar Data Fields
  readonly seminarBezeichnungInput: Locator
  readonly buchungsstatusInput: Locator
  readonly massnahmennummerInput: Locator
  readonly veranstaltungsnummerInput: Locator
  readonly anmerkungInput: Locator
  readonly zubuchungInput: Locator
  readonly geplantInput: Locator
  readonly eintrittInput: Locator
  readonly austrittInput: Locator

  // AMS Data Fields
  readonly rgsInput: Locator
  readonly betreuerTitelInput: Locator
  readonly betreuerVornameInput: Locator
  readonly betreuerNachnameInput: Locator

  // Buttons
  readonly saveButton: Locator
  readonly abmeldenButton: Locator

  // Toast
  readonly toastContainer: Locator

  // Error Section
  readonly errorSection: Locator

  constructor(page: Page) {
    this.page = page

    // Loaders
    this.loader = page.getByTestId('loader')
    this.buttonLoader = page.getByTestId('button-loader')

    // Page title
    this.pageTitle = page.locator('h1')

    // Personal Data Fields
    this.anredeSelect = page.getByTestId('anrede')
    this.titelSelect = page.getByTestId('titel')
    this.titel2Select = page.getByTestId('titel2')
    this.vornameInput = page.getByTestId('vorname')
    this.nachnameInput = page.getByTestId('nachname')
    this.svNummerInput = page.getByTestId('svNummer')
    this.geschlechtSelect = page.getByTestId('geschlecht')
    this.geburtsdatumInput = page.locator('#geburtsdatum')
    this.nationInput = page.getByTestId('nation')
    this.ursprungslandInput = page.getByTestId('ursprungsland')
    this.geburtsortInput = page.getByTestId('geburtsort')
    this.mutterspracheInput = page.getByTestId('muttersprache')

    // Contact Data Fields
    this.strasseInput = page.getByTestId('strasse')
    this.plzInput = page.getByTestId('plz')
    this.ortInput = page.getByTestId('ort')
    this.landInput = page.getByTestId('land')
    this.telefonInput = page.getByTestId('telefon')
    this.emailInput = page.getByTestId('email')

    // Seminar Data Fields
    this.seminarBezeichnungInput = page.getByTestId('seminarBezeichnung')
    this.buchungsstatusInput = page.getByTestId('buchungsstatus')
    this.massnahmennummerInput = page.getByTestId('massnahmennummer')
    this.veranstaltungsnummerInput = page.getByTestId('veranstaltungsnummer')
    this.anmerkungInput = page.getByTestId('anmerkung')
    this.zubuchungInput = page.locator('#zubuchung')
    this.geplantInput = page.locator('#geplant')
    this.eintrittInput = page.locator('#eintritt')
    this.austrittInput = page.locator('#austritt')

    // AMS Data Fields
    this.rgsInput = page.getByTestId('rgs')
    this.betreuerTitelInput = page.getByTestId('betreuerTitel')
    this.betreuerVornameInput = page.getByTestId('betreuerVorname')
    this.betreuerNachnameInput = page.getByTestId('betreuerNachname')

    // Buttons
    this.saveButton = page.getByTestId('tn-save').first()
    this.abmeldenButton = page.getByTestId('tn-abmelden')

    // Toast
    this.toastContainer = page.getByTestId('toast-container')

    // Error Section
    this.errorSection = page.locator('[data-testid="error-section"]')
  }

  /**
   * Navigate to the Teilnehmer Korrigieren page for a specific participant ID
   */
  async goto(teilnehmerId: string | number, seminarName?: string) {
    let url = `/teilnehmer/korrigieren/${teilnehmerId}`
    if (seminarName) {
      url += `?seminarName=${encodeURIComponent(seminarName)}`
    }
    await this.page.goto(url)
  }

  /**
   * Wait for the page to fully load (loader disappears)
   */
  async waitForPageLoad(timeout = 10000) {
    await this.loader.waitFor({ state: 'hidden', timeout })
  }

  /**
   * Wait for the loader to appear and then disappear
   */
  async waitForLoader(timeout = 20000) {
    await this.loader.first().waitFor({ state: 'visible', timeout })
    await this.loader.first().waitFor({ state: 'hidden', timeout })
  }

  /**
   * Wait for the button loader to appear and then disappear
   */
  async waitForButtonLoader(timeout = 20000) {
    await this.buttonLoader.first().waitFor({ state: 'visible', timeout })
    await this.buttonLoader.first().waitFor({ state: 'hidden', timeout })
  }

  /**
   * Wait for the toast notification to appear
   */
  async waitForToast(timeout = 20000) {
    await this.toastContainer.first().waitFor({ state: 'visible', timeout })
  }

  /**
   * Click the save button and wait for toast
   */
  async save() {
    await this.saveButton.click()
    await this.waitForToast()
  }

  /**
   * Fill personal data fields
   */
  async fillPersonalData(data: {
    anrede?: string
    titel?: string
    titel2?: string
    vorname?: string
    nachname?: string
    svNummer?: string
    geschlecht?: string
    geburtsdatum?: string
    nation?: string
    ursprungsland?: string
    geburtsort?: string
    muttersprache?: string
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
    if (data.vorname) {
      await this.vornameInput.fill(data.vorname)
    }
    if (data.nachname) {
      await this.nachnameInput.fill(data.nachname)
    }
    if (data.svNummer) {
      await this.svNummerInput.fill(data.svNummer)
    }
    if (data.geschlecht) {
      await this.geschlechtSelect.selectOption(data.geschlecht)
    }
    if (data.geburtsdatum) {
      await this.geburtsdatumInput.fill(data.geburtsdatum)
    }
    if (data.nation) {
      await this.nationInput.fill('')
      await this.nationInput.fill(data.nation)
      await this.page.getByTestId(`nation-option-${data.nation}`).click()
    }
    if (data.ursprungsland) {
      await this.ursprungslandInput.fill('')
      await this.ursprungslandInput.fill(data.ursprungsland)
      await this.page
        .getByTestId(`ursprungsland-option-${data.ursprungsland}`)
        .click()
    }
    if (data.geburtsort) {
      await this.geburtsortInput.fill(data.geburtsort)
    }
    if (data.muttersprache) {
      await this.mutterspracheInput.fill('')
      await this.mutterspracheInput.fill(data.muttersprache)
      await this.page
        .getByTestId(`muttersprache-option-${data.muttersprache}`)
        .click()
    }
  }

  /**
   * Fill contact data fields
   */
  async fillContactData(data: {
    strasse?: string
    plz?: string
    ort?: string
    telefon?: string
    email?: string
  }) {
    if (data.strasse) {
      await this.strasseInput.fill(data.strasse)
    }
    if (data.plz) {
      await this.plzInput.fill(data.plz)
    }
    if (data.ort) {
      await this.ortInput.fill(data.ort)
    }
    if (data.telefon) {
      await this.telefonInput.fill(data.telefon)
    }
    if (data.email) {
      await this.emailInput.fill(data.email)
    }
  }

  /**
   * Fill seminar data fields
   */
  async fillSeminarData(data: {
    seminarBezeichnung?: string
    buchungsstatus?: string
    massnahmennummer?: string
    veranstaltungsnummer?: string
    anmerkung?: string
    zubuchung?: string
    geplant?: string
    eintritt?: string
    austritt?: string
  }) {
    if (data.seminarBezeichnung) {
      await this.seminarBezeichnungInput.fill(data.seminarBezeichnung)
    }
    if (data.buchungsstatus) {
      await this.buchungsstatusInput.fill(data.buchungsstatus)
    }
    if (data.massnahmennummer) {
      await this.massnahmennummerInput.fill(data.massnahmennummer)
    }
    if (data.veranstaltungsnummer) {
      await this.veranstaltungsnummerInput.fill(data.veranstaltungsnummer)
    }
    if (data.anmerkung) {
      await this.anmerkungInput.fill(data.anmerkung)
    }
    if (data.zubuchung) {
      await this.zubuchungInput.fill(data.zubuchung)
    }
    if (data.geplant) {
      await this.geplantInput.fill(data.geplant)
    }
    if (data.eintritt) {
      await this.eintrittInput.fill(data.eintritt)
    }
    if (data.austritt) {
      await this.austrittInput.fill(data.austritt)
    }
  }

  /**
   * Fill AMS data fields
   */
  async fillAmsData(data: {
    rgs?: string
    betreuerTitel?: string
    betreuerVorname?: string
    betreuerNachname?: string
  }) {
    if (data.rgs) {
      await this.rgsInput.fill(data.rgs)
    }
    if (data.betreuerTitel) {
      await this.betreuerTitelInput.fill(data.betreuerTitel)
    }
    if (data.betreuerVorname) {
      await this.betreuerVornameInput.fill(data.betreuerVorname)
    }
    if (data.betreuerNachname) {
      await this.betreuerNachnameInput.fill(data.betreuerNachname)
    }
  }

  /**
   * Verify personal data field values
   */
  async expectPersonalData(data: {
    anrede?: string
    titel?: string
    titel2?: string
    vorname?: string
    nachname?: string
    svNummer?: string
    geschlecht?: string
    geburtsdatum?: string
    nation?: string
    ursprungsland?: string
    geburtsort?: string
    muttersprache?: string
  }) {
    if (data.anrede) {
      await expect(this.anredeSelect).toHaveValue(data.anrede)
    }
    if (data.titel) {
      await expect(this.titelSelect).toHaveValue(data.titel)
    }
    if (data.titel2) {
      await expect(this.titel2Select).toHaveValue(data.titel2)
    }
    if (data.vorname) {
      await expect(this.vornameInput).toHaveValue(data.vorname)
    }
    if (data.nachname) {
      await expect(this.nachnameInput).toHaveValue(data.nachname)
    }
    if (data.svNummer) {
      await expect(this.svNummerInput).toHaveValue(data.svNummer)
    }
    if (data.geschlecht) {
      await expect(this.geschlechtSelect).toHaveValue(data.geschlecht)
    }
    if (data.geburtsdatum) {
      await expect(this.geburtsdatumInput).toHaveValue(data.geburtsdatum)
    }
    if (data.nation) {
      await expect(this.nationInput).toHaveValue(data.nation)
    }
    if (data.ursprungsland) {
      await expect(this.ursprungslandInput).toHaveValue(data.ursprungsland)
    }
    if (data.geburtsort) {
      await expect(this.geburtsortInput).toHaveValue(data.geburtsort)
    }
    if (data.muttersprache) {
      await expect(this.mutterspracheInput).toHaveValue(data.muttersprache)
    }
  }

  /**
   * Verify contact data field values
   */
  async expectContactData(data: {
    strasse?: string
    plz?: string
    ort?: string
    telefon?: string
    email?: string
  }) {
    if (data.strasse) {
      await expect(this.strasseInput).toHaveValue(data.strasse)
    }
    if (data.plz) {
      await expect(this.plzInput).toHaveValue(data.plz)
    }
    if (data.ort) {
      await expect(this.ortInput).toHaveValue(data.ort)
    }
    if (data.telefon) {
      await expect(this.telefonInput).toHaveValue(data.telefon)
    }
    if (data.email) {
      await expect(this.emailInput).toHaveValue(data.email)
    }
  }

  /**
   * Verify seminar data field values
   */
  async expectSeminarData(data: {
    seminarBezeichnung?: string
    buchungsstatus?: string
    massnahmennummer?: string
    veranstaltungsnummer?: string
    anmerkung?: string
    zubuchung?: string
    geplant?: string
    eintritt?: string
    austritt?: string
  }) {
    if (data.seminarBezeichnung) {
      await expect(this.seminarBezeichnungInput).toHaveValue(
        data.seminarBezeichnung
      )
    }
    if (data.buchungsstatus) {
      await expect(this.buchungsstatusInput).toHaveValue(data.buchungsstatus)
    }
    if (data.massnahmennummer) {
      await expect(this.massnahmennummerInput).toHaveValue(
        data.massnahmennummer
      )
    }
    if (data.veranstaltungsnummer) {
      await expect(this.veranstaltungsnummerInput).toHaveValue(
        data.veranstaltungsnummer
      )
    }
    if (data.anmerkung) {
      await expect(this.anmerkungInput).toHaveValue(data.anmerkung)
    }
    if (data.zubuchung) {
      await expect(this.zubuchungInput).toHaveValue(data.zubuchung)
    }
    if (data.geplant) {
      await expect(this.geplantInput).toHaveValue(data.geplant)
    }
    if (data.eintritt) {
      await expect(this.eintrittInput).toHaveValue(data.eintritt)
    }
    if (data.austritt) {
      await expect(this.austrittInput).toHaveValue(data.austritt)
    }
  }

  /**
   * Verify AMS data field values
   */
  async expectAmsData(data: {
    rgs?: string
    betreuerTitel?: string
    betreuerVorname?: string
    betreuerNachname?: string
  }) {
    if (data.rgs) {
      await expect(this.rgsInput).toHaveValue(data.rgs)
    }
    if (data.betreuerTitel) {
      await expect(this.betreuerTitelInput).toHaveValue(data.betreuerTitel)
    }
    if (data.betreuerVorname) {
      await expect(this.betreuerVornameInput).toHaveValue(data.betreuerVorname)
    }
    if (data.betreuerNachname) {
      await expect(this.betreuerNachnameInput).toHaveValue(data.betreuerNachname)
    }
  }

  /**
   * Verify the page title is correct
   */
  async expectPageTitle(expectedTitle: string) {
    await expect(this.pageTitle).toContainText(expectedTitle)
  }

  /**
   * Verify the error section is visible
   */
  async expectErrorSection() {
    await expect(this.errorSection).toBeVisible()
  }

  /**
   * Verify the form is visible (participant loaded successfully)
   */
  async expectFormVisible() {
    await expect(this.vornameInput).toBeVisible()
    await expect(this.nachnameInput).toBeVisible()
    await expect(this.saveButton).toBeVisible()
  }

  /**
   * Check if abmelden button is visible (only for participants with personalnummer)
   */
  async expectAbmeldenButtonVisible() {
    await expect(this.abmeldenButton).toBeVisible()
  }

  /**
   * Check if abmelden button is hidden
   */
  async expectAbmeldenButtonHidden() {
    await expect(this.abmeldenButton).toBeHidden()
  }
}
