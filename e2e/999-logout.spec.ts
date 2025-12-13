import { expect, test } from '@playwright/test'

import {
  deleteSession,
  deletePersonalnummer,
  loadPersonalnummer,
  loadSession,
  loadVertragsaenderung,
  deleteVertragsaenderung,
} from './test-utils'

test('go to dashboard - should log out successfully', async ({ page }) => {
  await page.goto(`/dashboard`)

  // Navigate to the login page
  await page.getByTestId('abmelden').click()

  // Verify that we're on the login page
  await expect(page).toHaveURL(/login.*/)
})

test('purge personalnummer - should be empty', async () => {
  await deletePersonalnummer()

  // get personalNummer from JSON
  const loadedPersonalnummer = await loadPersonalnummer()
  // shoul be empty
  expect(loadedPersonalnummer).toBeUndefined()
})

test('purge vertragsaenderung - should be empty', async () => {
  await deleteVertragsaenderung()

  // get personalNummer from JSON
  const loadedPersonalnummer = await loadVertragsaenderung()
  // shoul be empty
  expect(loadedPersonalnummer).toBeUndefined()
})

test('purge session - should be empty', async () => {
  await deleteSession()

  // get personalNummer from JSON
  const loadedSession = await loadSession()
  // should be empty
  expect(loadedSession).toMatchObject({})
})
