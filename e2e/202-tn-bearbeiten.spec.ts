import { de, Faker } from '@faker-js/faker'
import { expect, Page, test } from '@playwright/test'
import dayjs from 'dayjs'

import { TN_IDS } from './private/tn-data' // user reference data that shouldn't be tracked
import {
  deletePersonalnummer,
  loadPersonalnummer,
  savePersonalnummer,
} from './test-utils'

// TODO: move to playwright config
export const faker = new Faker({
  locale: [de],
})
// https://v9.fakerjs.dev/guide/

const SELECTED_TN = TN_IDS[6]

let personalnummer: string | null = null

test.beforeEach(async ({ page }) => {
  // get personalNummer from JSON
  const loadedPersonalnummer = await loadPersonalnummer()
  expect(loadedPersonalnummer).not.toBeUndefined()

  personalnummer = loadedPersonalnummer

  // go to teilnehmer edit page
  await page.goto(`/teilnehmer/bearbeiten/${personalnummer}`)

  // wait for loader to disappear
  await page.getByTestId('loader').waitFor({ state: 'hidden', timeout: 10000 })
})

async function waitForLoader(page: Page) {
  await page
    .getByTestId('loader')
    .first()
    .waitFor({ state: 'visible', timeout: 20000 })
  await page
    .getByTestId('loader')
    .first()
    .waitFor({ state: 'hidden', timeout: 20000 })
}

async function waitForButtonLoader(page: Page) {
  await page
    .getByTestId('button-loader')
    .first()
    .waitFor({ state: 'visible', timeout: 20000 })
  await page
    .getByTestId('button-loader')
    .first()
    .waitFor({ state: 'hidden', timeout: 20000 })
}

test.describe('Edit Teilnehmer fields', () => {
  test('Edit Personal Data & Contact Data', async ({ page }) => {
    const NEW_TN_DATA = {
      anrede: 'Frau',
      titel: 'Dr. Phil.',
      titel2: 'MSc',
      geschlecht: 'Divers',
      nation: 'Deutschland',
      ursprungsland: 'Deutschland',
      geburtsort: 'Berlin',
      strasse: 'Wagramer Straße 12',
      muttersprache: 'Deutsch',
      plz: '1210',
      ort: 'Wien',
      ort_corrected: 'Wien,Floridsdorf',
      telefon: '0660 123 232 232',
      email: 'dev.tester@msg-plaut.com',
    }

    await test.step('Edit personal data and contact data and save', async () => {
      // personal data
      await page.getByTestId('geschlecht').selectOption(NEW_TN_DATA.geschlecht)

      // purge first to allow popup to open
      await page.getByTestId('nation').fill('')
      await page.getByTestId('nation').fill(NEW_TN_DATA.nation)
      await page.getByTestId(`nation-option-${NEW_TN_DATA.nation}`).click()

      await page.getByTestId('ursprungsland').fill('')
      await page.getByTestId('ursprungsland').fill(NEW_TN_DATA.ursprungsland)
      await page
        .getByTestId(`ursprungsland-option-${NEW_TN_DATA.ursprungsland}`)
        .click()

      await page.getByTestId('geburtsort').fill(NEW_TN_DATA.geburtsort)

      await page.getByTestId('muttersprache').fill('')
      await page.getByTestId('muttersprache').fill(NEW_TN_DATA.muttersprache)
      await page
        .getByTestId(`muttersprache-option-${NEW_TN_DATA.muttersprache}`)
        .click()

      // contact data
      await page.getByTestId('strasse').fill(NEW_TN_DATA.strasse)
      await page.getByTestId('plz').fill(NEW_TN_DATA.plz)
      await page.getByTestId('ort').fill(NEW_TN_DATA.ort)
      await page.getByTestId('telefon').fill(NEW_TN_DATA.telefon)
      await page.getByTestId('email').fill(NEW_TN_DATA.email)

      await page.getByTestId(`tn-save`).first().click()

      await page
        .getByTestId('toast-container')
        .first()
        .waitFor({ state: 'visible', timeout: 20000 })

      await expect(page.getByTestId('geschlecht')).toHaveValue(
        NEW_TN_DATA.geschlecht
      )
      await expect(page.getByTestId('nation')).toHaveValue(NEW_TN_DATA.nation)
      await expect(page.getByTestId('ursprungsland')).toHaveValue(
        NEW_TN_DATA.ursprungsland
      )
      await expect(page.getByTestId('geburtsort')).toHaveValue(
        NEW_TN_DATA.geburtsort
      )
      await expect(page.getByTestId('muttersprache')).toHaveValue(
        NEW_TN_DATA.muttersprache
      )

      // contact data
      await expect(page.getByTestId('strasse')).toHaveValue(NEW_TN_DATA.strasse)
      await expect(page.getByTestId('plz')).toHaveValue(NEW_TN_DATA.plz)
      await expect(page.getByTestId('ort')).toHaveValue(
        NEW_TN_DATA.ort_corrected
      )
      await expect(page.getByTestId('telefon')).toHaveValue(NEW_TN_DATA.telefon)
      await expect(page.getByTestId('email')).toHaveValue(NEW_TN_DATA.email)
    })
  })

  test('Edit Vermittlungsdaten', async ({ page }) => {
    const NEW_TN_DATA = {
      ziel: 'Software-Entwickler',
      vermittelbarAb: dayjs().add(1, 'month').format('DD.MM.YYYY'),
      vermittlungsnotiz: 'Lernt sehr schnell',
    }

    await test.step('Edit Vermittlungsdaten Fields', async () => {
      await page.getByTestId('ziel').fill(NEW_TN_DATA.ziel)
      await page.locator('#vermittelbarAb').fill(NEW_TN_DATA.vermittelbarAb)
      await page
        .getByTestId('vermittlungsnotiz')
        .fill(NEW_TN_DATA.vermittlungsnotiz)

      await page.getByTestId(`tn-save`).first().click()
      await page
        .getByTestId('toast-container')
        .first()
        .waitFor({ state: 'visible', timeout: 20000 })

      // Wait for network to be idle after reload
      await page.reload({ waitUntil: 'networkidle' })

      await expect(page.getByTestId('ziel')).toHaveValue(NEW_TN_DATA.ziel)
      await expect(page.locator('#vermittelbarAb')).toHaveValue(
        NEW_TN_DATA.vermittelbarAb
      )

      await expect(page.getByTestId('vermittlungsnotiz')).toHaveValue(
        NEW_TN_DATA.vermittlungsnotiz
      )
    })

    await test.step('Edit Vermittlungsdaten - Wunschberufe', async () => {
      // Wunschberufe
      await page.getByTestId('dropdown-arrows-wunschberufe').click()
      await page.getByTestId('selection-reset-wunschberufe').click()
      await page.locator('#beruf-select-search-wunschberufe').click()
      await page.locator('#beruf-select-search-wunschberufe').fill('it-admin')
      await page.getByText('IT-AdministratorIn').click()

      await page.locator('#beruf-select-search-wunschberufe').fill('erp-soft')
      await page.getByText('ERP-SoftwareentwicklerInSpezialisierung').click()

      await page.locator('#beruf-select-search-wunschberufe').fill('java-soft')
      await page.getByText('Java-Software-EntwicklerInSpezialisierung').click()
      // unfocus
      page.getByTestId('vermittlungsnotiz').click()

      await page.getByTestId(`tn-save`).first().click()
      await page
        .getByTestId('toast-container')
        .first()
        .waitFor({ state: 'visible', timeout: 20000 })

      // Wait for network to be idle after reload
      await page.reload({ waitUntil: 'networkidle' })

      await page.waitForTimeout(1000)

      const textContent1 = await page
        .locator('#beruf-select-input-wunschberufe')
        .textContent()

      expect(textContent1).toMatch(/Java-Software-EntwicklerIn/)
      expect(textContent1).toMatch(/IT-AdministratorIn/)
      expect(textContent1).toMatch(/ERP-SoftwareentwicklerIn/)

      // remove one option
      await page
        .locator('span')
        .filter({ hasText: 'IT-AdministratorIn' })
        .getByRole('button')
        .click()

      await page.getByTestId(`tn-save`).first().click()
      await page
        .getByTestId('toast-container')
        .first()
        .waitFor({ state: 'visible', timeout: 20000 })

      // Wait for network to be idle after reload
      await page.reload({ waitUntil: 'networkidle' })

      await page.waitForTimeout(1000)

      const textContent2 = await page
        .locator('#beruf-select-input-wunschberufe')
        .textContent()

      expect(textContent2).toMatch(/Java-Software-EntwicklerIn/)
      expect(textContent2).toMatch(/ERP-SoftwareentwicklerIn/)
    })
  })
})

