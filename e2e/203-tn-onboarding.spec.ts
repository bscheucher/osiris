import { de, Faker } from '@faker-js/faker'
import { expect, Page, test } from '@playwright/test'
import dayjs from 'dayjs'
import path from 'path'

import { loadPersonalnummer } from './test-utils'

// TODO: move to playwright config
export const faker = new Faker({
  locale: [de],
})
// https://v9.fakerjs.dev/guide/

let personalnummer: string | null = null

test.beforeEach(async ({ page }) => {
  // get personalNummer from JSON
  const loadedPersonalnummer = await loadPersonalnummer()
  expect(loadedPersonalnummer).not.toBeUndefined()

  personalnummer = loadedPersonalnummer
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

async function saveVertragsdaten(page: Page) {
  await page.getByTestId('save-button').first().click()
  await waitForLoader(page)
}

test.describe('Enter Stammdaten', () => {
  test('should navigate to "Stammdaten erfassen" page and enter all data', async ({
    page,
  }) => {
    await test.step('navigate to stammdaten form', async () => {
      // go to stammdaten page
      await page.goto(`/teilnehmer/onboarding/${personalnummer}?wfi=18`)

      // wait for loader to disappear
      await page
        .getByTestId('loader')
        .waitFor({ state: 'hidden', timeout: 10000 })
    })

    await test.step('enter Personendaten into form', async () => {
      await page
        .getByTestId('ecard')
        .setInputFiles(path.join(__dirname, './test-files/ecard.png'))
      await page.getByTestId('ecard-upload-button').click()
      await page.waitForTimeout(1000)

      await expect(await page.getByTestId('ecard-filename')).toContainText(
        'ecard.png'
      )
      await expect(page.locator('.toast-container').first()).toBeVisible({
        timeout: 3000,
      })

      await saveVertragsdaten(page)
    })

    await test.step('enter Kontaktdaten into form', async () => {
      await page.getByTestId('strasse').fill('Testgasse 1')
      await page.getByTestId('strasse').press('Tab')
      await page.getByTestId('land').fill('Öst')
      await page.getByTestId('land-option-Österreich').click()

      await page.getByTestId('plz').fill('1070')
      await page.getByTestId('ort').fill('Wien')
      await page.getByTestId('email').fill(faker.internet.email())
      await page
        .getByTestId('mobilnummer')
        .fill(faker.phone.number({ style: 'international' }))
    })

    await test.step('enter Bankdaten into form', async () => {
      await page.getByTestId('bank').fill('UNICREDIT BANK AUSTRIA AG')
      await page.getByTestId('bic').fill('BKAUATWW')
      await page.getByTestId('iban').fill('AT021200000703447144')
      await page
        .getByTestId('bankcard')
        .setInputFiles(path.join(__dirname, './test-files/debitkarte.jpg'))
      await page.getByTestId('bankcard-upload-button').click()
      await expect(page.locator('.toast-container').first()).toBeVisible({
        timeout: 10000,
      })

      await expect(await page.getByTestId('bankcard-filename')).toContainText(
        'debitkarte.jpg'
      )
      await saveVertragsdaten(page)
    })

    await test.step('Stammdaten WFI should be complete', async () => {
      const stammdatenWFI = await page.getByTestId(
        'Stammdaten erfassen (Teilnehmende)-completed'
      )
      await expect(stammdatenWFI).toBeVisible({
        timeout: 10000,
      })
      await expect(stammdatenWFI).toHaveClass(/bg-green-600/)
    })
  })
})

test.describe('Enter Vertragsdaten', () => {
  test('should navigate to "Vertragsdaten erfassen" page and enter all data', async ({
    page,
  }) => {
    await test.step('navigate to vertragsdaten form', async () => {
      // go to stammdaten page
      await page.goto(`/teilnehmer/onboarding/${personalnummer}?wfi=19`)

      // wait for loader to disappear
      await page
        .getByTestId('loader')
        .waitFor({ state: 'hidden', timeout: 10000 })
    })

    await test.step('after initial save, all required fields should show an error', async () => {
      await saveVertragsdaten(page)
      // expext errors for all required fields on the allgemein section
      await expect(page.getByTestId('eintritt-error')).toBeVisible()
      await expect(page.getByTestId('kostenstelle-error')).toBeVisible()
      await expect(page.getByTestId('dienstort-error')).toBeVisible()
      await expect(page.getByTestId('fuehrungskraft-error')).toBeVisible()

      // expect errors for all required fields in the gehalt section
      await expect(page.getByTestId('naechsteVorrueckung-error')).toBeVisible()
      await expect(page.getByTestId('klasse-error')).toBeVisible()
      await expect(page.getByTestId('lehrjahr-error')).toBeVisible()

      // expect errors for all required fields in the arbeitszeit section
      await expect(page.getByTestId('abrechnungsgruppe-error')).toBeVisible()
      await expect(page.getByTestId('dienstnehmergruppe-error')).toBeVisible()
    })

    await test.step('Vertragsdaten WFI should be status error', async () => {
      const vertragsdatenWFI = await page.getByTestId(
        'Vertragsdaten erfassen (Teilnehmende)-error'
      )
      await expect(vertragsdatenWFI).toBeVisible({
        timeout: 10000,
      })
      await expect(vertragsdatenWFI).toHaveClass(/bg-red-600/)
    })

    await test.step('enter Allgemein data into form', async () => {
      const eintritt = dayjs(
        faker.date.between({ from: '2025-03-01', to: '2025-08-01' })
      ).format('DD.MM.YYYY')

      await page
        .getByTestId('loader')
        .first()
        .waitFor({ state: 'hidden', timeout: 10000 })

      await page.locator('#eintritt').click()
      await page.locator('#eintritt').fill(eintritt)

      // native select menu
      await page.getByTestId('kostenstelle').selectOption('IDC')

      // combobox: click button only
      await page.getByTestId('dienstort-button').click()
      await page.getByTestId('dienstort-option-Baden (Goethegasse 14)').click()

      // combobox: fill directly
      await page.getByTestId('fuehrungskraft').fill('Alex')
      await page
        .getByTestId('fuehrungskraft-option-Alexander Pollinger')
        .click()

      // TODO: this section is only necessary due to missing backend side prefilling and should be removed
      await page.getByTestId('kategorie').selectOption('Lehrling')
      await page.getByTestId('taetigkeit-button').click()
      await page.getByTestId('taetigkeit-option-AMS-Lehrteilnehmer').click()
      await page
        .getByTestId('kollektivvertrag')
        .selectOption('AMS-Lehrteilnehmer')

      await saveVertragsdaten(page)

      // expect no errors on the changed fields after save
      await expect(page.getByTestId('eintritt-error')).toBeHidden()
      await expect(page.getByTestId('kostenstelle-error')).toBeHidden()
      await expect(page.getByTestId('dienstort-error')).toBeHidden()
      await expect(page.getByTestId('fuehrungskraft-error')).toBeHidden()
    })

    await test.step('enter Gehalt data into form', async () => {
      const naechsteVorrueckung = dayjs(
        faker.date.between({ from: '2025-04-01', to: '2025-08-01' })
      ).format('DD.MM.YYYY')

      await page
        .getByTestId('loader')
        .first()
        .waitFor({ state: 'hidden', timeout: 10000 })

      await page.locator('#naechsteVorrueckung').click()
      await page.locator('#naechsteVorrueckung').fill(naechsteVorrueckung)

      await page.getByTestId('klasse').selectOption('ÜBA')

      await page.getByTestId('lehrjahr').fill('2')

      await saveVertragsdaten(page)

      // expect no errors on the changed fields after save
      await expect(page.getByTestId('naechsteVorrueckung-error')).toBeHidden()
      await expect(page.getByTestId('klasse-error')).toBeHidden()
      await expect(page.getByTestId('lehrjahr-error')).toBeHidden()
    })

    await test.step('enter Arbeitszeiten data into form', async () => {
      await page.getByTestId('abrechnungsgruppe').selectOption('TN NÖ')
      await page
        .getByTestId('dienstnehmergruppe')
        .selectOption('Niederösterreich')

      await saveVertragsdaten(page)

      // expect no errors on the changed fields after save
      await expect(page.getByTestId('abrechnungsgruppe-error')).toBeHidden()
      await expect(page.getByTestId('dienstnehmergruppe-error')).toBeHidden()
    })

    await test.step('Vertragsdaten WFI should be complete', async () => {
      const vertragsdatenWFI = await page.getByTestId(
        'Vertragsdaten erfassen (Teilnehmende)-completed'
      )
      await expect(vertragsdatenWFI).toBeVisible({
        timeout: 10000,
      })
      await expect(vertragsdatenWFI).toHaveClass(/bg-green-600/)
    })
  })
})
