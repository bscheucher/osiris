import { de, Faker } from '@faker-js/faker'
import { expect, Page, test } from '@playwright/test'

import { TN_IDS } from './private/tn-data' // user reference data that shouldn't be tracked
import {
  deletePersonalnummer,
  expectURL,
  savePersonalnummer,
  URLMatcher,
} from './test-utils'

// TODO: move to playwright config
export const faker = new Faker({
  locale: [de],
})
// https://v9.fakerjs.dev/guide/

const SELECTED_TN = TN_IDS[6]

async function resetForm(page: Page) {
  await page.getByTestId('tn-reset').click()
  await page.getByTestId('teilnehmer-table').waitFor({ state: 'hidden' })

  await expect(page).toHaveURL('/teilnehmer/verwalten')
  await expect(page.getByTestId('teilnehmer-table')).not.toBeVisible()
}

test.describe('Search with Teilnehmer on verwalten page', () => {
  test('search and filter using form', async ({ page }) => {
    const { vorname, nachname, seminarId, svNummer } = SELECTED_TN

    await test.step('should start at dashboard', async () => {
      await page.goto('/dashboard')
      await expect(page).toHaveURL('/dashboard')
    })

    await test.step('after redirect, verwalten page should be visible', async () => {
      await page.getByTestId('teilnehmer-verwalten').click()
      await page.waitForURL('**/teilnehmer/verwalten**')

      await expectURL(page, {
        pathname: '/teilnehmer/verwalten',
        searchParams: {
          page: '1',
          isActive: 'true',
        },
      })

      await expect(page.locator('h1')).toContainText('Teilnehmende verwalten')

      await page.getByTestId(`tn-filter-button`).click()
      await expect(page.getByTestId('projectName')).toBeVisible()
      await expect(page.getByTestId('seminarName')).toBeVisible()
    })

    await test.step('filter by seminar', async () => {
      await page.getByTestId('seminarName').fill(seminarId)
      await page.getByTestId(`seminarName-option-${seminarId}`).click()

      // submit and wait for results
      await page.getByTestId('tn-search').click()
      await page.getByTestId('teilnehmer-table').waitFor({ state: 'visible' })

      await expect(page.getByTestId('teilnehmer-table')).toBeVisible()
      await expect(
        page.locator('td', { hasText: vorname }).first()
      ).toBeVisible()
      await expect(
        page.locator('td', { hasText: nachname }).first()
      ).toBeVisible()

      await expect(page).toHaveURL(
        URLMatcher({
          pathname: '/teilnehmer/verwalten',
          searchParams: {
            page: '1',
            isActive: 'true',
            seminarName: seminarId,
          },
        })
      )

      // reset form
      await resetForm(page)
    })

    await test.step('search name and filter by seminar', async () => {
      await page.getByTestId('identifiersString').fill(nachname)

      await page.getByTestId('seminarName').fill(seminarId)
      await page.getByTestId(`seminarName-option-${seminarId}`).first().click()

      // submit and wait for results
      await page.getByTestId('tn-search').click()
      await page.getByTestId('teilnehmer-table').waitFor({ state: 'visible' })

      await expect(page.getByTestId('teilnehmer-table')).toBeVisible()
      await expect(
        page.locator('td', { hasText: vorname }).first()
      ).toBeVisible()
      await expect(
        page.locator('td', { hasText: nachname }).first()
      ).toBeVisible()

      await expect(page).toHaveURL(
        URLMatcher({
          pathname: '/teilnehmer/verwalten',
          searchParams: {
            page: '1',
            identifiersString: nachname,
            seminarName: seminarId,
          },
        })
      )

      // reset form
      await resetForm(page)
    })

    await test.step('search by SVNR', async () => {
      await page.getByTestId('identifiersString').fill(svNummer)

      // submit and wait for results
      await page.getByTestId('tn-search').click()
      await page.getByTestId('teilnehmer-table').waitFor({ state: 'visible' })

      await expect(page.getByTestId('teilnehmer-table')).toBeVisible()
      await expect(
        page.locator('td', { hasText: vorname }).first()
      ).toBeVisible()
      await expect(
        page.locator('td', { hasText: nachname }).first()
      ).toBeVisible()

      await expect(page).toHaveURL(
        URLMatcher({
          pathname: '/teilnehmer/verwalten',
          searchParams: {
            page: '1',
            identifiersString: svNummer,
          },
        })
      )

      // reset form
      await resetForm(page)
    })

    await test.step('search for non existent user with no results', async () => {
      const testName = 'testinger'
      await page.getByTestId('identifiersString').fill(testName)

      // submit and wait for results
      await page.getByTestId('tn-search').click()

      await expect(page.getByTestId('teilnehmer-table')).not.toBeVisible()
      await expect(
        page.locator('p', { hasText: 'Keine Teilnehmenden gefunden.' }).first()
      ).toBeVisible()

      await expect(page).toHaveURL(
        URLMatcher({
          pathname: '/teilnehmer/verwalten',
          searchParams: {
            page: '1',
            identifiersString: testName,
          },
        })
      )

      // reset form
      await resetForm(page)
    })
  })
})

test.describe('Open Teilnehmer-Edit view and save Personalnummer', () => {
  test('filter teilnehmer and navigate to page', async ({ page }) => {
    await test.step('should start at dashboard', async () => {
      await page.goto('/dashboard')
      await page.waitForURL('/dashboard')
    })

    await test.step('after redirect, page should be visible', async () => {
      await page.getByTestId('teilnehmer-verwalten').click()
      await page.waitForURL('**/teilnehmer/verwalten**')

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
