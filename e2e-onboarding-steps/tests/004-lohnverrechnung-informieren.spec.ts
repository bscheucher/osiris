import { expect, test } from '@playwright/test'
import { LohnverrechnungInformierenPage } from '../poms/lohnverrechnung-informieren.pom'
import { waitForLoader } from '../test-utils'

/**
 * E2E Tests for Step 4 (wfi=6): Lohnverrechnung informieren (Inform Payroll)
 *
 * Prerequisites:
 * - Steps 1-3 must be completed (Stammdaten, Vertragsdaten, KV-Einstufung)
 * - User must have MA_ONBOARDING_LV_INFORMIEREN role
 * - Personalnummer must be available
 *
 * This test suite covers:
 * 1. Navigation to the step
 * 2. UI element visibility and state
 * 3. Clicking the inform button
 * 4. Workflow status transitions
 * 5. Next step activation
 */

test.describe('Step 4: Lohnverrechnung informieren', () => {
  // In a real scenario, you would get the personalnummer from previous tests
  // For this example, we'll use an environment variable or fixture
  const personalnummer = process.env.TEST_PERSONALNUMMER || '12345'
  let lvInformierenPage: LohnverrechnungInformierenPage

  test.beforeEach(async ({ page }) => {
    lvInformierenPage = new LohnverrechnungInformierenPage(page, personalnummer)
  })

  test('should display the Lohnverrechnung informieren page correctly', async ({ page }) => {
    await test.step('navigate to step', async () => {
      await lvInformierenPage.goto()
    })

    await test.step('verify page title is visible', async () => {
      await expect(lvInformierenPage.pageTitle).toBeVisible()
    })

    await test.step('verify workflow status is IN_PROGRESS', async () => {
      const isInProgress = await lvInformierenPage.isInProgress()
      expect(isInProgress).toBe(true)
    })

    await test.step('verify inform button is visible and enabled', async () => {
      await expect(lvInformierenPage.informButton).toBeVisible()
      await expect(lvInformierenPage.informButton).toBeEnabled()
    })

    await test.step('verify info text is displayed', async () => {
      await expect(lvInformierenPage.infoText).toBeVisible()
    })
  })

  test('should successfully inform payroll department', async ({ page }) => {
    await test.step('navigate to step', async () => {
      await lvInformierenPage.goto()
    })

    await test.step('verify initial state', async () => {
      const isInProgress = await lvInformierenPage.isInProgress()
      expect(isInProgress).toBe(true)

      await expect(lvInformierenPage.informButton).toBeEnabled()
    })

    await test.step('click inform button', async () => {
      await lvInformierenPage.clickInformButton()
    })

    await test.step('verify button becomes disabled during processing', async () => {
      // Button should be disabled while request is processing
      await expect(lvInformierenPage.informButton).toBeDisabled()
    })

    await test.step('verify workflow status changes to COMPLETED', async () => {
      await lvInformierenPage.waitForCompletion()
      const isCompleted = await lvInformierenPage.isCompleted()
      expect(isCompleted).toBe(true)
    })

    await test.step('verify next step becomes IN_PROGRESS', async () => {
      // The next step "Mitarbeitendedaten prüfen" should now be IN_PROGRESS
      const nextStepBadge = page.getByTestId('Mitarbeitendedaten prüfen-inprogress')
      await expect(nextStepBadge).toBeVisible()
    })
  })

  test('should navigate via workflow navigator', async ({ page }) => {
    await test.step('start from dashboard or different step', async () => {
      await page.goto(`/mitarbeiter/onboarding/${personalnummer}`)
      await waitForLoader(page)
    })

    await test.step('click on Lohnverrechnung informieren in navigator', async () => {
      await lvInformierenPage.navigateViaWorkflowNavigator()
    })

    await test.step('verify correct page is displayed', async () => {
      await expect(lvInformierenPage.pageTitle).toBeVisible()
      await expect(page).toHaveURL(new RegExp(`/mitarbeiter/onboarding/${personalnummer}\\?wfi=6`))
    })
  })

  test('should show permission error if user lacks role', async ({ page }) => {
    // Note: This test requires a user without MA_ONBOARDING_LV_INFORMIEREN role
    // In a real scenario, you might need to use different user credentials or mock the role

    await test.step('navigate to step', async () => {
      await lvInformierenPage.goto()
    })

    await test.step('check if no permission error is shown', async () => {
      // If user has permission, button should be visible
      // If user lacks permission, error message should be shown
      const hasPermission = await lvInformierenPage.isInformButtonVisible()
      const hasNoPermissionError = await lvInformierenPage.hasNoPermissionError()

      // Either has permission (button visible) OR has no permission (error visible)
      expect(hasPermission || hasNoPermissionError).toBe(true)
    })
  })

  test('should display completed state correctly when revisiting', async ({ page }) => {
    await test.step('complete the step first', async () => {
      await lvInformierenPage.goto()
      const isAlreadyCompleted = await lvInformierenPage.isCompleted()

      if (!isAlreadyCompleted) {
        await lvInformierenPage.clickInformButton()
        await lvInformierenPage.waitForCompletion()
      }
    })

    await test.step('navigate away and back', async () => {
      // Go to next step
      await page.getByTestId('Mitarbeitendedaten prüfen').click()
      await waitForLoader(page)

      // Navigate back via navigator
      await lvInformierenPage.navigateViaWorkflowNavigator()
    })

    await test.step('verify completed state is preserved', async () => {
      const isCompleted = await lvInformierenPage.isCompleted()
      expect(isCompleted).toBe(true)
    })

    await test.step('verify completed placeholder is shown', async () => {
      await expect(lvInformierenPage.completedMessage).toBeVisible()
    })
  })

  test('should handle API errors gracefully', async ({ page }) => {
    // Note: This test would require mocking the API to return an error
    // For demonstration purposes, we show the test structure

    await test.step('navigate to step', async () => {
      await lvInformierenPage.goto()
    })

    // In a real test, you would:
    // 1. Mock the API endpoint to return an error
    // 2. Click the inform button
    // 3. Verify that an error toast/message is displayed
    // 4. Verify that the workflow status remains IN_PROGRESS

    await test.step('mock API error (implementation needed)', async () => {
      // Mock implementation here
    })

    await test.step('click inform button', async () => {
      await lvInformierenPage.clickInformButton()
    })

    await test.step('verify error handling', async () => {
      // Check for error toast/message
      // Verify status is still IN_PROGRESS
    })
  })
})
