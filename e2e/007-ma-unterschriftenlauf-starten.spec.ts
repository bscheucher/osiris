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

  // go to unterschriftenlauf starten page
  await page.goto(`/mitarbeiter/onboarding/${personalnummer}?wfi=10`)
})

test.describe('Check Dienstvertrag and start Unterschriftenlauf', () => {
  test('make sure Dienstvertrag PDF-Preview is shown', async ({ page }) => {
    await waitForLoader(page)
    await expect(
      page.getByTestId('Unterschriftenlauf starten-inprogress')
    ).toBeVisible()
    await expect(
      page.getByTestId('Unterschriftenlauf starten-PdfViewer')
    ).toBeVisible()
    await expect(
      page.getByTestId('unterschriftenlaufStarten-infoText')
    ).toBeVisible()
    await expect(
      page.getByTestId('unterschriftenlaufStarten-button')
    ).toBeVisible()
  })

  test('start unterschriftenlauf should be successful', async ({ page }) => {
    await test.step('start unterschriftenlauf', async () => {
      await page.getByTestId('unterschriftenlaufStarten-button').click()
      await waitForLoader(page)
    })

    await test.step('show success message', async () => {
      await expect(
        page.locator('p', {
          hasText: 'Erfolgreich durchgeführt durch',
        })
      ).toBeVisible()
    })

    await test.step('unterschriftenlauf durchführen should be in progress', async () => {
      await expect(
        page.getByTestId('Unterschriftenlauf durchführen-inprogress')
      ).toBeVisible()
    })
  })
})