test.describe('Edit Seminar & Prüfung fields', () => {
  test('Edit Seminardaten', async ({ page }) => {
    const NEW_SEMINAR_DATA = {
      austritt: dayjs().add(1, 'week').format('DD.MM.YYYY'),
      austrittsgrund: 'Lehrstellenaufnahme',
      begehrenBis: dayjs().add(3, 'month').format('DD.MM.YYYY'),
      zusaetzlicheUnterstuetzung: 'Abendkurse',
      fruehwarnung: dayjs().subtract(3, 'month').format('DD.MM.YYYY'),
      anmerkung: 'weiterführender WIFI Kurs',
      lernfortschritt: 'Gut',
      gesamtbeurteilungTyp: 'Deutsch',
      gesamtbeurteilungErgebnis: 'Sehr gut',
    }

    const TMP_SEMINAR_DATA = {
      projektName: '',
      seminarBezeichnung: '',
      buchungsstatus: '',
      eintritt: '',
      austritt: '',
    }

    await test.step('Store Seminardata', async () => {
      TMP_SEMINAR_DATA.projektName = await page
        .getByTestId('seminar-td-projektName')
        .innerText()
      TMP_SEMINAR_DATA.seminarBezeichnung = await page
        .getByTestId('seminar-td-seminarBezeichnung')
        .innerText()
      TMP_SEMINAR_DATA.buchungsstatus = await page
        .getByTestId('seminar-td-buchungsstatus')
        .innerText()
      TMP_SEMINAR_DATA.eintritt = await page
        .getByTestId('seminar-td-eintritt')
        .innerText()
      TMP_SEMINAR_DATA.austritt = await page
        .getByTestId('seminar-td-austritt')
        .innerText()
    })

    await test.step('Open Seminar Dialog and expect values to match', async () => {
      await page.getByRole('button', { name: 'Detailansicht' }).click()

      await expect(
        page.locator('h2').filter({ hasText: 'Seminar Details' })
      ).toBeVisible()

      // verify correct saving and loading beahviour
      await expect(await page.getByTestId('projektName')).toHaveValue(
        TMP_SEMINAR_DATA.projektName
      )
      await expect(await page.getByTestId('seminarBezeichnung')).toHaveValue(
        TMP_SEMINAR_DATA.seminarBezeichnung
      )
      await expect(await page.getByTestId('buchungsstatus')).toHaveValue(
        TMP_SEMINAR_DATA.buchungsstatus
      )
      await expect(await page.getByTestId('eintritt')).toHaveValue(
        TMP_SEMINAR_DATA.eintritt
      )
      if (TMP_SEMINAR_DATA.austritt) {
        await expect(await page.locator('#austritt')).toHaveValue(
          TMP_SEMINAR_DATA.austritt
        )
      }
    })

    await test.step('Fill editable fields and save', async () => {
      await page.locator('#austritt').fill(NEW_SEMINAR_DATA.austritt)
      await page
        .getByTestId('austrittsgrund')
        .selectOption(NEW_SEMINAR_DATA.austrittsgrund)
      await page.locator('#begehrenBis').fill(NEW_SEMINAR_DATA.begehrenBis)
      await page
        .getByTestId('zusaetzlicheUnterstuetzung')
        .fill(NEW_SEMINAR_DATA.zusaetzlicheUnterstuetzung)
      await page.locator('#fruehwarnung').fill(NEW_SEMINAR_DATA.fruehwarnung)
      await page.getByTestId('anmerkung').fill(NEW_SEMINAR_DATA.anmerkung)
      await page
        .getByTestId('lernfortschritt')
        .fill(NEW_SEMINAR_DATA.lernfortschritt)
      await page
        .getByTestId('gesamtbeurteilungTyp')
        .selectOption(NEW_SEMINAR_DATA.gesamtbeurteilungTyp)
      await page
        .getByTestId('gesamtbeurteilungErgebnis')
        .selectOption(NEW_SEMINAR_DATA.gesamtbeurteilungErgebnis)

      await page.getByTestId(`seminar-detail-save`).first().click()
      await waitForLoader(page)

      // Wait for network to be idle after reload
      await page.reload({ waitUntil: 'networkidle' })

      await page.getByRole('button', { name: 'Detailansicht' }).click()
      await expect(
        page.locator('h2').filter({ hasText: 'Seminar Details' })
      ).toBeVisible()

      // verify correct saving and loading beahviour
      await expect(await page.locator('#austritt')).toHaveValue(
        NEW_SEMINAR_DATA.austritt
      )
      await expect(await page.getByTestId('austrittsgrund')).toHaveValue(
        NEW_SEMINAR_DATA.austrittsgrund
      )
      await expect(await page.locator('#begehrenBis')).toHaveValue(
        NEW_SEMINAR_DATA.begehrenBis
      )
      await expect(
        await page.getByTestId('zusaetzlicheUnterstuetzung')
      ).toHaveValue(NEW_SEMINAR_DATA.zusaetzlicheUnterstuetzung)
      await expect(await page.locator('#fruehwarnung')).toHaveValue(
        NEW_SEMINAR_DATA.fruehwarnung
      )
      await expect(await page.getByTestId('anmerkung')).toHaveValue(
        NEW_SEMINAR_DATA.anmerkung
      )
      await expect(await page.getByTestId('lernfortschritt')).toHaveValue(
        NEW_SEMINAR_DATA.lernfortschritt
      )
      await expect(await page.getByTestId('gesamtbeurteilungTyp')).toHaveValue(
        NEW_SEMINAR_DATA.gesamtbeurteilungTyp
      )
      await expect(
        await page.getByTestId('gesamtbeurteilungErgebnis')
      ).toHaveValue(NEW_SEMINAR_DATA.gesamtbeurteilungErgebnis)
      await expect(
        await page.getByTestId('gesamtbeurteilungErgebnis')
      ).toHaveValue(NEW_SEMINAR_DATA.gesamtbeurteilungErgebnis)
    })
  })

  test('Edit Pruefung list', async ({ page }) => {
    const NEW_PRUEFUNG_DATA_1 = {
      bezeichnung: 'Einstufung',
      pruefungArt: 'Schriftlich',
      gegenstand: 'Berufsorientierung',
      niveau: 'PSA',
      institut: 'FH',
      pruefungAm: dayjs().subtract(1, 'month').format('DD.MM.YYYY'),
      antritt: 'Ja',
      ergebnis: 'Bestanden',
      ergebnisInProzent: '65',
    }

    const NEW_PRUEFUNG_DATA_2 = {
      bezeichnung: 'Lehrabschluss',
      pruefungArt: 'Kombi (mündlich & schriftlich)',
      gegenstand: 'AHS-Matura',
      niveau: 'A1',
      institut: 'Schule',
      antritt: 'Nein',
      begruendung: 'Zu geringer Lernfortschritt',
      ergebnis: 'Bestanden',
      ergebnisInProzent: '65',
    }

    const NEW_PRUEFUNG_DATA_3 = {
      pruefungAm: dayjs().subtract(1, 'week').format('DD.MM.YYYY'),
      antritt: 'Ja',
      ergebnis: 'Nicht bestanden',
      ergebnisInProzent: '35',
    }

    await test.step('Open Seminar Dialog and the Pruefung Dialog', async () => {
      await page.getByRole('button', { name: 'Detailansicht' }).click()

      await expect(
        page.locator('h2').filter({ hasText: 'Seminar Details' })
      ).toBeVisible()

      await page.getByRole('button', { name: 'Prüfung hinzufügen' }).click()

      await expect(
        page.locator('h3').filter({ hasText: 'Prüfung hinzufügen' })
      ).toBeVisible()

      await page
        .getByTestId('bezeichnung')
        .first()
        .selectOption(NEW_PRUEFUNG_DATA_1.bezeichnung)
      await page
        .getByTestId('pruefungArt')
        .selectOption(NEW_PRUEFUNG_DATA_1.pruefungArt)
      await page
        .getByTestId('gegenstand')
        .selectOption(NEW_PRUEFUNG_DATA_1.gegenstand)
      await page.getByTestId('niveau').selectOption(NEW_PRUEFUNG_DATA_1.niveau)
      await page.locator('#pruefungAm').fill(NEW_PRUEFUNG_DATA_1.pruefungAm)
      await page
        .getByTestId('antritt')
        .selectOption(NEW_PRUEFUNG_DATA_1.antritt)
      await page
        .getByTestId('ergebnis')
        .selectOption(NEW_PRUEFUNG_DATA_1.ergebnis)
      await page
        .getByTestId('ergebnisInProzent')
        .fill(NEW_PRUEFUNG_DATA_1.ergebnisInProzent)

      await page.getByTestId(`pruefung-save-button`).first().click()

      await expect(
        page.locator('h2').filter({ hasText: 'Seminar Details' })
      ).toBeVisible()

      // check pruefung list
      await expect(
        await page.getByTestId('pruefung-td-bezeichnung').last()
      ).toContainText(NEW_PRUEFUNG_DATA_1.bezeichnung)
      await expect(
        await page.getByTestId('pruefung-td-pruefungArt').last()
      ).toContainText(NEW_PRUEFUNG_DATA_1.pruefungArt)
      await expect(
        await page.getByTestId('pruefung-td-gegenstand').last()
      ).toContainText(NEW_PRUEFUNG_DATA_1.gegenstand)
      await expect(
        await page.getByTestId('pruefung-td-niveau').last()
      ).toContainText(NEW_PRUEFUNG_DATA_1.niveau)
      await expect(
        await page.getByTestId('pruefung-td-pruefungAm').last()
      ).toContainText(NEW_PRUEFUNG_DATA_1.pruefungAm)
      await expect(
        await page.getByTestId('pruefung-td-antritt').last()
      ).toContainText(NEW_PRUEFUNG_DATA_1.antritt)
      await expect(
        await page.getByTestId('pruefung-td-ergebnis').last()
      ).toContainText(NEW_PRUEFUNG_DATA_1.ergebnis)
      await expect(
        await page.getByTestId('pruefung-td-ergebnisInProzent').last()
      ).toContainText(NEW_PRUEFUNG_DATA_1.ergebnisInProzent)
    })

    await test.step('Add another pruefung entry', async () => {
      await expect(
        page.locator('h2').filter({ hasText: 'Seminar Details' })
      ).toBeVisible()

      await page.getByRole('button', { name: 'Prüfung hinzufügen' }).click()

      await expect(
        page.locator('h3').filter({ hasText: 'Prüfung hinzufügen' })
      ).toBeVisible()

      await page
        .getByTestId('bezeichnung')
        .first()
        .selectOption(NEW_PRUEFUNG_DATA_2.bezeichnung)
      await page
        .getByTestId('pruefungArt')
        .selectOption(NEW_PRUEFUNG_DATA_2.pruefungArt)
      await page
        .getByTestId('gegenstand')
        .selectOption(NEW_PRUEFUNG_DATA_2.gegenstand)
      await page.getByTestId('niveau').selectOption(NEW_PRUEFUNG_DATA_2.niveau)
      await page
        .getByTestId('institut')
        .selectOption(NEW_PRUEFUNG_DATA_2.institut)
      await page
        .getByTestId('antritt')
        .selectOption(NEW_PRUEFUNG_DATA_2.antritt)
      await page
        .getByTestId('begruendung')
        .selectOption(NEW_PRUEFUNG_DATA_2.begruendung)

      await page.getByTestId(`pruefung-save-button`).first().click()

      await expect(
        page.locator('h2').filter({ hasText: 'Seminar Details' })
      ).toBeVisible()

      // check pruefung list
      await expect(
        await page.getByTestId('pruefung-td-bezeichnung').last()
      ).toContainText(NEW_PRUEFUNG_DATA_2.bezeichnung)
      await expect(
        await page.getByTestId('pruefung-td-pruefungArt').last()
      ).toContainText(NEW_PRUEFUNG_DATA_2.pruefungArt)
      await expect(
        await page.getByTestId('pruefung-td-gegenstand').last()
      ).toContainText(NEW_PRUEFUNG_DATA_2.gegenstand)
      await expect(
        await page.getByTestId('pruefung-td-niveau').last()
      ).toContainText(NEW_PRUEFUNG_DATA_2.niveau)
      await expect(
        await page.getByTestId('pruefung-td-institut').last()
      ).toContainText(NEW_PRUEFUNG_DATA_2.institut)
      await expect(
        await page.getByTestId('pruefung-td-pruefungAm').last()
      ).toContainText('')
      await expect(
        await page.getByTestId('pruefung-td-antritt').last()
      ).toContainText(NEW_PRUEFUNG_DATA_2.antritt)
    })

    await test.step('Edit last pruefung entry', async () => {
      await expect(
        page.locator('h2').filter({ hasText: 'Seminar Details' })
      ).toBeVisible()

      await page.getByTestId('pruefung-entry-edit-button').last().click()

      await expect(
        page.locator('h3').filter({ hasText: 'Prüfung bearbeiten' })
      ).toBeVisible()

      await page.locator('#pruefungAm').fill(NEW_PRUEFUNG_DATA_3.pruefungAm)
      await page
        .getByTestId('antritt')
        .selectOption(NEW_PRUEFUNG_DATA_3.antritt)
      await page
        .getByTestId('ergebnis')
        .selectOption(NEW_PRUEFUNG_DATA_3.ergebnis)
      await page
        .getByTestId('ergebnisInProzent')
        .fill(NEW_PRUEFUNG_DATA_3.ergebnisInProzent)

      await page.getByTestId(`pruefung-save-button`).first().click()

      await expect(
        page.locator('h2').filter({ hasText: 'Seminar Details' })
      ).toBeVisible()

      // check pruefung list
      await expect(
        await page.getByTestId('pruefung-td-pruefungAm').last()
      ).toContainText(NEW_PRUEFUNG_DATA_3.pruefungAm)
      await expect(
        await page.getByTestId('pruefung-td-antritt').last()
      ).toContainText(NEW_PRUEFUNG_DATA_3.antritt)
      await expect(
        await page.getByTestId('pruefung-td-ergebnis').last()
      ).toContainText(NEW_PRUEFUNG_DATA_3.ergebnis)
      await expect(
        await page.getByTestId('pruefung-td-ergebnisInProzent').last()
      ).toContainText(NEW_PRUEFUNG_DATA_3.ergebnisInProzent)
    })

    await test.step('Delete last pruefung entry', async () => {
      await expect(
        page.locator('h2').filter({ hasText: 'Seminar Details' })
      ).toBeVisible()

      await page.getByTestId('pruefung-entry-delete-button').last().click()

      await expect(
        page.locator('h3').filter({ hasText: 'Prüfung löschen' })
      ).toBeVisible()

      await page.getByTestId('pruefung-delete-confirm-button').first().click()

      await expect(
        page.locator('h2').filter({ hasText: 'Seminar Details' })
      ).toBeVisible()

      // check pruefung list
      await expect(
        await page.getByTestId('pruefung-td-bezeichnung').last()
      ).toContainText(NEW_PRUEFUNG_DATA_1.bezeichnung)
      await expect(
        await page.getByTestId('pruefung-td-pruefungArt').last()
      ).toContainText(NEW_PRUEFUNG_DATA_1.pruefungArt)

      await expect(
        await page.getByTestId('pruefung-td-pruefungAm').last()
      ).toContainText(NEW_PRUEFUNG_DATA_1.pruefungAm)
    })
  })
})

