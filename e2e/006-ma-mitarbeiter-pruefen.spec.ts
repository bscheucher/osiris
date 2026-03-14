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
test.setTimeout(40000)

let personalnummer: string | null = null

async function waitForLoader(page: Page) {
  await page
    .getByTestId('loader')
    .first()
    .waitFor({ state: 'visible', timeout: 30000 })
  await page
    .getByTestId('loader')
    .first()
    .waitFor({ state: 'hidden', timeout: 30000 })
}

test.beforeEach(async ({ page }) => {
  // get personalNummer from JSON
  const loadedPersonalnummer = await loadPersonalnummer()
  expect(loadedPersonalnummer).not.toBeUndefined()

  personalnummer = loadedPersonalnummer

  // go to stammdaten page
  await page.goto(`/mitarbeiter/onboarding/${personalnummer}?wfi=7`)
})

// test.afterEach(async ({ page }) => {})

test.describe('Enter Mitarbeiter prüfen form', () => {
  test('make sure form state is correct', async ({ page }) => {
    await page.waitForTimeout(3000)

    const bankcardDownloadButton = page.getByTestId('bankcard-download-button')
    await bankcardDownloadButton.waitFor({ state: 'visible' })
    await expect(bankcardDownloadButton).toBeVisible()

    const bankcardCheckbox = page.getByTestId('bankcard')
    await expect(bankcardCheckbox).toBeEnabled()
    await expect(bankcardCheckbox).not.toBeChecked()

    const bankcardReasonInput = page.getByTestId('bankcardReason')
    await bankcardReasonInput.waitFor({ state: 'visible' })
    await expect(bankcardReasonInput).toBeVisible()
    await expect(page.getByTestId('bankcardReason-label')).toHaveText(
      'Bemerkung*'
    )

    const ecardDownloadButton = page.getByTestId('ecard-download-button')
    await ecardDownloadButton.waitFor({ state: 'visible' })
    await expect(ecardDownloadButton).toBeVisible()

    const ecardCheckbox = page.getByTestId('ecard')
    await expect(ecardCheckbox).toBeEnabled()
    await expect(ecardCheckbox).not.toBeChecked()

    const ecardReasonInput = page.getByTestId('ecardReason')
    await ecardReasonInput.waitFor({ state: 'visible' })
    await expect(ecardReasonInput).toBeVisible()
    await expect(page.getByTestId('ecardReason-label')).toHaveText('Bemerkung*')

    const arbeitsgenehmigung = page.getByTestId(
      'arbeitsgenehmigungDok-not-required'
    )
    await expect(arbeitsgenehmigung).toBeVisible()
    await expect(arbeitsgenehmigung).toContainText('Nicht erforderlich')

    const gehaltCheckbox = page.getByTestId('gehaltEinstufung')
    await expect(gehaltCheckbox).toBeEnabled()
    await expect(gehaltCheckbox).not.toBeChecked()

    const gehaltEinstufungReasonInput = page.getByTestId(
      'gehaltEinstufungReason'
    )
    await gehaltEinstufungReasonInput.waitFor({ state: 'visible' })
    await expect(gehaltEinstufungReasonInput).toBeVisible()
    await expect(page.getByTestId('gehaltEinstufungReason-label')).toHaveText(
      'Bemerkung*'
    )

    const submitButton = page.getByTestId('ma-pruefen-submit-button')
    await expect(submitButton).toBeEnabled()
  })

  test('Go back to Stammdaten, Set Staatsbuergerschaft to non-eu nationality - expect to see arbeitsgenehmigung fields in MA prüfen', async ({
    page,
  }) => {
    await test.step('navigate to Stammdaten', async () => {
      await page.getByTestId('Stammdaten erfassen').click()
      await waitForLoader(page)
    })

    await test.step('set staatsbuergerschaft to no eu country and add Arbeitsgenehmigung and Arbeitsgenehmigung (Dokument)', async () => {
      await page.getByTestId('staatsbuergerschaft').fill('Afghan')
      await page.getByText('Afghanistan').click()

      await expect(page.getByTestId('arbeitsgenehmigungDok-label')).toHaveText(
        'Arbeitsgenehmigung (Dokument)*'
      )

      await expect(page.getByTestId('arbeitsgenehmigung-label')).toHaveText(
        'Arbeitsgenehmigung*'
      )

      await page
        .getByTestId('arbeitsgenehmigungDok')
        .setInputFiles(
          path.join(__dirname, './test-files/arbeitsgenehmigung.jpg')
        )
      await page.waitForTimeout(1000)

      await page.getByTestId('arbeitsgenehmigung').fill('Daueraufenthalt')
      await page.getByText('Daueraufenthalt-EU').click()

      await page
        .locator('#gueltigBis')
        .fill(
          dayjs(
            faker.date.between({ from: '2026-01-01', to: '2030-01-01' })
          ).format('YYYY.MM.DD')
        )
      await page.getByTestId('save-button').click()
      await waitForLoader(page)
    })

    await test.step('navigate back to MA-Pruefen', async () => {
      await page.getByTestId('Mitarbeitendedaten prüfen').click()
      await waitForLoader(page)
    })

    await test.step('MA-Pruefen form should have Arbeitserlaubnis section with checkbox and download', async () => {
      const arbeitsgenehmigungDokDownloadButton = page.getByTestId(
        'arbeitsgenehmigungDok-download-button'
      )
      await arbeitsgenehmigungDokDownloadButton.waitFor({ state: 'visible' })
      await expect(arbeitsgenehmigungDokDownloadButton).toBeVisible()

      const arbeitsgenehmigungDokCheckbox = page.getByTestId(
        'arbeitsgenehmigungDok'
      )
      await expect(arbeitsgenehmigungDokCheckbox).toBeEnabled()
      await expect(arbeitsgenehmigungDokCheckbox).not.toBeChecked()

      const arbeitsgenehmigungDokReasonInput = page.getByTestId(
        'arbeitsgenehmigungDokReason'
      )
      await arbeitsgenehmigungDokReasonInput.waitFor({ state: 'visible' })
      await expect(arbeitsgenehmigungDokReasonInput).toBeVisible()
      await expect(
        page.getByTestId('arbeitsgenehmigungDokReason-label')
      ).toHaveText('Bemerkung*')
    })
  })
})

