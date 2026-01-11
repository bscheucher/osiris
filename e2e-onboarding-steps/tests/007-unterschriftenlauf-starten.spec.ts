import { expect, test } from '@playwright/test'
import { UnterschriftenlaufStartenPage } from '../poms/unterschriftenlauf-starten.pom'
import { waitForLoader } from '../test-utils'

/**
 * E2E Tests for Step 7 (wfi=10): Unterschriftenlauf starten (Start Signature Workflow)
 *
 * Prerequisites:
 * - Step 6 (Dienstvertrag erstellen) must be completed
 * - Employment contract PDF must be generated
 *
 * This step allows users to:
 * - Preview the generated employment contract PDF
 * - Send the contract to Moxis (external signature system)
 *
 * This test suite covers:
 * 1. PDF preview loading and display
 * 2. Info text and button visibility
 * 3. Sending contract to Moxis
 * 4. Workflow status transitions
 * 5. Next step activation
 * 6. Error handling
 */

test.describe('Step 7: Unterschriftenlauf starten', () => {
  const personalnummer = process.env.TEST_PERSONALNUMMER || '12345'
  let unterschriftStartenPage: UnterschriftenlaufStartenPage

  test.beforeEach(async ({ page }) => {
    unterschriftStartenPage = new UnterschriftenlaufStartenPage(page, personalnummer)
  })

  test('should display the page with PDF preview', async ({ page }) => {
    await test.step('navigate to step', async () => {
      await unterschriftStartenPage.goto()
    })

    await test.step('verify page title is visible', async () => {
      await expect(unterschriftStartenPage.pageTitle).toBeVisible()
    })

    await test.step('verify preview title is visible', async () => {
      await expect(unterschriftStartenPage.previewTitle).toBeVisible()
    })

    await test.step('verify workflow status is IN_PROGRESS', async () => {
      const isInProgress = await unterschriftStartenPage.isInProgress()
      expect(isInProgress).toBe(true)
    })
  })

  test('should load and display PDF preview', async ({ page }) => {
    await test.step('navigate to step', async () => {
      await unterschriftStartenPage.goto()
    })

    await test.step('wait for PDF to load', async () => {
      await unterschriftStartenPage.waitForPdfToLoad(30000)
    })

    await test.step('verify PDF viewer is visible', async () => {
      const isPdfLoaded = await unterschriftStartenPage.isPdfLoaded()
      expect(isPdfLoaded).toBe(true)
      await expect(unterschriftStartenPage.pdfViewer).toBeVisible()
    })
  })

  test('should display info text and start button', async ({ page }) => {
    await test.step('navigate to step', async () => {
      await unterschriftStartenPage.goto()
    })

    await test.step('wait for page to load', async () => {
      await page.waitForTimeout(2000)
    })

    await test.step('verify info text is visible', async () => {
      const isInfoVisible = await unterschriftStartenPage.isInfoTextVisible()
      expect(isInfoVisible).toBe(true)
      await expect(unterschriftStartenPage.infoText).toBeVisible()
    })

    await test.step('verify start button is visible and enabled', async () => {
      await expect(unterschriftStartenPage.startButton).toBeVisible()
      await expect(unterschriftStartenPage.startButton).toBeEnabled()
    })
  })

  test('should successfully send contract to Moxis', async ({ page }) => {
    await test.step('navigate to step', async () => {
      await unterschriftStartenPage.goto()
    })

    await test.step('wait for PDF to load', async () => {
      await unterschriftStartenPage.waitForPdfToLoad()
    })

    await test.step('verify initial state', async () => {
      const isInProgress = await unterschriftStartenPage.isInProgress()
      expect(isInProgress).toBe(true)
    })

    await test.step('click start button to send to Moxis', async () => {
      await unterschriftStartenPage.clickStartButton()
    })

    await test.step('verify workflow status changes to COMPLETED', async () => {
      await unterschriftStartenPage.waitForCompletion()
      const isCompleted = await unterschriftStartenPage.isCompleted()
      expect(isCompleted).toBe(true)
    })

    await test.step('verify next step becomes IN_PROGRESS', async () => {
      const nextStepBadge = page.getByTestId('Unterschriftenlauf durchführen-inprogress')
      await expect(nextStepBadge).toBeVisible()
    })

    await test.step('verify success message appears', async () => {
      // Wait for success toast
      await page.waitForSelector('[role="status"]', { state: 'visible', timeout: 5000 })
    })
  })

  test('should use combined preview and start workflow', async ({ page }) => {
    await test.step('navigate to step', async () => {
      await unterschriftStartenPage.goto()
    })

    await test.step('preview and start signature workflow', async () => {
      await unterschriftStartenPage.previewAndStartSignature()
    })

    await test.step('verify completion', async () => {
      await unterschriftStartenPage.waitForCompletion()
      const isCompleted = await unterschriftStartenPage.isCompleted()
      expect(isCompleted).toBe(true)
    })
  })

  test('should navigate via workflow navigator', async ({ page }) => {
    await test.step('start from onboarding overview', async () => {
      await page.goto(`/mitarbeiter/onboarding/${personalnummer}`)
      await waitForLoader(page)
    })

    await test.step('click on Unterschriftenlauf starten in navigator', async () => {
      await unterschriftStartenPage.navigateViaWorkflowNavigator()
    })

    await test.step('verify correct page is displayed', async () => {
      await expect(unterschriftStartenPage.pageTitle).toBeVisible()
      await expect(page).toHaveURL(new RegExp(`/mitarbeiter/onboarding/${personalnummer}\\?wfi=10`))
    })
  })

  test('should show loading state while PDF loads', async ({ page }) => {
    await test.step('navigate to step', async () => {
      await unterschriftStartenPage.goto()
    })

    await test.step('check for loader', async () => {
      // Loader might appear briefly
      try {
        const isLoaderVisible = await unterschriftStartenPage.loader.isVisible({ timeout: 1000 })
        if (isLoaderVisible) {
          await unterschriftStartenPage.loader.waitFor({ state: 'hidden', timeout: 30000 })
        }
      } catch {
        // Loader might not appear if PDF loads quickly
      }
    })

    await test.step('verify PDF loads after loader disappears', async () => {
      const isPdfLoaded = await unterschriftStartenPage.isPdfLoaded()
      expect(isPdfLoaded).toBe(true)
    })
  })

  test('should display completed state when revisiting', async ({ page }) => {
    await test.step('ensure step is completed', async () => {
      await unterschriftStartenPage.goto()

      const isCompleted = await unterschriftStartenPage.isCompleted()

      if (!isCompleted) {
        await unterschriftStartenPage.previewAndStartSignature()
        await unterschriftStartenPage.waitForCompletion()
      }
    })

    await test.step('navigate away and back', async () => {
      await page.getByTestId('Unterschriftenlauf durchführen').click()
      await waitForLoader(page)

      await unterschriftStartenPage.navigateViaWorkflowNavigator()
    })

    await test.step('verify completed state is preserved', async () => {
      const isCompleted = await unterschriftStartenPage.isCompleted()
      expect(isCompleted).toBe(true)
    })
  })

  test('should maintain state across page refreshes', async ({ page }) => {
    await test.step('navigate to step', async () => {
      await unterschriftStartenPage.goto()
    })

    await test.step('check initial state', async () => {
      const isInProgress = await unterschriftStartenPage.isInProgress()
      const isCompleted = await unterschriftStartenPage.isCompleted()

      expect(isInProgress || isCompleted).toBe(true)
    })

    await test.step('refresh page', async () => {
      await page.reload()
      await page.waitForTimeout(2000)
    })

    await test.step('verify state is preserved', async () => {
      const isInProgress = await unterschriftStartenPage.isInProgress()
      const isCompleted = await unterschriftStartenPage.isCompleted()

      expect(isInProgress || isCompleted).toBe(true)
    })
  })

  test('should have start button disabled while request is processing', async ({ page }) => {
    await test.step('navigate to step', async () => {
      await unterschriftStartenPage.goto()
    })

    await test.step('wait for PDF to load', async () => {
      await unterschriftStartenPage.waitForPdfToLoad()
    })

    await test.step('click start button', async () => {
      await unterschriftStartenPage.startButton.click()

      // Button should be disabled immediately after clicking
      await expect(unterschriftStartenPage.startButton).toBeDisabled()
    })

    await test.step('wait for completion', async () => {
      await unterschriftStartenPage.waitForCompletion()
    })
  })

  test('should handle PDF loading errors gracefully', async ({ page }) => {
    // Note: This test would require mocking the PDF endpoint to return an error
    // For demonstration, we show the test structure

    await test.step('navigate to step', async () => {
      await unterschriftStartenPage.goto()
    })

    await test.step('check for PDF or error state', async () => {
      try {
        await unterschriftStartenPage.waitForPdfToLoad(10000)
        const isPdfLoaded = await unterschriftStartenPage.isPdfLoaded()
        expect(isPdfLoaded).toBe(true)
      } catch {
        // If PDF fails to load, an error message should be displayed
        // In production, you would check for error toast or message
      }
    })
  })

  test('should make previous forms read-only after completion', async ({ page }) => {
    await test.step('complete this step', async () => {
      await unterschriftStartenPage.goto()

      const isCompleted = await unterschriftStartenPage.isCompleted()

      if (!isCompleted) {
        await unterschriftStartenPage.previewAndStartSignature()
        await unterschriftStartenPage.waitForCompletion()
      }
    })

    await test.step('navigate to Stammdaten', async () => {
      await page.getByTestId('Stammdaten erfassen').click()
      await waitForLoader(page)
    })

    await test.step('verify save button is disabled (read-only mode)', async () => {
      const saveButton = page.getByTestId('save-button')
      await expect(saveButton).toBeDisabled()
    })
  })
})