test.describe('Edit Tables (Notiz, Ausbildung, Berufserfahrung, Zertifikate, Sprachkenntnisse)', () => {
  test('Edit Notiz list', async ({ page }) => {
    const NEW_NOTIZ_DATA_1 = {
      notiz: 'Orientierungsschwierigkeiten beim Kurseintritt',
      type: 'Intern',
      kategorie: 'Berufsorientierung',
    }

    const NEW_NOTIZ_DATA_2 = {
      notiz: 'Guter Lernfortschritt',
      type: 'Extern',
      kategorie: 'Coaching',
    }

    await test.step('Enter new Notiz', async () => {
      await expect(
        page.locator('h3').filter({ hasText: 'Kursverlauf - Notizen' })
      ).toBeVisible()

      await page.getByTestId('notiz-input').fill(NEW_NOTIZ_DATA_1.notiz)
      await page
        .getByTestId('notiz-type')
        .first()
        .selectOption(NEW_NOTIZ_DATA_1.type)
      await page
        .getByTestId('notiz-kategorie')
        .first()
        .selectOption(NEW_NOTIZ_DATA_1.kategorie)

      await page.getByTestId('notiz-add-button').click()

      await waitForButtonLoader(page)

      // check notiz list
      await expect(
        await page.getByTestId('notiz-td-notiz').last()
      ).toContainText(NEW_NOTIZ_DATA_1.notiz)
      await expect(
        await page.getByTestId('notiz-td-type').last()
      ).toContainText(NEW_NOTIZ_DATA_1.type)
      await expect(
        await page.getByTestId('notiz-td-kategorie').last()
      ).toContainText(NEW_NOTIZ_DATA_1.kategorie)

      // Wait for network to be idle after reload
      await page.reload({ waitUntil: 'networkidle' })

      // check notiz list after reload
      await expect(
        await page.getByTestId('notiz-td-notiz').last()
      ).toContainText(NEW_NOTIZ_DATA_1.notiz)
      await expect(
        await page.getByTestId('notiz-td-type').last()
      ).toContainText(NEW_NOTIZ_DATA_1.type)
      await expect(
        await page.getByTestId('notiz-td-kategorie').last()
      ).toContainText(NEW_NOTIZ_DATA_1.kategorie)
    })

    await test.step('Enter another Notiz', async () => {
      await expect(
        page.locator('h3').filter({ hasText: 'Kursverlauf - Notizen' })
      ).toBeVisible()

      await page.getByTestId('notiz-input').fill(NEW_NOTIZ_DATA_2.notiz)
      await page
        .getByTestId('notiz-type')
        .first()
        .selectOption(NEW_NOTIZ_DATA_2.type)
      await page
        .getByTestId('notiz-kategorie')
        .first()
        .selectOption(NEW_NOTIZ_DATA_2.kategorie)

      await page.getByTestId('notiz-add-button').click()

      await waitForButtonLoader(page)
      // check notiz list
      await expect(
        await page.getByTestId('notiz-td-notiz').last()
      ).toContainText(NEW_NOTIZ_DATA_2.notiz)
      await expect(
        await page.getByTestId('notiz-td-type').last()
      ).toContainText(NEW_NOTIZ_DATA_2.type)
      await expect(
        await page.getByTestId('notiz-td-kategorie').last()
      ).toContainText(NEW_NOTIZ_DATA_2.kategorie)

      // Wait for network to be idle after reload
      await page.reload({ waitUntil: 'networkidle' })

      // check notiz list after reload
      await expect(
        await page.getByTestId('notiz-td-notiz').last()
      ).toContainText(NEW_NOTIZ_DATA_2.notiz)
      await expect(
        await page.getByTestId('notiz-td-type').last()
      ).toContainText(NEW_NOTIZ_DATA_2.type)
      await expect(
        await page.getByTestId('notiz-td-kategorie').last()
      ).toContainText(NEW_NOTIZ_DATA_2.kategorie)
    })

    await test.step('Delete last notiz entry', async () => {
      await expect(
        page.locator('h3').filter({ hasText: 'Kursverlauf - Notizen' })
      ).toBeVisible()

      await page.getByTestId('notiz-delete-button').last().click()

      await expect(
        page.locator('h3').filter({ hasText: 'Notiz löschen' })
      ).toBeVisible()

      await page.getByTestId('notiz-delete-confirm-button').click()
      await page.waitForLoadState('networkidle')

      await page.waitForTimeout(1000)

      // check notiz list
      await expect(
        await page.getByTestId('notiz-td-notiz').last()
      ).toContainText(NEW_NOTIZ_DATA_1.notiz)
      await expect(
        await page.getByTestId('notiz-td-type').last()
      ).toContainText(NEW_NOTIZ_DATA_1.type)
      await expect(
        await page.getByTestId('notiz-td-kategorie').last()
      ).toContainText(NEW_NOTIZ_DATA_1.kategorie)

      // Wait for network to be idle after reload
      await page.reload({ waitUntil: 'networkidle' })

      await expect(
        page.locator('h3').filter({ hasText: 'Kursverlauf - Notizen' })
      ).toBeVisible()

      // check notiz list after reload
      await expect(
        await page.getByTestId('notiz-td-notiz').last()
      ).toContainText(NEW_NOTIZ_DATA_1.notiz)
      await expect(
        await page.getByTestId('notiz-td-type').last()
      ).toContainText(NEW_NOTIZ_DATA_1.type)
      await expect(
        await page.getByTestId('notiz-td-kategorie').last()
      ).toContainText(NEW_NOTIZ_DATA_1.kategorie)
    })
  })

  test('Edit Ausbildung list', async ({ page }) => {
    const NEW_AUSBILDUNG_DATA_1 = {
      ausbildungstyp: 'Pflichtschule',
      hoechsterAbschluss: 'Nein',
      erkanntInAt: 'Ja',
    }

    const NEW_AUSBILDUNG_DATA_2 = {
      ausbildungstyp: 'Matura',
      hoechsterAbschluss: 'Ja',
      erkanntInAt: 'Ja',
    }

    await test.step('Enter new Ausbildung', async () => {
      await expect(
        page.locator('h3').filter({ hasText: 'Ausbildungen' })
      ).toBeVisible()

      await page
        .getByTestId('ausbildungstyp')
        .first()
        .selectOption(NEW_AUSBILDUNG_DATA_1.ausbildungstyp)

      const hoechsterAbschlussCheckbox = page
        .getByTestId('hoechsterAbschluss')
        .first()
      await expect(hoechsterAbschlussCheckbox).toBeChecked()
      await hoechsterAbschlussCheckbox.click({ force: true })

      const erkanntInAtCheckbox = page.getByTestId('erkanntInAt').first()
      await expect(erkanntInAtCheckbox).toBeChecked()

      await page.getByTestId('ausbildung-add-button').click()

      await waitForButtonLoader(page)

      // check ausbildung list
      await expect(
        await page.getByTestId('ausbildung-td-ausbildungstyp').last()
      ).toContainText(NEW_AUSBILDUNG_DATA_1.ausbildungstyp)
      await expect(
        await page.getByTestId('ausbildung-td-hoechsterAbschluss').last()
      ).toContainText(NEW_AUSBILDUNG_DATA_1.hoechsterAbschluss)
      await expect(
        await page.getByTestId('ausbildung-td-erkanntInAt').last()
      ).toContainText(NEW_AUSBILDUNG_DATA_1.erkanntInAt)

      // Wait for network to be idle after reload
      await page.reload({ waitUntil: 'networkidle' })

      // check ausbildung list after reload
      await expect(
        await page.getByTestId('ausbildung-td-ausbildungstyp').last()
      ).toContainText(NEW_AUSBILDUNG_DATA_1.ausbildungstyp)
      await expect(
        await page.getByTestId('ausbildung-td-hoechsterAbschluss').last()
      ).toContainText(NEW_AUSBILDUNG_DATA_1.hoechsterAbschluss)
      await expect(
        await page.getByTestId('ausbildung-td-erkanntInAt').last()
      ).toContainText(NEW_AUSBILDUNG_DATA_1.erkanntInAt)
    })

    await test.step('Enter another Ausbildung', async () => {
      await expect(
        page.locator('h3').filter({ hasText: 'Ausbildungen' })
      ).toBeVisible()

      await page
        .getByTestId('ausbildungstyp')
        .first()
        .selectOption(NEW_AUSBILDUNG_DATA_2.ausbildungstyp)

      const hoechsterAbschlussCheckbox = page
        .getByTestId('hoechsterAbschluss')
        .first()
      await expect(hoechsterAbschlussCheckbox).toBeChecked()

      const erkanntInAtCheckbox = page.getByTestId('erkanntInAt').first()
      await expect(erkanntInAtCheckbox).toBeChecked()

      await page.getByTestId('ausbildung-add-button').click()

      await waitForButtonLoader(page)

      // check ausbildung list
      await expect(
        await page.getByTestId('ausbildung-td-ausbildungstyp').last()
      ).toContainText(NEW_AUSBILDUNG_DATA_2.ausbildungstyp)
      await expect(
        await page.getByTestId('ausbildung-td-hoechsterAbschluss').last()
      ).toContainText(NEW_AUSBILDUNG_DATA_2.hoechsterAbschluss)
      await expect(
        await page.getByTestId('ausbildung-td-erkanntInAt').last()
      ).toContainText(NEW_AUSBILDUNG_DATA_2.erkanntInAt)

      // Wait for network to be idle after reload
      await page.reload({ waitUntil: 'networkidle' })

      // check ausbildung list after reload
      await expect(
        await page.getByTestId('ausbildung-td-ausbildungstyp').last()
      ).toContainText(NEW_AUSBILDUNG_DATA_2.ausbildungstyp)
      await expect(
        await page.getByTestId('ausbildung-td-hoechsterAbschluss').last()
      ).toContainText(NEW_AUSBILDUNG_DATA_2.hoechsterAbschluss)
      await expect(
        await page.getByTestId('ausbildung-td-erkanntInAt').last()
      ).toContainText(NEW_AUSBILDUNG_DATA_2.erkanntInAt)
    })

    await test.step('Delete last ausbildung entry', async () => {
      await expect(
        page.locator('h3').filter({ hasText: 'Ausbildungen' })
      ).toBeVisible()

      await page.getByTestId('ausbildung-delete-button').last().click()

      await expect(
        page.locator('h3').filter({ hasText: 'Ausbildung löschen' })
      ).toBeVisible()

      await page.getByTestId('ausbildung-delete-confirm-button').click()
      await page.waitForLoadState('networkidle')

      await page.waitForTimeout(1000)

      // check ausbildung list
      await expect(
        await page.getByTestId('ausbildung-td-ausbildungstyp').last()
      ).toContainText(NEW_AUSBILDUNG_DATA_1.ausbildungstyp)
      await expect(
        await page.getByTestId('ausbildung-td-hoechsterAbschluss').last()
      ).toContainText(NEW_AUSBILDUNG_DATA_1.hoechsterAbschluss)
      await expect(
        await page.getByTestId('ausbildung-td-erkanntInAt').last()
      ).toContainText(NEW_AUSBILDUNG_DATA_1.erkanntInAt)

      // Wait for network to be idle after reload
      await page.reload({ waitUntil: 'networkidle' })

      // check ausbildung list after reload
      await expect(
        await page.getByTestId('ausbildung-td-ausbildungstyp').last()
      ).toContainText(NEW_AUSBILDUNG_DATA_1.ausbildungstyp)
      await expect(
        await page.getByTestId('ausbildung-td-hoechsterAbschluss').last()
      ).toContainText(NEW_AUSBILDUNG_DATA_1.hoechsterAbschluss)
      await expect(
        await page.getByTestId('ausbildung-td-erkanntInAt').last()
      ).toContainText(NEW_AUSBILDUNG_DATA_1.erkanntInAt)
    })
  })

  test('Edit Berufserfahrung list', async ({ page }) => {
    const NEW_BERUFSERFAHRUNG_DATA_1 = {
      beruf: 'IT-NetzwerkadministratorIn',
      dauer: '3',
      // isMonth: 'Lernt sehr schnell',
    }
    const NEW_BERUFSERFAHRUNG_DATA_2 = {
      beruf: 'VerwaltungsassistentIn',
      dauer: '2.5',
      dauerInMonths: '30',
      // isMonth: 'Lernt sehr schnell',
    }

    await test.step('Enter new Berufserfahrung', async () => {
      await expect(
        page.locator('h3').filter({ hasText: 'Berufserfahrung' })
      ).toBeVisible()

      await page.locator('#beruf-select-search-beruf').click()
      await page.locator('#beruf-select-search-beruf').fill('netzwerkadm')
      await page
        .locator('#beruf-select-results-beruf')
        .getByText(NEW_BERUFSERFAHRUNG_DATA_1.beruf)
        .click()

      // unfocus
      page
        .locator('h3')
        .filter({ hasText: 'Berufserfahrung' })
        .click({ force: true })

      await page.getByTestId('dauer').fill(NEW_BERUFSERFAHRUNG_DATA_1.dauer)

      const isMonthCheckbox = page.getByTestId('isMonth').first()
      await expect(isMonthCheckbox).not.toBeChecked()

      await page.getByTestId('berufserfahrung-add-button').click()

      await waitForButtonLoader(page)

      // check berufserfahrung list
      await expect(
        await page.getByTestId('berufserfahrung-td-beruf').last()
      ).toContainText(NEW_BERUFSERFAHRUNG_DATA_1.beruf)
      await expect(
        await page.getByTestId('berufserfahrung-td-dauer').last()
      ).toContainText(NEW_BERUFSERFAHRUNG_DATA_1.dauer)

      // Wait for network to be idle after reload
      await page.reload({ waitUntil: 'networkidle' })

      // check berufserfahrung list after reload
      await expect(
        await page.getByTestId('berufserfahrung-td-beruf').last()
      ).toContainText(NEW_BERUFSERFAHRUNG_DATA_1.beruf)
      await expect(
        await page.getByTestId('berufserfahrung-td-dauer').last()
      ).toContainText(NEW_BERUFSERFAHRUNG_DATA_1.dauer)
    })

    await test.step('Enter another Berufserfahrung', async () => {
      await expect(
        page.locator('h3').filter({ hasText: 'Berufserfahrung' })
      ).toBeVisible()

      await page.locator('#beruf-select-search-beruf').click()
      await page.locator('#beruf-select-search-beruf').fill('verwaltungsassist')
      await page
        .locator('#beruf-select-results-beruf')
        .getByText(NEW_BERUFSERFAHRUNG_DATA_2.beruf)
        .last()
        .click()
      // unfocus
      page
        .locator('h3')
        .filter({ hasText: 'Berufserfahrung' })
        .click({ force: true })

      await page
        .getByTestId('dauer')
        .fill(NEW_BERUFSERFAHRUNG_DATA_2.dauerInMonths)

      const isMonthCheckbox = page.getByTestId('isMonth').first()
      await expect(isMonthCheckbox).not.toBeChecked()
      await isMonthCheckbox.click({ force: true })

      await page.getByTestId('berufserfahrung-add-button').click()

      await waitForButtonLoader(page)

      // check berufserfahrung list
      await expect(
        await page.getByTestId('berufserfahrung-td-beruf').last()
      ).toContainText(NEW_BERUFSERFAHRUNG_DATA_2.beruf)
      await expect(
        await page.getByTestId('berufserfahrung-td-dauer').last()
      ).toContainText(NEW_BERUFSERFAHRUNG_DATA_2.dauer)

      // Wait for network to be idle after reload
      await page.reload({ waitUntil: 'networkidle' })

      // check berufserfahrung list after reload
      await expect(
        await page.getByTestId('berufserfahrung-td-beruf').last()
      ).toContainText(NEW_BERUFSERFAHRUNG_DATA_2.beruf)
      await expect(
        await page.getByTestId('berufserfahrung-td-dauer').last()
      ).toContainText(NEW_BERUFSERFAHRUNG_DATA_2.dauer)
    })

    await test.step('Delete last berufserfahrung entry', async () => {
      await expect(
        page.locator('h3').filter({ hasText: 'Berufserfahrung' })
      ).toBeVisible()

      await page.getByTestId('berufserfahrung-delete-button').last().click()

      await expect(
        page.locator('h3').filter({ hasText: 'Berufserfahrung löschen' })
      ).toBeVisible()

      await page.getByTestId('berufserfahrung-delete-confirm-button').click()
      await page.waitForLoadState('networkidle')

      await page.waitForTimeout(1000)

      await expect(
        await page.getByTestId('berufserfahrung-td-beruf').last()
      ).toContainText(NEW_BERUFSERFAHRUNG_DATA_1.beruf)
      await expect(
        await page.getByTestId('berufserfahrung-td-dauer').last()
      ).toContainText(NEW_BERUFSERFAHRUNG_DATA_1.dauer)

      // Wait for network to be idle after reload
      await page.reload({ waitUntil: 'networkidle' })

      // check berufserfahrung list after reload
      await expect(
        await page.getByTestId('berufserfahrung-td-beruf').last()
      ).toContainText(NEW_BERUFSERFAHRUNG_DATA_1.beruf)
      await expect(
        await page.getByTestId('berufserfahrung-td-dauer').last()
      ).toContainText(NEW_BERUFSERFAHRUNG_DATA_1.dauer)
    })

    await test.step('Delete first berufserfahrung entry', async () => {
      await expect(
        page.locator('h3').filter({ hasText: 'Berufserfahrung' })
      ).toBeVisible()

      await page.getByTestId('berufserfahrung-delete-button').last().click()

      await expect(
        page.locator('h3').filter({ hasText: 'Berufserfahrung löschen' })
      ).toBeVisible()

      await page.getByTestId('berufserfahrung-delete-confirm-button').click()
      await page.waitForLoadState('networkidle')

      await page.waitForTimeout(1000)

      await expect(
        await page.getByTestId('berufserfahrung-td-beruf').last()
      ).toBeHidden()
      await expect(
        await page.getByTestId('berufserfahrung-td-dauer').last()
      ).toBeHidden()
    })
  })

  test('Edit Zertifikate list', async ({ page }) => {
    const NEW_ZERTIFIKAT_DATA_1 = {
      bezeichnung: 'AHS-Matura',
    }
    const NEW_ZERTIFIKAT_DATA_2 = {
      bezeichnung: 'Englisch C1',
    }

    await test.step('Enter new Zertifikate entry', async () => {
      await expect(
        page.locator('h3').filter({ hasText: 'Zertifikate' })
      ).toBeVisible()

      await page
        .getByTestId('zertifikat-bezeichnung')
        .fill(NEW_ZERTIFIKAT_DATA_1.bezeichnung)

      await page.getByTestId('zertifikat-add-button').click()

      await waitForButtonLoader(page)

      // check zertifikat list
      await expect(
        await page.getByTestId('zertifikat-td-bezeichnung').last()
      ).toContainText(NEW_ZERTIFIKAT_DATA_1.bezeichnung)

      // Wait for network to be idle after reload
      await page.reload({ waitUntil: 'networkidle' })

      // check zertifikat list after reload
      await expect(
        await page.getByTestId('zertifikat-td-bezeichnung').last()
      ).toContainText(NEW_ZERTIFIKAT_DATA_1.bezeichnung)
    })

    await test.step('Enter another Zertifikate entry', async () => {
      await expect(
        page.locator('h3').filter({ hasText: 'Zertifikate' })
      ).toBeVisible()

      await page
        .getByTestId('zertifikat-bezeichnung')
        .fill(NEW_ZERTIFIKAT_DATA_2.bezeichnung)

      await page.getByTestId('zertifikat-add-button').click()

      await waitForButtonLoader(page)

      // check zertifikat list
      await expect(
        await page.getByTestId('zertifikat-td-bezeichnung').last()
      ).toContainText(NEW_ZERTIFIKAT_DATA_2.bezeichnung)

      // Wait for network to be idle after reload
      await page.reload({ waitUntil: 'networkidle' })

      // check zertifikat list after reload
      await expect(
        await page.getByTestId('zertifikat-td-bezeichnung').last()
      ).toContainText(NEW_ZERTIFIKAT_DATA_2.bezeichnung)
    })

    await test.step('Delete last zertifikat entry', async () => {
      await expect(
        page.locator('h3').filter({ hasText: 'Zertifikate' })
      ).toBeVisible()

      await page
        .getByTestId('zertifikat-bezeichnung')
        .fill(NEW_ZERTIFIKAT_DATA_1.bezeichnung)

      await page.getByTestId('zertifikat-delete-button').last().click()

      await expect(
        page.locator('h3').filter({ hasText: 'Zertifikat löschen' })
      ).toBeVisible()

      await page.getByTestId('zertifikat-delete-confirm-button').click()
      await page.waitForLoadState('networkidle')

      await page.waitForTimeout(1000)

      // check zertifikat list
      await expect(
        await page.getByTestId('zertifikat-td-bezeichnung').last()
      ).toContainText(NEW_ZERTIFIKAT_DATA_1.bezeichnung)

      // Wait for network to be idle after reload
      await page.reload({ waitUntil: 'networkidle' })

      // check zertifikat list after reload
      await expect(
        await page.getByTestId('zertifikat-td-bezeichnung').last()
      ).toContainText(NEW_ZERTIFIKAT_DATA_1.bezeichnung)
    })
  })

  test('Edit Sprachkenntnisse list', async ({ page }) => {
    const NEW_SPRACHKENNTNIS_DATA_1 = {
      sprache: 'Deutsch',
      niveau: 'A1',
      bewertungCoach: 'A1',
      bewertungDatum: dayjs().subtract(8, 'week').format('DD.MM.YYYY'),
    }
    const NEW_SPRACHKENNTNIS_DATA_2 = {
      sprache: 'Deutsch',
      niveau: 'B1',
      bewertungCoach: 'B2',
      bewertungDatum: dayjs().subtract(4, 'week').format('DD.MM.YYYY'),
    }

    await test.step('Enter new Sprachkenntnisse entry', async () => {
      await expect(
        page.locator('h3').filter({ hasText: 'Sprachkenntnisse' })
      ).toBeVisible()

      await page
        .getByTestId('sprachkenntnis-niveau')
        .first()
        .selectOption(NEW_SPRACHKENNTNIS_DATA_1.niveau)
      await page
        .getByTestId('sprachkenntnis-bewertungCoach')
        .first()
        .selectOption(NEW_SPRACHKENNTNIS_DATA_1.bewertungCoach)
      await page
        .locator('#bewertungDatum')
        .fill(NEW_SPRACHKENNTNIS_DATA_1.bewertungDatum)

      await page.getByTestId('sprachkenntnis-add-button').click()

      await waitForButtonLoader(page)

      // check sprachkenntnis list
      await expect(
        await page.getByTestId('sprachkenntnis-td-sprache').last()
      ).toContainText(NEW_SPRACHKENNTNIS_DATA_1.sprache)
      await expect(
        await page.getByTestId('sprachkenntnis-td-niveau').last()
      ).toContainText(NEW_SPRACHKENNTNIS_DATA_1.niveau)
      await expect(
        await page.getByTestId('sprachkenntnis-td-bewertungCoach').last()
      ).toContainText(NEW_SPRACHKENNTNIS_DATA_1.bewertungCoach)
      await expect(
        await page.getByTestId('sprachkenntnis-td-bewertungDatum').last()
      ).toContainText(NEW_SPRACHKENNTNIS_DATA_1.bewertungDatum)

      // Wait for network to be idle after reload
      await page.reload({ waitUntil: 'networkidle' })

      // check sprachkenntnis list after reload
      await expect(
        await page.getByTestId('sprachkenntnis-td-sprache').last()
      ).toContainText(NEW_SPRACHKENNTNIS_DATA_1.sprache)
      await expect(
        await page.getByTestId('sprachkenntnis-td-niveau').last()
      ).toContainText(NEW_SPRACHKENNTNIS_DATA_1.niveau)
      await expect(
        await page.getByTestId('sprachkenntnis-td-bewertungCoach').last()
      ).toContainText(NEW_SPRACHKENNTNIS_DATA_1.bewertungCoach)
      await expect(
        await page.getByTestId('sprachkenntnis-td-bewertungDatum').last()
      ).toContainText(NEW_SPRACHKENNTNIS_DATA_1.bewertungDatum)
    })

    await test.step('Enter another Sprachkenntnisse entry', async () => {
      await expect(
        page.locator('h3').filter({ hasText: 'Sprachkenntnisse' })
      ).toBeVisible()

      await page
        .getByTestId('sprachkenntnis-niveau')
        .first()
        .selectOption(NEW_SPRACHKENNTNIS_DATA_2.niveau)
      await page
        .getByTestId('sprachkenntnis-bewertungCoach')
        .first()
        .selectOption(NEW_SPRACHKENNTNIS_DATA_2.bewertungCoach)
      await page
        .locator('#bewertungDatum')
        .fill(NEW_SPRACHKENNTNIS_DATA_2.bewertungDatum)

      await page.getByTestId('sprachkenntnis-add-button').click()

      await waitForButtonLoader(page)

      // check zertifikat list
      await expect(
        await page.getByTestId('sprachkenntnis-td-sprache').last()
      ).toContainText(NEW_SPRACHKENNTNIS_DATA_2.sprache)
      await expect(
        await page.getByTestId('sprachkenntnis-td-niveau').last()
      ).toContainText(NEW_SPRACHKENNTNIS_DATA_2.niveau)
      await expect(
        await page.getByTestId('sprachkenntnis-td-bewertungCoach').last()
      ).toContainText(NEW_SPRACHKENNTNIS_DATA_2.bewertungCoach)
      await expect(
        await page.getByTestId('sprachkenntnis-td-bewertungDatum').last()
      ).toContainText(NEW_SPRACHKENNTNIS_DATA_2.bewertungDatum)

      // Wait for network to be idle after reload
      await page.reload({ waitUntil: 'networkidle' })

      // check zertifikat list after reload
      await expect(
        await page.getByTestId('sprachkenntnis-td-sprache').last()
      ).toContainText(NEW_SPRACHKENNTNIS_DATA_2.sprache)
      await expect(
        await page.getByTestId('sprachkenntnis-td-niveau').last()
      ).toContainText(NEW_SPRACHKENNTNIS_DATA_2.niveau)
      await expect(
        await page.getByTestId('sprachkenntnis-td-bewertungCoach').last()
      ).toContainText(NEW_SPRACHKENNTNIS_DATA_2.bewertungCoach)
      await expect(
        await page.getByTestId('sprachkenntnis-td-bewertungDatum').last()
      ).toContainText(NEW_SPRACHKENNTNIS_DATA_2.bewertungDatum)
    })

    await test.step('Delete last Sprachkenntnis entry', async () => {
      await expect(
        page.locator('h3').filter({ hasText: 'Zertifikate' })
      ).toBeVisible()

      await page.getByTestId('sprachkenntnis-delete-button').last().click()

      await expect(
        page.locator('h3').filter({ hasText: 'Sprachkenntnis löschen' })
      ).toBeVisible()

      await page.getByTestId('sprachkenntnis-delete-confirm-button').click()
      await page.waitForLoadState('networkidle')

      await page.waitForTimeout(1000)

      // check sprachkenntnis list
      await expect(
        await page.getByTestId('sprachkenntnis-td-sprache').last()
      ).toContainText(NEW_SPRACHKENNTNIS_DATA_1.sprache)
      await expect(
        await page.getByTestId('sprachkenntnis-td-niveau').last()
      ).toContainText(NEW_SPRACHKENNTNIS_DATA_1.niveau)
      await expect(
        await page.getByTestId('sprachkenntnis-td-bewertungCoach').last()
      ).toContainText(NEW_SPRACHKENNTNIS_DATA_1.bewertungCoach)
      await expect(
        await page.getByTestId('sprachkenntnis-td-bewertungDatum').last()
      ).toContainText(NEW_SPRACHKENNTNIS_DATA_1.bewertungDatum)

      // Wait for network to be idle after reload
      await page.reload({ waitUntil: 'networkidle' })

      // check zertifikat list after reload
      await expect(
        await page.getByTestId('sprachkenntnis-td-sprache').last()
      ).toContainText(NEW_SPRACHKENNTNIS_DATA_1.sprache)
      await expect(
        await page.getByTestId('sprachkenntnis-td-niveau').last()
      ).toContainText(NEW_SPRACHKENNTNIS_DATA_1.niveau)
      await expect(
        await page.getByTestId('sprachkenntnis-td-bewertungCoach').last()
      ).toContainText(NEW_SPRACHKENNTNIS_DATA_1.bewertungCoach)
      await expect(
        await page.getByTestId('sprachkenntnis-td-bewertungDatum').last()
      ).toContainText(NEW_SPRACHKENNTNIS_DATA_1.bewertungDatum)
    })
  })
})