test('Check if field validation works', async ({ page }) => {
  const submitButton = page.getByTestId('ma-pruefen-submit-button')
  await submitButton.waitFor({ state: 'visible' })
  await expect(submitButton).toBeEnabled()
  await submitButton.click()

  expect(page.getByTestId('bankcardReason-error')).toContainText(
    'Dieses Feld ist erforderlich'
  )
  expect(page.getByTestId('ecardReason-error')).toContainText(
    'Dieses Feld ist erforderlich'
  )
  expect(page.getByTestId('arbeitsgenehmigungDokReason-error')).toContainText(
    'Dieses Feld ist erforderlich'
  )
  expect(page.getByTestId('gehaltEinstufungReason-error')).toContainText(
    'Dieses Feld ist erforderlich'
  )
})

test('download all files and reject MA', async ({ page }) => {
  await test.step('download, accept, reject and enter reason for bankcard', async () => {
    await page.getByTestId('bankcard-download-button').click()
    const bankCardDownloadPromise = page.waitForEvent('download')
    const bankCardDownload = await bankCardDownloadPromise
    expect(bankCardDownload.suggestedFilename()).toContain('BANKCARD')

    const bankcardCheckbox = page.getByTestId('bankcard')
    await expect(bankcardCheckbox).not.toBeChecked()

    await bankcardCheckbox.click({ force: true })
    await expect(bankcardCheckbox).toBeChecked()

    const bankcardReason = page.getByTestId('bankcardReason')
    await expect(bankcardReason).toBeDisabled()
    await expect(bankcardReason).toHaveValue('')

    await bankcardCheckbox.click({ force: false })
    await expect(bankcardCheckbox).not.toBeChecked()

    await expect(bankcardReason).not.toBeDisabled()

    await page.getByTestId('bankcardReason').fill('Bank card invalid')
    await expect(bankcardReason).toHaveValue('Bank card invalid')
  })

  await test.step('download, accept, reject and enter reason for ecard', async () => {
    await page.getByTestId('ecard-download-button').click()
    const ecardDownloadPromise = page.waitForEvent('download')
    const ecardDownload = await ecardDownloadPromise
    expect(ecardDownload.suggestedFilename()).toContain('ECARD')

    const ecardCheckbox = page.getByTestId('ecard')
    await expect(ecardCheckbox).not.toBeChecked()

    await ecardCheckbox.click({ force: true })
    await expect(ecardCheckbox).toBeChecked()

    const ecardReason = page.getByTestId('ecardReason')
    await expect(ecardReason).toBeDisabled()
    await expect(ecardReason).toHaveValue('')

    await ecardCheckbox.click({ force: false })
    await expect(ecardCheckbox).not.toBeChecked()

    await expect(ecardReason).not.toBeDisabled()

    await page.getByTestId('ecardReason').fill('E-Card invalid')
    await expect(ecardReason).toHaveValue('E-Card invalid')
  })

  await test.step('download, accept, reject and enter reason for arbeitsgenehmigung', async () => {
    await page.getByTestId('arbeitsgenehmigungDok-download-button').click()
    const arbeitsgenehmigungDokDownloadPromise = page.waitForEvent('download')
    const arbeitsgenehmigungDokDownload =
      await arbeitsgenehmigungDokDownloadPromise
    expect(arbeitsgenehmigungDokDownload.suggestedFilename()).toContain(
      'ARBEITSGENEHMIGUNG'
    )

    const arbeitsgenehmigungDokCheckbox = page.getByTestId(
      'arbeitsgenehmigungDok'
    )
    await expect(arbeitsgenehmigungDokCheckbox).not.toBeChecked()

    await arbeitsgenehmigungDokCheckbox.click({ force: true })
    await expect(arbeitsgenehmigungDokCheckbox).toBeChecked()

    const arbeitsgenehmigungDokReason = page.getByTestId(
      'arbeitsgenehmigungDokReason'
    )
    await expect(arbeitsgenehmigungDokReason).toBeDisabled()
    await expect(arbeitsgenehmigungDokReason).toHaveValue('')

    await arbeitsgenehmigungDokCheckbox.click({ force: false })
    await expect(arbeitsgenehmigungDokCheckbox).not.toBeChecked()

    await expect(arbeitsgenehmigungDokReason).not.toBeDisabled()

    await page
      .getByTestId('arbeitsgenehmigungDokReason')
      .fill('Arbeitserlaubnis invalid')
    await expect(arbeitsgenehmigungDokReason).toHaveValue(
      'Arbeitserlaubnis invalid'
    )
  })

  await test.step('accept, reject and enter reason for gehaltEinstufung', async () => {
    const gehaltEinstufungCheckbox = page.getByTestId('gehaltEinstufung')
    await expect(gehaltEinstufungCheckbox).not.toBeChecked()

    await gehaltEinstufungCheckbox.click({ force: true })
    await expect(gehaltEinstufungCheckbox).toBeChecked()

    const gehaltEinstufungReason = page.getByTestId('gehaltEinstufungReason')
    await expect(gehaltEinstufungReason).toBeDisabled()
    await expect(gehaltEinstufungReason).toHaveValue('')

    await gehaltEinstufungCheckbox.click({ force: false })
    await expect(gehaltEinstufungCheckbox).not.toBeChecked()

    await expect(gehaltEinstufungReason).not.toBeDisabled()

    await page
      .getByTestId('gehaltEinstufungReason')
      .fill('Gehalt und Einstufung invalid')
    await expect(gehaltEinstufungReason).toHaveValue(
      'Gehalt und Einstufung invalid'
    )
  })

  await test.step('submit MA-Pruefen form', async () => {
    const submitButton = page.getByTestId('ma-pruefen-submit-button')
    await submitButton.waitFor({ state: 'visible' })
    await expect(submitButton).toBeEnabled()
    await submitButton.click()

    await waitForLoader(page)

    const stammdatenWFI = await page.getByTestId('Stammdaten erfassen-error')
    await expect(stammdatenWFI).toBeVisible()
    await expect(stammdatenWFI).toHaveClass(/bg-red-600/)

    const vertragsdatenWFI = await page.getByTestId(
      'Vertragsdaten erfassen-error'
    )
    await expect(vertragsdatenWFI).toBeVisible()
    await expect(vertragsdatenWFI).toHaveClass(/bg-red-600/)

    const maPruefenWFI = await page.getByTestId(
      'Mitarbeitendedaten prüfen-error'
    )
    await expect(maPruefenWFI).toBeVisible()
    await expect(maPruefenWFI).toHaveClass(/bg-red-600/)

    expect(page.getByTestId('Mitarbeitendedaten prüfen-error')).toBeVisible({
      timeout: 20000,
    })
  })
})

