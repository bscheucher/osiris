import { test, expect } from '@playwright/test'

import { deleteSession } from './test-utils'

test.setTimeout(60000)

test('should log in successfully', async ({ page }) => {
  // Get username and password from environment variables
  const username = process.env.E2E_USER
  const password = process.env.E2E_PASSWORD

  if (!username || !password) {
    throw new Error(
      'E2E_USER or E2E_PASSWORD environment variables are not set'
    )
  }

  await test.step('click on log-in button - go through Azure AD login page', async () => {
    await deleteSession()

    // Navigate to the login page
    await page.goto('/login')

    // Verify that we're on the login page
    await expect(page).toHaveURL('/login')

    // Submit the form
    await page.getByTestId('login-button').click()

    await page
      .locator('input[type="email"]')
      .first()
      .waitFor({ state: 'visible', timeout: 30000 })
    await page.locator('input[type="email"]').first().fill(username)
    await page.locator('input[type="submit"]').first().click()

    await page
      .locator('input[type="password"]')
      .first()
      .waitFor({ state: 'visible', timeout: 30000 })
    await page.locator('input[type="password"]').first().fill(password)
    await page.locator('input[type="submit"]').first().click()
    await page
      .locator('input[type="submit"]')
      .waitFor({ state: 'hidden', timeout: 30000 })

    await page.waitForTimeout(2000)
    await page
      .locator('input[type="submit"]')
      .first()
      .waitFor({ state: 'visible', timeout: 30000 })
    await page.locator('input[type="submit"]').first().click()

    // Wait for navigation to complete
    await page.waitForURL('**/dashboard')

    // // Verify that we're redirected to the dashboard or home page after successful login
    // // You might need to adjust this URL based on your application's behavior
    await expect(page).toHaveURL('/dashboard')

    // Store the authentication state
    await page.context().storageState({ path: './e2e/storage/session.json' })
  })

  await test.step('setup navigation state', async () => {
    const navGroups = [
      'meinBereich',
      'meineMitarbeiter',
      'mitarbeiter',
      'teilnehmer',
      'reports',
      'seminare',
    ]

    // Save the state of opened nav groups to localStorage
    await page.evaluate((groups) => {
      window.localStorage.setItem('openNavigationItems', JSON.stringify(groups))
    }, navGroups)

    // Save complete state including auth and navigation
    await page.context().storageState({ path: './e2e/storage/session.json' })
  })
})