test.describe('Start Teilnehmer-Onboarding', () => {
  test('select teilnehmer and start onboarding', async ({ page }) => {
    await test.step('should start at dashboard', async () => {
      await page.goto('/dashboard')
      await expect(page).toHaveURL('/dashboard')
    })

    await test.step('after redirect, page should be visible', async () => {
      await page.getByTestId('teilnehmer-verwalten').click()
      await page.waitForURL('**/teilnehmer/verwalten')
      await expect(page.locator('h1')).toContainText('Teilnehmende verwalten')

      await page.getByTestId(`tn-filter-button`).click()
      await expect(page.getByTestId('projectName')).toBeVisible()
      await expect(page.getByTestId('seminarName')).toBeVisible()
    })

    await test.step('filter by seminar and select teilnehmer to edit', async () => {
      const { vorname, nachname, seminarId, svNummer } = SELECTED_TN
      await page.getByTestId('seminarName').fill(seminarId)
      await page.getByTestId(`seminarName-option-${seminarId}`).click()
      await page.getByTestId('tn-search').click()

      await page.getByTestId('teilnehmer-table').waitFor({ state: 'visible' })
      await expect(page.getByTestId('teilnehmer-table')).toBeVisible()

      await expect(
        page.locator('td', { hasText: vorname }).first()
      ).toBeVisible()
      await expect(
        page.locator('td', { hasText: nachname }).first()
      ).toBeVisible()

      page
        .locator('tr', { hasText: vorname })
        .getByTestId('teilnehmer-edit-link')
        .click()

      await page.waitForURL('**/teilnehmer/bearbeiten/**')

      await expect(page.locator('h1')).toContainText('Teilnehmende bearbeiten')

      await expect(page.getByTestId('start-onboarding-button')).toBeVisible()

      // TODO: add condition to check already onboarded users
      // await expect(page.getByTestId('start-onboarding-button')).toContainText(
      //   'Teilnehmenden-Onboarding',
      // )
    })

    await test.step('after click on button, PN should be generated and user redirected to onboarding funnel', async () => {
      page.getByTestId('start-onboarding-button').click()
      await page.waitForURL('**/teilnehmer/onboarding/**')

      await expect(page.locator('h1')).toContainText('Stammdaten erfassen')
    })

    await test.step('save personalnummer to json file for later usage', async () => {
      // purge file to ensure clean writes
      await deletePersonalnummer()

      const pathname = new URL(page.url()).pathname
      const personalnummer = pathname.split('/').pop()

      if (personalnummer) {
        // console.log(`Extracted personalnummer: ${personalnummer}`)
        await savePersonalnummer(personalnummer)
      } else {
        throw new Error('Failed to extract personalnummer from URL')
      }
    })
  })
})