test('Re-Save Stammdaten and Vertragsdaten and accept Mitarbeiter', async ({
  page,
}) => {
  await test.step('go to Stammdaten by clicking on WFI in Navigator', async () => {
    await page.getByTestId('Stammdaten erfassen').click()
    await waitForLoader(page)
  })

  await test.step('Save Stammdaten and expect WFI to be complete again', async () => {
    await page.waitForTimeout(1000)
    await page.getByTestId('save-button').click()
    await waitForLoader(page)

    expect(page.getByTestId('Stammdaten erfassen-completed')).toBeVisible()
  })

  await test.step('go to Vertragsdaten by clicking on WFI in Navigator', async () => {
    await page.getByTestId('Vertragsdaten erfassen').click()
    await waitForLoader(page)
  })

  await test.step('Save Vertragsdaten and expect WFI to be complete again', async () => {
    await page.waitForTimeout(1000)
    await page.getByTestId('save-button').first().click()

    await waitForLoader(page)

    await page
      .getByTestId('Vertragsdaten erfassen-completed')
      .waitFor({ state: 'visible' })

    expect(page.getByTestId('Vertragsdaten erfassen-completed')).toBeVisible()
    expect(
      page.getByTestId('Lohnverrechnung informieren-inprogress')
    ).toBeVisible()
  })

  await test.step('Go to "Lohnverrechunng informieren" by clicking on WFI in Navigator', async () => {
    await page.getByTestId('Lohnverrechnung informieren').click()
  })

  await test.step('Start "Lohnverrechunng informieren" and check new WFIs', async () => {
    await expect(
      page.getByTestId('lohnverrechnungInformieren-button')
    ).toBeVisible()

    await expect(
      page.getByTestId('lohnverrechnungInformieren-button')
    ).toBeEnabled()

    await page.getByTestId('lohnverrechnungInformieren-button').click()

    await expect(
      page.getByTestId('lohnverrechnungInformieren-button')
    ).toBeDisabled()

    await expect(
      page.getByTestId('Lohnverrechnung informieren-completed')
    ).toBeVisible()
    await expect(
      page.getByTestId('Mitarbeitendedaten prüfen-inprogress')
    ).toBeVisible()
  })

  await test.step('got to Mitarbeiter Pruefen by clicking on WFI in Navigator', async () => {
    await page.getByTestId('Mitarbeitendedaten prüfen').click()
    await waitForLoader(page)
  })

  await test.step('Accept Mitarbeiter, check all boxes to "JA"', async () => {
    const bankcardCheckbox = page.getByTestId('bankcard')
    await expect(bankcardCheckbox).not.toBeChecked()

    await bankcardCheckbox.click({ force: true })
    await expect(bankcardCheckbox).toBeChecked()

    const bankcardReason = page.getByTestId('bankcardReason')
    await expect(bankcardReason).toBeDisabled()
    await expect(bankcardReason).toHaveValue('')

    const ecardCheckbox = page.getByTestId('ecard')
    await expect(ecardCheckbox).not.toBeChecked()

    await ecardCheckbox.click({ force: true })
    await expect(ecardCheckbox).toBeChecked()

    const ecardReason = page.getByTestId('ecardReason')
    await expect(ecardReason).toBeDisabled()
    await expect(ecardReason).toHaveValue('')

    const arbeitsgenehmigungDokCheckbox = page.getByTestId(
      'arbeitsgenehmigungDok'
    )
    await expect(arbeitsgenehmigungDokCheckbox).not.toBeChecked()

    await arbeitsgenehmigungDokCheckbox.click({ force: true })
    await expect(arbeitsgenehmigungDokCheckbox).toBeChecked()

    const arbeitsgenehmigungDokReason = page.getByTestId(
      'arbeitsgenehmigungDokReason'
    )
    await expect(arbeitsgenehmigungDokReason).toBeDisabled()
    await expect(arbeitsgenehmigungDokReason).toHaveValue('')

    const gehaltEinstufungCheckbox = page.getByTestId('gehaltEinstufung')
    await expect(gehaltEinstufungCheckbox).not.toBeChecked()

    await gehaltEinstufungCheckbox.click({ force: true })
    await expect(gehaltEinstufungCheckbox).toBeChecked()

    const gehaltEinstufungReason = page.getByTestId('gehaltEinstufungReason')
    await expect(gehaltEinstufungReason).toBeDisabled()
    await expect(gehaltEinstufungReason).toHaveValue('')
  })

  await test.step('After acceptance, expect next steps to be available', async () => {
    await page.getByTestId('ma-pruefen-submit-button').click()
    await waitForLoader(page)

    const dienstvertragErstellenWFI = await page.getByTestId(
      'Dienstvertrag erstellen-completed'
    )
    await expect(dienstvertragErstellenWFI).toBeVisible()
    await expect(dienstvertragErstellenWFI).toHaveClass(/bg-green-600/)

    const unterschriftenLaufStartenWFI = await page.getByTestId(
      'Unterschriftenlauf starten-inprogress'
    )
    await expect(unterschriftenLaufStartenWFI).toBeVisible()
    await expect(unterschriftenLaufStartenWFI).toHaveClass(/border-ibis-yellow/)
  })
})
