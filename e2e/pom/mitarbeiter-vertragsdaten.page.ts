import { expect, Locator, Page } from '@playwright/test'
import dayjs from 'dayjs'

/**
 * Page Object Model for Mitarbeiter Vertragsdaten (Employee Contract Data)
 * Corresponds to: mitarbeiter-vertragsdaten-erfassen-view.tsx
 */
export class MitarbeiterVertragsdatenPage {
  readonly page: Page

  // Navigator
  readonly navigatorTitle: Locator
  readonly navigatorContainer: Locator
  readonly pageHeading: Locator

  // Loader
  readonly loader: Locator

  // Save Button
  readonly saveButton: Locator

  // Allgemein Section (General)
  readonly eintrittInput: Locator
  readonly eintrittError: Locator
  readonly isBefristetCheckbox: Locator
  readonly befristungBisInput: Locator
  readonly kostenstelleSelect: Locator
  readonly kostenstelleError: Locator
  readonly dienstortButton: Locator
  readonly dienstortError: Locator
  readonly fuehrungskraftInput: Locator
  readonly fuehrungskraftError: Locator
  readonly kategorieSelect: Locator
  readonly kategorieError: Locator
  readonly taetigkeitButton: Locator
  readonly taetigkeitError: Locator
  readonly jobBezeichnungInput: Locator
  readonly jobBezeichnungError: Locator
  readonly kollektivvertragSelect: Locator
  readonly kollektivvertragError: Locator
  readonly verwendungsgruppeSelect: Locator
  readonly verwendungsgruppeError: Locator
  readonly notizAllgemeinError: Locator

  // Arbeitszeit Section (Working Hours)
  readonly beschaeftigungsausmassSelect: Locator
  readonly beschaeftigungsausmassError: Locator
  readonly beschaeftigungsstatusSelect: Locator
  readonly beschaeftigungsstatusError: Locator
  readonly wochenstundenInput: Locator
  readonly wochenstundenError: Locator
  readonly arbeitszeitmodellSelect: Locator
  readonly arbeitszeitmodellError: Locator
  readonly arbeitszeitmodellVonInput: Locator
  readonly arbeitszeitmodellVonError: Locator
  readonly arbeitszeitmodellBisInput: Locator
  readonly arbeitszeitmodellBisError: Locator
  readonly auswahlBegruendungFuerDurchrechnerSelect: Locator
  readonly auswahlBegruendungFuerDurchrechnerError: Locator
  readonly abrechnungsgruppeSelect: Locator
  readonly abrechnungsgruppeError: Locator
  readonly dienstnehmergruppeSelect: Locator
  readonly dienstnehmergruppeError: Locator
  readonly vereinbarungUEberstundenSelect: Locator

  // Quick Entry Fields (Montag bis Freitag)
  readonly montagBisFreitagVonInput: Locator
  readonly montagBisFreitagBisInput: Locator
  readonly montagBisFreitagNettoInput: Locator

  // Individual Day Fields
  readonly amontagVonPickerInput: Locator
  readonly amontagVonError: Locator
  readonly amontagBisPickerInput: Locator
  readonly amontagBisError: Locator
  readonly amontagNettoInput: Locator
  readonly amontagNettoError: Locator

  readonly adienstagVonPickerInput: Locator
  readonly adienstagVonError: Locator
  readonly adienstagBisPickerInput: Locator
  readonly adienstagBisError: Locator
  readonly adienstagNettoInput: Locator
  readonly adienstagNettoError: Locator

  readonly amittwochVonPickerInput: Locator
  readonly amittwochVonError: Locator
  readonly amittwochBisPickerInput: Locator
  readonly amittwochBisError: Locator
  readonly amittwochNettoInput: Locator
  readonly amittwochNettoError: Locator

  readonly adonnerstagVonPickerInput: Locator
  readonly adonnerstagVonError: Locator
  readonly adonnerstagBisPickerInput: Locator
  readonly adonnerstagBisError: Locator
  readonly adonnerstagNettoInput: Locator
  readonly adonnerstagNettoError: Locator

  readonly afreitagVonInput: Locator
  readonly afreitagVonPickerInput: Locator
  readonly afreitagVonError: Locator
  readonly afreitagBisInput: Locator
  readonly afreitagBisPickerInput: Locator
  readonly afreitagBisError: Locator
  readonly afreitagNettoInput: Locator
  readonly afreitagNettoError: Locator

  readonly asamstagVonError: Locator
  readonly asamstagBisError: Locator
  readonly asamstagNettoError: Locator

  readonly asonntagVonError: Locator
  readonly asonntagBisError: Locator
  readonly asonntagNettoError: Locator

  // Kernzeit (Core Time)
  readonly kernzeitCheckbox: Locator
  readonly montagBisFreitagKernzeitVonInput: Locator
  readonly montagBisFreitagKernzeitBisInput: Locator
  readonly kmontagVonInput: Locator
  readonly kmontagBisInput: Locator
  readonly kdienstagVonInput: Locator
  readonly kdienstagBisInput: Locator
  readonly kmittwochVonInput: Locator
  readonly kmittwochBisInput: Locator
  readonly kdonnerstagVonInput: Locator
  readonly kdonnerstagBisInput: Locator
  readonly kfreitagVonInput: Locator
  readonly kfreitagBisInput: Locator

  // Additional Working Hours Fields
  readonly spezielleMittagspausenregelungInput: Locator
  readonly spezielleMittagspausenregelungError: Locator
  readonly notizArbeitszeitInput: Locator
  readonly notizArbeitszeitError: Locator

