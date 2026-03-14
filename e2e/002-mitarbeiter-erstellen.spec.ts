import { de, Faker } from '@faker-js/faker'
import { expect, test } from '@playwright/test'

import { deletePersonalnummer, savePersonalnummer } from './test-utils'

// TODO: move to playwright config
export const faker = new Faker({
  locale: [de],
})
// https://v9.fakerjs.dev/guide/

test.describe('Create Mitarbeiter', () => {
  test('should choose kostenstelle and submit form to create new personalnummer', async ({
    page,
  }) => {
    await test.step('should start at dashboard', async () => {
      // Navigate to the login page
      await page.goto('/dashboard')
      await expect(page).toHaveURL('/dashboard')
    })
    await test.step('should choose kostenstelle and submit form to create new personalnummer', async () => {
      await page.getByTestId('mitarbeiter-erfassen').click()
      await page.getByTestId('firma-button').click()
      await page.getByText('ibis acam Bildungs GmbH').click()
      await page.getByTestId('mitarbeiter-anlegen-save').click()
      await page
        .locator('h2', { hasText: 'Stammdaten erfassen' })
        .waitFor({ state: 'visible' })
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
