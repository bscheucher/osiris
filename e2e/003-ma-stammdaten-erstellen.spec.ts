import { de, Faker } from '@faker-js/faker'
import { expect, Page, test } from '@playwright/test'
import dayjs from 'dayjs'
import path from 'path'

import { getAgeAsString, loadPersonalnummer } from './test-utils'

test.setTimeout(30000)

// TODO: move to playwright config
export const faker = new Faker({
  locale: [de],
})
// https://v9.fakerjs.dev/guide/

let personalnummer: string | null = null

const BUNDESLAND_CHECKBOXES = [
  'burgenland',
  'kaernten',
  'niederoesterreich',
  'oberoesterreich',
  'salzburg',
  'steiermark',
  'tirol',
  'vorarlberg',
  'wien',
]

test.beforeEach(async ({ page }) => {
  // get personalNummer from JSON
  const loadedPersonalnummer = await loadPersonalnummer()
  expect(loadedPersonalnummer).not.toBeUndefined()

  personalnummer = loadedPersonalnummer

  // go to stammdaten page
  await page.goto(`/mitarbeiter/onboarding/${personalnummer}?wfi=3`)

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

async function saveStammdaten(page: Page) {
  await page.getByTestId('save-button').first().click()
  await waitForLoader(page)
}

test.describe('Enter Stammdaten', () => {
  test('switch between Workflowitems in Navigator should be possible', async ({
    page,
  }) => {
    await test.step('after navigation to Stammdaten page, navigator and WFIs should become visible', async () => {
      // wait for loader to disappear
      await page
        .getByTestId('loader')
        .waitFor({ state: 'hidden', timeout: 10000 })

      await expect(page.getByTestId('navigator-title')).toContainText(
        'Navigator',
        {
          timeout: 10000,
        }
      )
      await expect(page.getByTestId('navigator-container')).toContainText(
        'Stammdaten erfassen',
        { timeout: 10000 }
      )
      await expect(page.getByTestId('navigator-container')).toContainText(
        'Vertragsdaten erfassen',
        { timeout: 10000 }
      )
    })

    await page.waitForTimeout(2000)

    await test.step('Stammdaten erfassen should be in progress', async () => {
      const stammdatenWFI = await page.getByTestId(
        'Stammdaten erfassen-inprogress'
      )
      await expect(stammdatenWFI).toBeVisible()
      await expect(stammdatenWFI).toHaveClass(/border-ibis-yellow/)
    })

    await test.step('Stammdaten erfassen should be in error', async () => {
      await saveStammdaten(page)

      const stammdatenWFI = await page.getByTestId('Stammdaten erfassen-error')
      await expect(stammdatenWFI).toBeVisible()
      await expect(stammdatenWFI).toHaveClass(/bg-red-600/)
    })

    await test.step('Vertragsdaten erfassen should be in progress', async () => {
      const vertragsdatenWFI = await page.getByTestId(
        'Vertragsdaten erfassen-inprogress'
      )
      await expect(vertragsdatenWFI).toBeVisible()
      await expect(vertragsdatenWFI).toHaveClass(/border-ibis-yellow/)
    })

    await test.step('switch to Vertragsdaten', async () => {
      await page.getByTestId('Vertragsdaten erfassen').click()
      await expect(page.locator('h2')).toContainText('Vertragsdaten erfassen')
    })

    await test.step('Vertragsdaten erfassen should be in error', async () => {
      await saveStammdaten(page)

      const vertragsdatenWFI = await page.getByTestId(
        'Vertragsdaten erfassen-error'
      )
      await expect(vertragsdatenWFI).toBeVisible()
      await expect(vertragsdatenWFI).toHaveClass(/bg-red-600/)
    })

    await test.step('switch back to Stammdaten', async () => {
      await page.getByTestId('Stammdaten erfassen').click()
      await expect(page.locator('h2')).toContainText('Stammdaten erfassen')
    })
  })

  test('Stammdaten Form initial state after loading - should show errors', async ({
    page,
  }) => {
    await test.step('initial state should show errors for all required fields', async () => {
      await expect(page.getByTestId('anrede-error')).toContainText(
        'Das Feld ist leer'
      )
      await expect(page.getByTestId('nachname-error')).toContainText(
        'Das Feld ist leer'
      )
      await expect(page.getByTestId('vorname-error')).toContainText(
        'Das Feld ist leer'
      )
      await expect(page.getByTestId('ecard-error')).toContainText(
        'Das Feld ist leer'
      )
      await expect(page.getByTestId('geschlecht-error')).toContainText(
        'Das Feld ist leer'
      )
      await expect(page.getByTestId('geburtsDatum-error')).toContainText(
        'Das Feld ist leer'
      )
      await expect(page.getByTestId('staatsbuergerschaft-error')).toContainText(
        'Das Feld ist leer'
      )
      await expect(page.getByTestId('strasse-error')).toContainText(
        'Das Feld ist leer'
      )
      await expect(page.getByTestId('email-error')).toContainText(
        'Das Feld ist leer'
      )
      await expect(page.getByTestId('bank-error')).toContainText(
        'Das Feld ist leer'
      )
      await expect(page.getByTestId('iban-error')).toContainText(
        'Das Feld ist leer'
      )
      await expect(page.getByTestId('bic-error')).toContainText(
        'Das Feld ist leer'
      )
      await expect(page.getByTestId('bankcard-error')).toContainText(
        'Das Feld ist leer'
      )
    })
  })

  test('Set Stammdaten with non-EU nationality should set Arbeitsgenehmigung fields required', async ({
    page,
  }) => {
    await test.step('set staatsbuergerschaft to no eu country', async () => {
      await page.getByTestId('staatsbuergerschaft-button').click()
      await page.getByText('Ägypten').click()
    })

    await test.step('Arbeitsgenehmigung and Arbeitsgenehmigung (Dokument) should be required', async () => {
      await expect(page.getByTestId('arbeitsgenehmigung-label')).toHaveText(
        'Arbeitsgenehmigung*'
      )

      await expect(page.getByTestId('arbeitsgenehmigungDok-label')).toHaveText(
        'Arbeitsgenehmigung (Dokument)*'
      )
    })
  })

  test('should navigate to "Stammdaten erfassen" page and enter all data', async ({
    page,
  }) => {
    await test.step('enter Personendaten into form', async () => {
      // Prepare the path to the file you want to upload
      const BIRTHDATE = dayjs(
        faker.date.between({ from: '1960-01-01', to: '1999-01-01' })
      ).format('YYYY-MM-DD')

      // wait for loader to disappear
      await page
        .getByTestId('loader')
        .waitFor({ state: 'hidden', timeout: 10000 })

      await page.getByTestId('anrede').selectOption('Herr')
      await page.getByTestId('titel').selectOption('Dr.')
      await page.getByTestId('titel2').selectOption('MSc')

      await page.getByTestId('nachname').fill(faker.person.lastName())
      await page.getByTestId('vorname').fill(faker.person.lastName())

      await page.getByTestId('geburtsname').fill(faker.person.lastName())
      await page.getByTestId('svnr').fill('0000200690')

      // select file for auto upload
      await page
        .getByTestId('ecard')
        .setInputFiles(path.join(__dirname, './test-files/ecard.png'))

      await page.waitForTimeout(1000)

      await expect(await page.getByTestId('ecard-filename')).toContainText(
        'ecard.png'
      )
      await expect(page.locator('.toast-container-visible').last()).toBeVisible(
        {
          timeout: 3000,
        }
      )

      // open preview and download file
      await page.getByTestId('ecard-preview-button').click()

      await page
        .getByTestId('file-modal-download')
        .waitFor({ state: 'visible', timeout: 10000 })
      await page.getByTestId('file-modal-download').click()

      const ecardDownloadPromise = page.waitForEvent('download')
      const ecardDownload = await ecardDownloadPromise
      expect(ecardDownload.suggestedFilename()).toContain('ECARD')
      await page.getByTestId('modal-close').click()

      // continue

      await page.getByTestId('geschlecht').selectOption('Männlich')
      await page.getByTestId('familienstand').selectOption('Ledig')

      await page.locator('#geburtsDatum').fill(BIRTHDATE)

      // add click to unfocus date picker
      await page.locator('h2').first().click()
      const ageDifference = getAgeAsString(BIRTHDATE)

      await expect(page.getByTestId('alter')).toHaveValue(ageDifference)

      await page.getByTestId('staatsbuergerschaft').fill('Öst')
      await page
        .getByTestId('staatsbuergerschaft-option-Österreich')
        .click({ force: true })

      await page.getByTestId('muttersprache').fill('Deutsch')
      await page
        .getByTestId('muttersprache-option-Deutsch')
        .click({ force: true })
      await saveStammdaten(page)
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

      // select and upload bankcard
      await page
        .getByTestId('bankcard')
        .setInputFiles(path.join(__dirname, './test-files/debitkarte.jpg'))
      await expect(page.locator('.toast-container-visible').last()).toBeVisible(
        {
          timeout: 10000,
        }
      )
      await expect(await page.getByTestId('bankcard-filename')).toContainText(
        'debitkarte.jpg'
      )

      // open preview and download file
      await page.getByTestId('bankcard-preview-button').click()

      await page
        .getByTestId('file-modal-download')
        .waitFor({ state: 'visible', timeout: 10000 })
      await page.getByTestId('file-modal-download').click()

      const bankcardPromise = page.waitForEvent('download')
      const bankcardDownload = await bankcardPromise
      expect(bankcardDownload.suggestedFilename()).toContain('BANKCARD')

      await page.getByTestId('modal-close').click()

      // save page
      await saveStammdaten(page)
    })

    await test.step('enter Zusatzdaten into form', async () => {
      await page.getByTestId('arbeitsgenehmigung').fill('Blau')
      await page.getByTestId('arbeitsgenehmigung-option-Blaue Karte EU').click()

      await page
        .locator('#gueltigBis')
        .fill(
          dayjs(
            faker.date.between({ from: '2026-01-01', to: '2030-01-01' })
          ).format('YYYY.MM.DD')
        )

      await saveStammdaten(page)
    })

    await test.step('Stammdaten WFI should be complete', async () => {
      const stammdatenWFI = await page.getByTestId(
        'Stammdaten erfassen-completed'
      )
      await expect(stammdatenWFI).toBeVisible({
        timeout: 10000,
      })
      await expect(stammdatenWFI).toHaveClass(/bg-green-600/)
    })
  })

  test('Make sure "Arbeitsbereitschaft nach Bundesland" checkboxes work properly', async ({
    page,
  }) => {
    await test.step('all checkboxes can be checked and survive a refresh', async () => {
      for (const bundesland of BUNDESLAND_CHECKBOXES) {
        await expect(page.getByTestId(bundesland)).not.toBeChecked()
      }

      for (const bundesland of BUNDESLAND_CHECKBOXES) {
        await page.getByTestId(bundesland).click()
      }

      for (const bundesland of BUNDESLAND_CHECKBOXES) {
        await expect(page.getByTestId(bundesland)).toBeChecked()
      }

      await saveStammdaten(page)
      await page.reload()
      await waitForLoader(page)

      for (const bundesland of BUNDESLAND_CHECKBOXES) {
        await expect(page.getByTestId(bundesland)).toBeChecked()
      }
    })

    await test.step('all checkboxes can be un-checked and survive a refresh', async () => {
      for (const bundesland of BUNDESLAND_CHECKBOXES) {
        await expect(page.getByTestId(bundesland)).toBeChecked()
      }

      for (const bundesland of BUNDESLAND_CHECKBOXES) {
        await page.getByTestId(bundesland).click()
      }

      for (const bundesland of BUNDESLAND_CHECKBOXES) {
        await expect(page.getByTestId(bundesland)).not.toBeChecked()
      }

      await saveStammdaten(page)
      await page.reload()
      await waitForLoader(page)

      for (const bundesland of BUNDESLAND_CHECKBOXES) {
        await expect(page.getByTestId(bundesland)).not.toBeChecked()
      }
    })
  })
})