  // Gehalt Section (Salary)
  readonly angerechneteIbisMonateInput: Locator
  readonly angerechneteIbisMonateError: Locator
  readonly gehaltVereinbartInput: Locator
  readonly gehaltVereinbartError: Locator
  readonly fixZulageCheckbox: Locator
  readonly fixZulageError: Locator
  readonly zulageInEuroFixInput: Locator
  readonly zulageInEuroFixError: Locator
  readonly funktionsZulageCheckbox: Locator
  readonly funktionsZulageError: Locator
  readonly zulageInEuroFunktionInput: Locator
  readonly zulageInEuroFunktionError: Locator
  readonly leitungsZulageCheckbox: Locator
  readonly leitungsZulageError: Locator
  readonly zulageInEuroLeitungInput: Locator
  readonly zulageInEuroLeitungError: Locator
  readonly jobticketCheckbox: Locator
  readonly jobticketError: Locator
  readonly jobticketTitleSelect: Locator
  readonly jobticketTitleError: Locator
  readonly notizGehaltInput: Locator
  readonly notizGehaltError: Locator

  // Zusatzvereinbarung Section (Additional Agreements)
  readonly mobileWorkingCheckbox: Locator
  readonly mobileWorkingError: Locator
  readonly weitereAdressezuHauptwohnsitzCheckbox: Locator
  readonly weitereAdressezuHauptwohnsitzError: Locator
  readonly strasseInput: Locator
  readonly strasseError: Locator
  readonly landInput: Locator
  readonly landError: Locator
  readonly plzInput: Locator
  readonly plzError: Locator
  readonly ortInput: Locator
  readonly ortError: Locator
  readonly notizZusatzvereinbarungInput: Locator
  readonly notizZusatzvereinbarungError: Locator

  // Vordienstzeiten (Previous Employment)
  readonly vordienstzeitCreateButton: Locator
  readonly vordienstzeitFormHeadline: Locator
  readonly vordienstzeitFormModal: Locator
  readonly vordienstzeitenVonInput: Locator
  readonly vordienstzeitenBisInput: Locator
  readonly vwochenstundenInput: Locator
  readonly firmaInput: Locator
  readonly vertragsartSelect: Locator
  readonly nachweisFileInput: Locator
  readonly vordienstzeitSaveButton: Locator

  // Unterhaltsberechtigte (Dependents)
  readonly unterhaltsberechtigtCreateButton: Locator
  readonly unterhaltsberechtigtFormHeadline: Locator
  readonly unterhaltsberechtigteFormModal: Locator
  readonly uvornameInput: Locator
  readonly unachnameInput: Locator
  readonly usvnrInput: Locator
  readonly ugeburtsdatumInput: Locator
  readonly uverwandtschaftSelect: Locator
  readonly unterhaltsberechtigtSaveButton: Locator

