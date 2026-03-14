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
  await page.goto(`/mitarbeiter/onboarding/${personalnummer}?wfi=11`)
})

test.describe('Abort Unterschriftenlauf', () => {
  test('check if WFI status is correct, then abort', async ({ page }) => {
    await waitForLoader(page)
    await expect(
      page.getByTestId('Unterschriftenlauf durchführen-inprogress')
    ).toBeVisible()
    await expect(
      page.getByTestId('unterschriftenlaufDurchführen-cancel-button')
    ).toBeVisible()
    await page
      .getByTestId('unterschriftenlaufDurchführen-cancel-button')
      .click()
    await expect(
      page.getByTestId('unterschriftenlaufDurchführen-cancel-button')
    ).toBeDisabled()

    await page
      .getByTestId('unterschriftenlauf-error-section')
      .waitFor({ state: 'visible' })
    await expect(
      page.getByTestId('Unterschriftenlauf durchführen-error')
    ).toBeVisible()
  })
})
