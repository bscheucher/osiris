import { de, Faker } from '@faker-js/faker'
import { expect, Page, test } from '@playwright/test'

import { loadPersonalnummer } from './test-utils'

export const faker = new Faker({
  locale: [de],
})
// https://v9.fakerjs.dev/guide/

let personalnummer: string | null = null

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

test.beforeEach(async ({ page }) => {
  // get personalNummer from JSON
  const loadedPersonalnummer = await loadPersonalnummer()
  expect(loadedPersonalnummer).not.toBeUndefined()

  personalnummer = loadedPersonalnummer

  // go to unterschriftenlauf durchführen page
  await page.goto(`/mitarbeiter/onboarding/${personalnummer}?wfi=6`)
})

test.describe('Start process for "Lohnverrechung informieren"', () => {
  test('check if WFI status is correct', async ({ page }) => {
    await waitForLoader(page)

    await expect(
      page.getByTestId('Lohnverrechnung informieren-inprogress')
    ).toBeVisible()
  })

  test('Start "Lohnverrechunng informieren" and check new WFIs', async ({
    page,
  }) => {
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
})