  constructor(page: Page) {
    this.page = page

    // Navigator
    this.navigatorTitle = page.getByTestId('navigator-title')
    this.navigatorContainer = page.getByTestId('navigator-container')
    this.pageHeading = page.locator('h2')

    // Loader
    this.loader = page.getByTestId('loader').first()

    // Save Button
    this.saveButton = page.getByTestId('save-button').first()

    // Allgemein Section
    this.eintrittInput = page.locator('#eintritt')
    this.eintrittError = page.getByTestId('eintritt-error')
    this.isBefristetCheckbox = page.getByTestId('isBefristet')
    this.befristungBisInput = page.locator('#befristungBis')
    this.kostenstelleSelect = page.getByTestId('kostenstelle')
    this.kostenstelleError = page.getByTestId('kostenstelle-error')
    this.dienstortButton = page.getByTestId('dienstort-button')
    this.dienstortError = page.getByTestId('dienstort-error')
    this.fuehrungskraftInput = page.getByTestId('fuehrungskraft')
    this.fuehrungskraftError = page.getByTestId('fuehrungskraft-error')
    this.kategorieSelect = page.getByTestId('kategorie')
    this.kategorieError = page.getByTestId('kategorie-error')
    this.taetigkeitButton = page.getByTestId('taetigkeit-button')
    this.taetigkeitError = page.getByTestId('taetigkeit-error')
    this.jobBezeichnungInput = page.getByTestId('jobBezeichnung')
    this.jobBezeichnungError = page.getByTestId('jobBezeichnung-error')
    this.kollektivvertragSelect = page.getByTestId('kollektivvertrag')
    this.kollektivvertragError = page.getByTestId('kollektivvertrag-error')
    this.verwendungsgruppeSelect = page.getByTestId('verwendungsgruppe')
    this.verwendungsgruppeError = page.getByTestId('verwendungsgruppe-error')
    this.notizAllgemeinError = page.getByTestId('notizAllgemein-error')

    // Arbeitszeit Section
    this.beschaeftigungsausmassSelect = page.getByTestId(
      'beschaeftigungsausmass'
    )
    this.beschaeftigungsausmassError = page.getByTestId(
      'beschaeftigungsausmass-error'
    )
    this.beschaeftigungsstatusSelect = page.getByTestId('beschaeftigungsstatus')
    this.beschaeftigungsstatusError = page.getByTestId(
      'beschaeftigungsstatus-error'
    )
    this.wochenstundenInput = page.getByTestId('wochenstunden')
    this.wochenstundenError = page.getByTestId('wochenstunden-error')
    this.arbeitszeitmodellSelect = page.getByTestId('arbeitszeitmodell')
    this.arbeitszeitmodellError = page.getByTestId('arbeitszeitmodell-error')
    this.arbeitszeitmodellVonInput = page.locator('#arbeitszeitmodellVon')
    this.arbeitszeitmodellVonError = page.getByTestId('arbeitszeitmodellVon-error')
    this.arbeitszeitmodellBisInput = page.locator('#arbeitszeitmodellBis')
    this.arbeitszeitmodellBisError = page.getByTestId('arbeitszeitmodellBis-error')
    this.auswahlBegruendungFuerDurchrechnerSelect = page.getByTestId(
      'auswahlBegruendungFuerDurchrechner'
    )
    this.auswahlBegruendungFuerDurchrechnerError = page.getByTestId(
      'auswahlBegruendungFuerDurchrechner-error'
    )
    this.abrechnungsgruppeSelect = page.getByTestId('abrechnungsgruppe')
    this.abrechnungsgruppeError = page.getByTestId('abrechnungsgruppe-error')
    this.dienstnehmergruppeSelect = page.getByTestId('dienstnehmergruppe')
    this.dienstnehmergruppeError = page.getByTestId('dienstnehmergruppe-error')
    this.vereinbarungUEberstundenSelect = page.getByTestId(
      'vereinbarungUEberstunden'
    )

    // Quick Entry Fields
    this.montagBisFreitagVonInput = page.getByTestId('montagBisFreitagVon')
    this.montagBisFreitagBisInput = page.getByTestId('montagBisFreitagBis')
    this.montagBisFreitagNettoInput = page.getByTestId('montagBisFreitagNetto')

    // Individual Day Fields
    this.amontagVonPickerInput = page.getByTestId('amontagVon-picker-input')
    this.amontagVonError = page.getByTestId('amontagVon-error')
    this.amontagBisPickerInput = page.getByTestId('amontagBis-picker-input')
    this.amontagBisError = page.getByTestId('amontagBis-error')
    this.amontagNettoInput = page.getByTestId('amontagNetto')
    this.amontagNettoError = page.getByTestId('amontagNetto-error')

    this.adienstagVonPickerInput = page.getByTestId('adienstagVon-picker-input')
    this.adienstagVonError = page.getByTestId('adienstagVon-error')
    this.adienstagBisPickerInput = page.getByTestId('adienstagBis-picker-input')
    this.adienstagBisError = page.getByTestId('adienstagBis-error')
    this.adienstagNettoInput = page.getByTestId('adienstagNetto')
    this.adienstagNettoError = page.getByTestId('adienstagNetto-error')

    this.amittwochVonPickerInput = page.getByTestId('amittwochVon-picker-input')
    this.amittwochVonError = page.getByTestId('amittwochVon-error')
    this.amittwochBisPickerInput = page.getByTestId('amittwochBis-picker-input')
    this.amittwochBisError = page.getByTestId('amittwochBis-error')
    this.amittwochNettoInput = page.getByTestId('amittwochNetto')
    this.amittwochNettoError = page.getByTestId('amittwochNetto-error')

    this.adonnerstagVonPickerInput = page.getByTestId(
      'adonnerstagVon-picker-input'
    )
    this.adonnerstagVonError = page.getByTestId('adonnerstagVon-error')
    this.adonnerstagBisPickerInput = page.getByTestId(
      'adonnerstagBis-picker-input'
    )
    this.adonnerstagBisError = page.getByTestId('adonnerstagBis-error')
    this.adonnerstagNettoInput = page.getByTestId('adonnerstagNetto')
    this.adonnerstagNettoError = page.getByTestId('adonnerstagNetto-error')

    this.afreitagVonInput = page.getByTestId('afreitagVon')
    this.afreitagVonPickerInput = page.getByTestId('afreitagVon-picker-input')
    this.afreitagVonError = page.getByTestId('afreitagVon-error')
    this.afreitagBisInput = page.getByTestId('afreitagBis')
    this.afreitagBisPickerInput = page.getByTestId('afreitagBis-picker-input')
    this.afreitagBisError = page.getByTestId('afreitagBis-error')
    this.afreitagNettoInput = page.getByTestId('afreitagNetto')
    this.afreitagNettoError = page.getByTestId('afreitagNetto-error')

    this.asamstagVonError = page.getByTestId('asamstagVon-error')
    this.asamstagBisError = page.getByTestId('asamstagBis-error')
    this.asamstagNettoError = page.getByTestId('asamstagNetto-error')

    this.asonntagVonError = page.getByTestId('asonntagVon-error')
    this.asonntagBisError = page.getByTestId('asonntagBis-error')
    this.asonntagNettoError = page.getByTestId('asonntagNetto-error')

    // Kernzeit
    this.kernzeitCheckbox = page.getByTestId('kernzeit')
    this.montagBisFreitagKernzeitVonInput = page.getByTestId(
      'montagBisFreitagKernzeitVon'
    )
    this.montagBisFreitagKernzeitBisInput = page.getByTestId(
      'montagBisFreitagKernzeitBis'
    )
    this.kmontagVonInput = page.getByTestId('kmontagVon')
    this.kmontagBisInput = page.getByTestId('kmontagBis')
    this.kdienstagVonInput = page.getByTestId('kdienstagVon')
    this.kdienstagBisInput = page.getByTestId('kdienstagBis')
    this.kmittwochVonInput = page.getByTestId('kmittwochVon')
    this.kmittwochBisInput = page.getByTestId('kmittwochBis')
    this.kdonnerstagVonInput = page.getByTestId('kdonnerstagVon')
    this.kdonnerstagBisInput = page.getByTestId('kdonnerstagBis')
    this.kfreitagVonInput = page.getByTestId('kfreitagVon')
    this.kfreitagBisInput = page.getByTestId('kfreitagBis')

    // Additional Working Hours Fields
    this.spezielleMittagspausenregelungInput = page.getByTestId(
      'spezielleMittagspausenregelung'
    )
    this.spezielleMittagspausenregelungError = page.getByTestId(
      'spezielleMittagspausenregelung-error'
    )
    this.notizArbeitszeitInput = page.getByTestId('notizArbeitszeit')
    this.notizArbeitszeitError = page.getByTestId('notizArbeitszeit-error')

    // Gehalt Section
    this.angerechneteIbisMonateInput = page.getByTestId(
      'angerechneteIbisMonate'
    )
    this.angerechneteIbisMonateError = page.getByTestId(
      'angerechneteIbisMonate-error'
    )
    this.gehaltVereinbartInput = page.getByTestId('gehaltVereinbart')
    this.gehaltVereinbartError = page.getByTestId('gehaltVereinbart-error')
    this.fixZulageCheckbox = page.getByTestId('fixZulage')
    this.fixZulageError = page.getByTestId('fixZulage-error')
    this.zulageInEuroFixInput = page.getByTestId('zulageInEuroFix')
    this.zulageInEuroFixError = page.getByTestId('zulageInEuroFix-error')
    this.funktionsZulageCheckbox = page.getByTestId('funktionsZulage')
    this.funktionsZulageError = page.getByTestId('funktionsZulage-error')
    this.zulageInEuroFunktionInput = page.getByTestId('zulageInEuroFunktion')
    this.zulageInEuroFunktionError = page.getByTestId(
      'zulageInEuroFunktion-error'
    )
    this.leitungsZulageCheckbox = page.getByTestId('leitungsZulage')
    this.leitungsZulageError = page.getByTestId('leitungsZulage-error')
    this.zulageInEuroLeitungInput = page.getByTestId('zulageInEuroLeitung')
    this.zulageInEuroLeitungError = page.getByTestId('zulageInEuroLeitung-error')
    this.jobticketCheckbox = page.getByTestId('jobticket')
    this.jobticketError = page.getByTestId('jobticket-error')
    this.jobticketTitleSelect = page.getByTestId('jobticketTitle')
    this.jobticketTitleError = page.getByTestId('jobticketTitle-error')
    this.notizGehaltInput = page.getByTestId('notizGehalt')
    this.notizGehaltError = page.getByTestId('notizGehalt-error')

    // Zusatzvereinbarung Section
    this.mobileWorkingCheckbox = page.getByTestId('mobileWorking')
    this.mobileWorkingError = page.getByTestId('mobileWorking-error')
    this.weitereAdressezuHauptwohnsitzCheckbox = page.getByTestId(
      'weitereAdressezuHauptwohnsitz'
    )
    this.weitereAdressezuHauptwohnsitzError = page.getByTestId(
      'weitereAdressezuHauptwohnsitz-error'
    )
    this.strasseInput = page.getByTestId('strasse')
    this.strasseError = page.getByTestId('strasse-error')
    this.landInput = page.getByTestId('land')
    this.landError = page.getByTestId('land-error')
    this.plzInput = page.getByTestId('plz')
    this.plzError = page.getByTestId('plz-error')
    this.ortInput = page.getByTestId('ort')
    this.ortError = page.getByTestId('ort-error')
    this.notizZusatzvereinbarungInput = page.getByTestId(
      'notizZusatzvereinbarung'
    )
    this.notizZusatzvereinbarungError = page.getByTestId(
      'notizZusatzvereinbarung-error'
    )

    // Vordienstzeiten
    this.vordienstzeitCreateButton = page.getByTestId(
      'vordienstzeit-create-button'
    )
    this.vordienstzeitFormHeadline = page.getByTestId(
      'vordienstzeiten-form-headline'
    )
    this.vordienstzeitFormModal = page.getByTestId('vordienstzeiten-form-modal')
    this.vordienstzeitenVonInput = page.locator('#vordienstzeitenVon')
    this.vordienstzeitenBisInput = page.locator('#vordienstzeitenBis')
    this.vwochenstundenInput = page.getByTestId('vwochenstunden')
    this.firmaInput = page.getByTestId('firma')
    this.vertragsartSelect = page.getByTestId('vertragsart')
    this.nachweisFileInput = page.getByTestId('nachweis')
    this.vordienstzeitSaveButton = page.getByTestId('vordienstzeit-save-button')

    // Unterhaltsberechtigte
    this.unterhaltsberechtigtCreateButton = page.getByTestId(
      'unterhaltsberechtigt-create-button'
    )
    this.unterhaltsberechtigtFormHeadline = page.getByTestId(
      'unterhaltsberechtigt-form-headline'
    )
    this.unterhaltsberechtigteFormModal = page.getByTestId(
      'unterhaltsberechtigte-form-modal'
    )
    this.uvornameInput = page.getByTestId('uvorname')
    this.unachnameInput = page.getByTestId('unachname')
    this.usvnrInput = page.getByTestId('usvnr')
    this.ugeburtsdatumInput = page.locator('#ugeburtsdatum')
    this.uverwandtschaftSelect = page.getByTestId('uverwandtschaft')
    this.unterhaltsberechtigtSaveButton = page.getByTestId(
      'unterhaltsberechtigt-save-button'
    )
  }

  /**
   * Navigate to the Vertragsdaten page
   */
  async goto(personalnummer: string, workflowItemId = '4') {
    await this.page.goto(
      `/mitarbeiter/onboarding/${personalnummer}?wfi=${workflowItemId}`
    )
  }

  /**
   * Wait for the loader to appear and disappear
   */
  async waitForLoader(timeout = 20000) {
    await this.loader.waitFor({ state: 'visible', timeout })
    await this.loader.waitFor({ state: 'hidden', timeout })
  }

  /**
   * Click save button and wait for loader
   */
  async saveVertragsdaten() {
    await this.saveButton.click()
    await this.waitForLoader()
  }

  /**
   * Verify that the navigator is visible and contains expected items
   */
  async verifyNavigator() {
    await expect(this.navigatorTitle).toContainText('Navigator', {
      timeout: 10000,
    })
    await expect(this.navigatorContainer).toContainText('Stammdaten erfassen', {
      timeout: 10000,
    })
    await expect(this.navigatorContainer).toContainText(
      'Vertragsdaten erfassen',
      { timeout: 10000 }
    )
    await expect(this.pageHeading).toContainText('Vertragsdaten erfassen')
  }

  /**
   * Fill Allgemein (General) section
   */
  async fillAllgemeinSection(data: {
    eintritt: string
    befristungBis?: string
    isBefristet?: boolean
    kostenstelle: string
    dienstort: string
    fuehrungskraft: string
    kategorie?: string
    taetigkeit: string
    jobBezeichnung: string
    kollektivvertrag: string
    verwendungsgruppe: string
  }) {
    await this.loader.waitFor({ state: 'hidden', timeout: 10000 })

    // Eintritt
    await this.eintrittInput.click()
    await this.eintrittInput.fill(data.eintritt)

    // Befristung
    if (data.isBefristet && data.befristungBis) {
      const isBefristungCheckboxChecked =
        await this.isBefristetCheckbox.isChecked()
      if (!isBefristungCheckboxChecked) {
        await this.isBefristetCheckbox.click({ force: true })
      }
      await expect(this.isBefristetCheckbox).toBeChecked()
      await this.befristungBisInput.fill(data.befristungBis)
    }

    // Kostenstelle (native select)
    await this.kostenstelleSelect.selectOption(data.kostenstelle)

    // Dienstort (combobox)
    await this.dienstortButton.click()
    await this.page.getByTestId(`dienstort-option-${data.dienstort}`).click()

    // Führungskraft (combobox with search)
    await this.fuehrungskraftInput.fill(data.fuehrungskraft)
    await this.page
      .getByTestId(`fuehrungskraft-option-${data.fuehrungskraft}`)
      .click()

    // Kategorie (if provided)
    if (data.kategorie) {
      await this.kategorieSelect.selectOption(data.kategorie)
    }

    // Tätigkeit
    await this.taetigkeitButton.click()
    await this.page.getByTestId(`taetigkeit-option-${data.taetigkeit}`).click()

    // Job Bezeichnung
    await this.jobBezeichnungInput.fill(data.jobBezeichnung)
    await this.page
      .getByTestId(`jobBezeichnung-option-${data.jobBezeichnung}`)
      .click()

    // Kollektivvertrag
    await this.kollektivvertragSelect.selectOption(data.kollektivvertrag)

    // Verwendungsgruppe
    await this.verwendungsgruppeSelect.selectOption(data.verwendungsgruppe)
  }

  /**
   * Verify Allgemein section has no errors
   */
  async verifyAllgemeinNoErrors() {
    await expect(this.eintrittError).toBeHidden()
    await expect(this.kostenstelleError).toBeHidden()
    await expect(this.dienstortError).toBeHidden()
    await expect(this.fuehrungskraftError).toBeHidden()
    await expect(this.kategorieError).toBeHidden()
    await expect(this.taetigkeitError).toBeHidden()
    await expect(this.jobBezeichnungError).toBeHidden()
    await expect(this.kollektivvertragError).toBeHidden()
    await expect(this.verwendungsgruppeError).toBeHidden()
    await expect(this.notizAllgemeinError).toBeHidden()
  }

  /**
   * Fill Arbeitszeit (Working Hours) section
   */
  async fillArbeitszeitSection(data: {
    beschaeftigungsausmass: string
    beschaeftigungsstatus: string
    wochenstunden: string
    arbeitszeitmodell: string
    abrechnungsgruppe: string
    dienstnehmergruppe: string
    montagBisFreitagVon?: string
    montagBisFreitagBis?: string
    montagBisFreitagNetto?: string
    freitagVon?: string
    freitagBis?: string
    freitagNetto?: string
    spezielleMittagspausenregelung?: string
    notizArbeitszeit?: string
  }) {
    await this.beschaeftigungsausmassSelect.selectOption(
      data.beschaeftigungsausmass
    )
    await this.beschaeftigungsstatusSelect.selectOption(
      data.beschaeftigungsstatus
    )
    await this.wochenstundenInput.fill(data.wochenstunden)
    await this.arbeitszeitmodellSelect.selectOption(data.arbeitszeitmodell)

    await this.abrechnungsgruppeSelect.selectOption(data.abrechnungsgruppe)
    await this.dienstnehmergruppeSelect.selectOption(data.dienstnehmergruppe)

    // Fill quick entry fields (Monday to Friday)
    if (
      data.montagBisFreitagVon &&
      data.montagBisFreitagBis &&
      data.montagBisFreitagNetto
    ) {
      await this.montagBisFreitagVonInput.fill(data.montagBisFreitagVon)
      await this.montagBisFreitagBisInput.fill(data.montagBisFreitagBis)
      await this.montagBisFreitagNettoInput.fill(data.montagBisFreitagNetto)
    }

    // Override Friday if needed
    if (data.freitagVon && data.freitagBis && data.freitagNetto) {
      await this.afreitagVonInput.fill(data.freitagVon)
      await this.afreitagBisInput.fill(data.freitagBis)
      await this.afreitagNettoInput.fill(data.freitagNetto)
    }

    // Optional fields
    if (data.spezielleMittagspausenregelung) {
      await this.spezielleMittagspausenregelungInput.fill(
        data.spezielleMittagspausenregelung
      )
    }

    if (data.notizArbeitszeit) {
      await this.notizArbeitszeitInput.fill(data.notizArbeitszeit)
    }
  }

  /**
   * Verify Arbeitszeit section has no errors
   */
  async verifyArbeitszeitNoErrors() {
    await expect(this.beschaeftigungsausmassError).toBeHidden()
    await expect(this.beschaeftigungsstatusError).toBeHidden()
    await expect(this.wochenstundenError).toBeHidden()
    await expect(this.arbeitszeitmodellError).toBeHidden()
    await expect(this.arbeitszeitmodellVonError).toBeHidden()
    await expect(this.arbeitszeitmodellBisError).toBeHidden()
    await expect(this.auswahlBegruendungFuerDurchrechnerError).toBeHidden()
    await expect(this.abrechnungsgruppeError).toBeHidden()
    await expect(this.dienstnehmergruppeError).toBeHidden()
    await expect(this.amontagVonError).toBeHidden()
    await expect(this.amontagBisError).toBeHidden()
    await expect(this.amontagNettoError).toBeHidden()
    await expect(this.adienstagVonError).toBeHidden()
    await expect(this.adienstagBisError).toBeHidden()
    await expect(this.adienstagNettoError).toBeHidden()
    await expect(this.amittwochVonError).toBeHidden()
    await expect(this.amittwochBisError).toBeHidden()
    await expect(this.amittwochNettoError).toBeHidden()
    await expect(this.adonnerstagVonError).toBeHidden()
    await expect(this.adonnerstagBisError).toBeHidden()
    await expect(this.adonnerstagNettoError).toBeHidden()
    await expect(this.afreitagVonError).toBeHidden()
    await expect(this.afreitagBisError).toBeHidden()
    await expect(this.afreitagNettoError).toBeHidden()
    await expect(this.asamstagVonError).toBeHidden()
    await expect(this.asamstagBisError).toBeHidden()
    await expect(this.asamstagNettoError).toBeHidden()
    await expect(this.asonntagVonError).toBeHidden()
    await expect(this.asonntagBisError).toBeHidden()
    await expect(this.asonntagNettoError).toBeHidden()
    await expect(this.spezielleMittagspausenregelungError).toBeHidden()
    await expect(this.notizArbeitszeitError).toBeHidden()
  }

  /**
   * Verify quick entry fields populated all weekdays correctly
   */
  async verifyQuickEntryPopulation(
    expectedVon: string,
    expectedBis: string,
    expectedNetto: string
  ) {
    await expect(this.amontagVonPickerInput).toHaveValue(expectedVon)
    await expect(this.amontagBisPickerInput).toHaveValue(expectedBis)
    await expect(this.amontagNettoInput).toHaveValue(expectedNetto)

    await expect(this.adienstagVonPickerInput).toHaveValue(expectedVon)
    await expect(this.adienstagBisPickerInput).toHaveValue(expectedBis)
    await expect(this.adienstagNettoInput).toHaveValue(expectedNetto)

    await expect(this.amittwochVonPickerInput).toHaveValue(expectedVon)
    await expect(this.amittwochBisPickerInput).toHaveValue(expectedBis)
    await expect(this.amittwochNettoInput).toHaveValue(expectedNetto)

    await expect(this.adonnerstagVonPickerInput).toHaveValue(expectedVon)
    await expect(this.adonnerstagBisPickerInput).toHaveValue(expectedBis)
    await expect(this.adonnerstagNettoInput).toHaveValue(expectedNetto)

    await expect(this.afreitagVonPickerInput).toHaveValue(expectedVon)
    await expect(this.afreitagBisPickerInput).toHaveValue(expectedBis)
    await expect(this.afreitagNettoInput).toHaveValue(expectedNetto)
  }

  /**
   * Fill Gehalt (Salary) section
   */
  async fillGehaltSection(data: {
    angerechneteIbisMonate: string
    gehaltVereinbart: string
    fixZulage?: { enabled: boolean; betrag?: string }
    funktionsZulage?: { enabled: boolean; betrag?: string }
    leitungsZulage?: { enabled: boolean; betrag?: string }
    jobticket?: { enabled: boolean; title?: string }
    notizGehalt?: string
  }) {
    await this.angerechneteIbisMonateInput.fill(data.angerechneteIbisMonate)
    await this.gehaltVereinbartInput.fill(data.gehaltVereinbart)

    // Fix Zulage
    if (data.fixZulage?.enabled) {
      if (!(await this.fixZulageCheckbox.isChecked())) {
        await this.fixZulageCheckbox.click({ force: true })
      }
      await expect(this.fixZulageCheckbox).toBeChecked()
      if (data.fixZulage.betrag) {
        await this.zulageInEuroFixInput.fill(data.fixZulage.betrag)
      }
    }

    // Funktions Zulage
    if (data.funktionsZulage?.enabled) {
      if (!(await this.funktionsZulageCheckbox.isChecked())) {
        await this.funktionsZulageCheckbox.click({ force: true })
      }
      await expect(this.funktionsZulageCheckbox).toBeChecked()
      if (data.funktionsZulage.betrag) {
        await this.zulageInEuroFunktionInput.fill(data.funktionsZulage.betrag)
      }
    }

    // Leitungs Zulage
    if (data.leitungsZulage?.enabled) {
      if (!(await this.leitungsZulageCheckbox.isChecked())) {
        await this.leitungsZulageCheckbox.click({ force: true })
      }
      await expect(this.leitungsZulageCheckbox).toBeChecked()
      if (data.leitungsZulage.betrag) {
        await this.zulageInEuroLeitungInput.fill(data.leitungsZulage.betrag)
      }
    }

    // Jobticket
    if (data.jobticket?.enabled) {
      if (!(await this.jobticketCheckbox.isChecked())) {
        await this.jobticketCheckbox.click({ force: true })
      }
      await expect(this.jobticketCheckbox).toBeChecked()
      if (data.jobticket.title) {
        await this.jobticketTitleSelect.selectOption(data.jobticket.title)
      }
    }

    // Notiz
    if (data.notizGehalt) {
      await this.notizGehaltInput.fill(data.notizGehalt)
    }
  }

  /**
   * Verify Gehalt section has no errors
   */
  async verifyGehaltNoErrors() {
    await expect(this.angerechneteIbisMonateError).toBeHidden()
    await expect(this.gehaltVereinbartError).toBeHidden()
    await expect(this.fixZulageError).toBeHidden()
    await expect(this.zulageInEuroFixError).toBeHidden()
    await expect(this.funktionsZulageError).toBeHidden()
    await expect(this.zulageInEuroFunktionError).toBeHidden()
    await expect(this.leitungsZulageError).toBeHidden()
    await expect(this.zulageInEuroLeitungError).toBeHidden()
    await expect(this.jobticketError).toBeHidden()
    await expect(this.jobticketTitleError).toBeHidden()
    await expect(this.notizGehaltError).toBeHidden()
  }

  /**
   * Fill Zusatzvereinbarung (Additional Agreements) section
   */
  async fillZusatzvereinbarungSection(data: {
    mobileWorking?: boolean
    weitereAdressezuHauptwohnsitz?: boolean
    strasse?: string
    land?: string
    plz?: string
    ort?: string
    notizZusatzvereinbarung?: string
  }) {
    await this.loader.waitFor({ state: 'hidden', timeout: 10000 })

    // Mobile Working
    if (data.mobileWorking) {
      if (!(await this.mobileWorkingCheckbox.isChecked())) {
        await this.mobileWorkingCheckbox.click({ force: true })
      }
      await expect(this.mobileWorkingCheckbox).toBeChecked()
    }

    // Weitere Adresse
    if (data.weitereAdressezuHauptwohnsitz) {
      if (!(await this.weitereAdressezuHauptwohnsitzCheckbox.isChecked())) {
        await this.weitereAdressezuHauptwohnsitzCheckbox.click({ force: true })
      }
      await expect(this.weitereAdressezuHauptwohnsitzCheckbox).toBeChecked()

      if (data.strasse) {
        await this.strasseInput.fill(data.strasse)
      }

      if (data.land) {
        await this.landInput.fill(data.land)
        await this.page.getByTestId(`land-option-${data.land}`).click()
      }

      if (data.plz) {
        await this.plzInput.fill(data.plz)
      }

      if (data.ort) {
        await this.ortInput.fill(data.ort)
      }
    }

    if (data.notizZusatzvereinbarung) {
      await this.notizZusatzvereinbarungInput.fill(
        data.notizZusatzvereinbarung
      )
    }
  }

  /**
   * Verify Zusatzvereinbarung section has no errors
   */
  async verifyZusatzvereinbarungNoErrors() {
    await expect(this.mobileWorkingError).toBeHidden()
    await expect(this.weitereAdressezuHauptwohnsitzError).toBeHidden()
    await expect(this.strasseError).toBeHidden()
    await expect(this.landError).toBeHidden()
    await expect(this.plzError).toBeHidden()
    await expect(this.ortError).toBeHidden()
    await expect(this.notizZusatzvereinbarungError).toBeHidden()
  }

  /**
   * Create a Vordienstzeit (Previous Employment) entry
   */
  async createVordienstzeit(data: {
    von: string // Format: DD.MM.YYYY
    bis: string // Format: DD.MM.YYYY
    wochenstunden: string
    firma: string
    vertragsart: string
    nachweisFilePath?: string
  }) {
    await this.vordienstzeitCreateButton.waitFor({ state: 'visible' })
    await this.vordienstzeitCreateButton.click()
    await this.vordienstzeitFormHeadline.waitFor({ state: 'visible' })

    await this.vordienstzeitenVonInput.fill(data.von)
    await this.page.keyboard.press('Tab')
    await this.vordienstzeitenBisInput.fill(data.bis)
    await this.page.keyboard.press('Tab')

    await this.vwochenstundenInput.fill(data.wochenstunden)
    await this.firmaInput.fill(data.firma)
    await this.vertragsartSelect.selectOption(data.vertragsart)

    if (data.nachweisFilePath) {
      await this.nachweisFileInput.setInputFiles(data.nachweisFilePath)
    }

    await this.vordienstzeitSaveButton.click()
    await this.vordienstzeitFormModal.waitFor({ state: 'hidden' })
  }

  /**
   * Edit a Vordienstzeit entry
   */
  async editVordienstzeit(
    companyName: string,
    data: {
      von?: string
      bis?: string
      wochenstunden?: string
      firma?: string
      vertragsart?: string
    }
  ) {
    await this.page
      .locator('tr', { hasText: companyName })
      .getByTestId('vordienstzeit-edit-button')
      .click()

    await this.page.waitForTimeout(1000)
    await this.vordienstzeitFormHeadline.waitFor({ state: 'visible' })

    if (data.vertragsart) {
      await this.vertragsartSelect.selectOption(data.vertragsart)
    }

    if (data.firma) {
      await this.firmaInput.fill(data.firma)
    }

    if (data.von) {
      await this.vordienstzeitenVonInput.fill(data.von)
      await this.page.keyboard.press('Tab')
    }

    if (data.bis) {
      await this.vordienstzeitenBisInput.fill(data.bis)
      await this.page.keyboard.press('Tab')
    }

    if (data.wochenstunden) {
      await this.vwochenstundenInput.fill(data.wochenstunden)
    }

    await this.vordienstzeitSaveButton.click()
    await this.vordienstzeitFormModal.waitFor({ state: 'hidden' })
  }

  /**
   * Delete a Vordienstzeit entry
   */
  async deleteVordienstzeit(companyName: string) {
    await this.page
      .locator('tr', { hasText: companyName })
      .getByTestId('vordienstzeit-delete-button')
      .click()

    await expect(
      this.page.getByTestId('vordienstzeit-delete-confirm-button')
    ).toBeVisible()

    await this.page.getByTestId('vordienstzeit-delete-confirm-button').click()
    await expect(
      this.page.getByTestId('vordienstzeit-delete-confirm-button')
    ).toBeHidden()
  }

  /**
   * Create an Unterhaltsberechtigte (Dependent) entry
   */
  async createUnterhaltsberechtigte(data: {
    vorname: string
    nachname: string
    svnr: string
    geburtsdatum: string // Format: YYYY-MM-DD
    verwandtschaft: string
  }) {
    await this.unterhaltsberechtigtCreateButton.waitFor({ state: 'visible' })
    await this.unterhaltsberechtigtCreateButton.click()
    await this.unterhaltsberechtigtFormHeadline.waitFor({ state: 'visible' })

    await this.uvornameInput.fill(data.vorname)
    await this.unachnameInput.fill(data.nachname)
    await this.usvnrInput.fill(data.svnr)
    await this.ugeburtsdatumInput.fill(data.geburtsdatum)

    await this.uverwandtschaftSelect.click()
    await this.uverwandtschaftSelect.selectOption(data.verwandtschaft)

    await this.unterhaltsberechtigtSaveButton.click()
    await this.unterhaltsberechtigteFormModal.waitFor({ state: 'hidden' })
  }

  /**
   * Edit an Unterhaltsberechtigte entry
   */
  async editUnterhaltsberechtigte(
    svnr: string,
    data: {
      vorname?: string
      nachname?: string
      svnr?: string
      geburtsdatum?: string
      verwandtschaft?: string
    }
  ) {
    await this.page
      .locator('tr', { hasText: svnr })
      .getByTestId('unterhaltsberechtigt-edit-button')
      .click()

    await this.unterhaltsberechtigtFormHeadline.waitFor({ state: 'visible' })

    if (data.vorname) {
      await this.uvornameInput.fill(data.vorname)
    }

    if (data.nachname) {
      await this.unachnameInput.fill(data.nachname)
    }

    if (data.svnr) {
      await this.usvnrInput.fill(data.svnr)
    }

    if (data.geburtsdatum) {
      await this.ugeburtsdatumInput.fill(data.geburtsdatum)
      await this.page.keyboard.press('Tab')
    }

    if (data.verwandtschaft) {
      await this.uverwandtschaftSelect.click()
      await this.uverwandtschaftSelect.selectOption(data.verwandtschaft)
    }

    await this.unterhaltsberechtigtSaveButton.click()
    await this.unterhaltsberechtigteFormModal.waitFor({ state: 'hidden' })
  }

  /**
   * Delete an Unterhaltsberechtigte entry
   */
  async deleteUnterhaltsberechtigte(svnr: string) {
    await this.page
      .locator('tr', { hasText: svnr })
      .getByTestId('unterhaltsberechtigt-delete-button')
      .click()

    await expect(
      this.page.getByTestId('unterhaltsberechtigt-delete-confirm-button')
    ).toBeVisible()

    await this.page
      .getByTestId('unterhaltsberechtigt-delete-confirm-button')
      .click()
    await expect(
      this.page.getByTestId('unterhaltsberechtigt-delete-confirm-button')
    ).toBeHidden()
  }

  /**
   * Configure Kernzeit (Core Hours) for Gleitzeit model
   */
  async configureKernzeit(data: {
    montagBisFreitagVon: string
    montagBisFreitagBis: string
    freitagVon?: string
    freitagBis?: string
  }) {
    await this.kernzeitCheckbox.waitFor({ state: 'visible', timeout: 10000 })
    await expect(this.kernzeitCheckbox).toBeEnabled()

    if (!(await this.kernzeitCheckbox.isChecked())) {
      await this.kernzeitCheckbox.click({ force: true })
    }
    await expect(this.kernzeitCheckbox).toBeChecked()

    await this.montagBisFreitagKernzeitVonInput.fill(data.montagBisFreitagVon)
    await this.montagBisFreitagKernzeitBisInput.fill(data.montagBisFreitagBis)

    // Verify quick entry populated all days
    await expect(this.kmontagVonInput).toHaveValue(data.montagBisFreitagVon)
    await expect(this.kmontagBisInput).toHaveValue(data.montagBisFreitagBis)

    // Override Friday if needed
    if (data.freitagVon && data.freitagBis) {
      await this.kfreitagVonInput.fill(data.freitagVon)
      await this.kfreitagBisInput.fill(data.freitagBis)
    }
  }

  /**
   * Select combobox option by clicking button and option
   */
  async selectComboboxOption(testId: string, optionText: string) {
    await this.page.getByTestId(`${testId}-button`).click()
    await this.page.getByTestId(`${testId}-option-${optionText}`).click()
  }

  /**
   * Get dropdown options for a select element
   */
  async getDropdownOptions(testId: string): Promise<string[]> {
    const dropdown = await this.page.getByTestId(testId)
    return dropdown.evaluate((select: HTMLSelectElement) =>
      Array.from(select.options).map((option) => option.text)
    )
  }

  /**
   * Verify that eintritt date sets arbeitszeitmodellVon correctly
   */
  async verifyEintrittSetsArbeitszeitmodellVon() {
    const eintrittValue = await this.eintrittInput.inputValue()
    await expect(this.arbeitszeitmodellVonInput).toHaveValue(eintrittValue)
    await expect(this.arbeitszeitmodellVonInput).toBeDisabled()
  }
}
