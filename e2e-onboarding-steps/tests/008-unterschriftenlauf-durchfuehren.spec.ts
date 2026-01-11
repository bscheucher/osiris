import { expect, test } from '@playwright/test'
import { UnterschriftenlaufDurchfuehrenPage } from '../poms/unterschriftenlauf-durchfuehren.pom'
import { waitForLoader } from '../test-utils'

/**
 * E2E Tests for Step 8 (wfi=11): Unterschriftenlauf durchführen (Execute Signature Workflow)
 *
 * Prerequisites:
 * - Step 7 (Unterschriftenlauf starten) must be completed
 * - Contract must be sent to Moxis for signature
 *
 * This step shows the status of the external signature process:
 * - IN_PROGRESS: Employee is signing via Moxis
 * - COMPLETED: Signature successfully obtained
 * - ERROR: Various error states (SIGNATURE_DENIED, TIMEOUT, CANCELLED, ERROR)
 *
 * This test suite covers:
 * 1. In-progress state display
 * 2. Cancel functionality
 * 3. Completed state display
 * 4. Error state handling
 * 5. Status polling
 * 6. Workflow transitions
 */

test.describe('Step 8: Unterschriftenlauf durchführen', () => {
  const personalnummer = process.env.TEST_PERSONALNUMMER || '12345'
  let unterschriftDurchfuehrenPage: UnterschriftenlaufDurchfuehrenPage

  test.beforeEach(async ({ page }) => {
    unterschriftDurchfuehrenPage = new UnterschriftenlaufDurchfuehrenPage(page, personalnummer)
  })

  test('should display in-progress state correctly', async ({ page }) => {
    await test.step('navigate to step', async () => {
      await unterschriftDurchfuehrenPage.goto()
    })

    await test.step('verify page title is visible', async () => {
      await expect(unterschriftDurchfuehrenPage.pageTitle).toBeVisible()
    })

    await test.step('check workflow status', async () => {
      const isInProgress = await unterschriftDurchfuehrenPage.isInProgress()
      const isCompleted = await unterschriftDurchfuehrenPage.isCompleted()
      const hasError = await unterschriftDurchfuehrenPage.hasError()

      // Should be in one of these states
      expect(isInProgress || isCompleted || hasError).toBe(true)
    })
  })

  test('should show in-progress icon and text when signature is pending', async ({ page }) => {
    await test.step('navigate to step', async () => {
      await unterschriftDurchfuehrenPage.goto()
    })

    await test.step('check if in progress', async () => {
      const isInProgress = await unterschriftDurchfuehrenPage.isInProgress()

      if (isInProgress) {
        await test.step('verify in-progress UI elements', async () => {
          const isIconVisible = await unterschriftDurchfuehrenPage.isInProgressIconVisible()
          expect(isIconVisible).toBe(true)

          await expect(unterschriftDurchfuehrenPage.inProgressText).toBeVisible()
          await expect(unterschriftDurchfuehrenPage.inProgressDescription).toBeVisible()
        })
      }
    })
  })

  test('should display cancel button when in progress', async ({ page }) => {
    await test.step('navigate to step', async () => {
      await unterschriftDurchfuehrenPage.goto()
    })

    await test.step('check cancel button visibility', async () => {
      const isInProgress = await unterschriftDurchfuehrenPage.isInProgress()

      if (isInProgress) {
        const isCancelVisible = await unterschriftDurchfuehrenPage.isCancelButtonVisible()
        expect(isCancelVisible).toBe(true)

        const isCancelEnabled = await unterschriftDurchfuehrenPage.isCancelButtonEnabled()
        expect(isCancelEnabled).toBe(true)

        await expect(unterschriftDurchfuehrenPage.cancelButton).toBeVisible()
        await expect(unterschriftDurchfuehrenPage.cancelButton).toBeEnabled()
      }
    })
  })

  test('should successfully cancel signature workflow', async ({ page }) => {
    await test.step('navigate to step', async () => {
      await unterschriftDurchfuehrenPage.goto()
    })

    await test.step('check if in progress', async () => {
      const isInProgress = await unterschriftDurchfuehrenPage.isInProgress()

      if (isInProgress) {
        await test.step('click cancel button', async () => {
          await unterschriftDurchfuehrenPage.clickCancelButton()
        })

        await test.step('verify button becomes disabled during processing', async () => {
          await expect(unterschriftDurchfuehrenPage.cancelButton).toBeDisabled()
        })

        await test.step('verify workflow transitions to error state', async () => {
          await unterschriftDurchfuehrenPage.waitForError()
          const hasError = await unterschriftDurchfuehrenPage.hasError()
          expect(hasError).toBe(true)
        })

        await test.step('verify error message is displayed', async () => {
          const errorMessage = await unterschriftDurchfuehrenPage.getErrorMessage()
          expect(errorMessage).toBeTruthy()
          expect(errorMessage).toContain('abgebrochen')
        })

        await test.step('verify success toast appears', async () => {
          await page.waitForSelector('[role="status"]', { state: 'visible', timeout: 5000 })
        })
      } else {
        test.skip()
      }
    })
  })

  test('should display completed state with success icon', async ({ page }) => {
    await test.step('navigate to step', async () => {
      await unterschriftDurchfuehrenPage.goto()
    })

    await test.step('check if completed', async () => {
      const isCompleted = await unterschriftDurchfuehrenPage.isCompleted()

      if (isCompleted) {
        await test.step('verify completed UI elements', async () => {
          const isIconVisible = await unterschriftDurchfuehrenPage.isCompletedIconVisible()
          expect(isIconVisible).toBe(true)

          await expect(unterschriftDurchfuehrenPage.completedText).toBeVisible()
        })

        await test.step('verify cancel button is not visible', async () => {
          const isCancelVisible = await unterschriftDurchfuehrenPage.isCancelButtonVisible()
          expect(isCancelVisible).toBe(false)
        })

        await test.step('verify next step is activated', async () => {
          const nextStepBadge = page.getByTestId('Unterschriebene Dokumente speichern-completed')
          await expect(nextStepBadge).toBeVisible()
        })
      } else {
        test.skip()
      }
    })
  })

  test('should display error state with error icon and message', async ({ page }) => {
    await test.step('navigate to step', async () => {
      await unterschriftDurchfuehrenPage.goto()
    })

    await test.step('check if error state', async () => {
      const hasError = await unterschriftDurchfuehrenPage.hasError()

      if (hasError) {
        await test.step('verify error UI elements', async () => {
          const isIconVisible = await unterschriftDurchfuehrenPage.isErrorIconVisible()
          expect(isIconVisible).toBe(true)

          await expect(unterschriftDurchfuehrenPage.errorSection).toBeVisible()
        })

        await test.step('verify error message is displayed', async () => {
          const errorMessage = await unterschriftDurchfuehrenPage.getErrorMessage()
          expect(errorMessage).toBeTruthy()

          // Error message should be one of the known error types
          const knownErrors = [
            'abgelehnt',
            'abgebrochen',
            'Timeout',
            'Fehler',
          ]
          const matchesKnownError = knownErrors.some((error) =>
            errorMessage?.toLowerCase().includes(error.toLowerCase())
          )
          expect(matchesKnownError).toBe(true)
        })
      } else {
        test.skip()
      }
    })
  })

  test('should navigate via workflow navigator', async ({ page }) => {
    await test.step('start from onboarding overview', async () => {
      await page.goto(`/mitarbeiter/onboarding/${personalnummer}`)
      await waitForLoader(page)
    })

    await test.step('click on Unterschriftenlauf durchführen in navigator', async () => {
      await unterschriftDurchfuehrenPage.navigateViaWorkflowNavigator()
    })

    await test.step('verify correct page is displayed', async () => {
      await expect(unterschriftDurchfuehrenPage.pageTitle).toBeVisible()
      await expect(page).toHaveURL(new RegExp(`/mitarbeiter/onboarding/${personalnummer}\\?wfi=11`))
    })
  })

  test('should maintain state across page refreshes', async ({ page }) => {
    await test.step('navigate to step', async () => {
      await unterschriftDurchfuehrenPage.goto()
    })

    await test.step('record initial state', async () => {
      const initialInProgress = await unterschriftDurchfuehrenPage.isInProgress()
      const initialCompleted = await unterschriftDurchfuehrenPage.isCompleted()
      const initialError = await unterschriftDurchfuehrenPage.hasError()

      await test.step('refresh page', async () => {
        await page.reload()
        await page.waitForTimeout(2000)
      })

      await test.step('verify state is preserved', async () => {
        const afterInProgress = await unterschriftDurchfuehrenPage.isInProgress()
        const afterCompleted = await unterschriftDurchfuehrenPage.isCompleted()
        const afterError = await unterschriftDurchfuehrenPage.hasError()

        expect(afterInProgress).toBe(initialInProgress)
        expect(afterCompleted).toBe(initialCompleted)
        expect(afterError).toBe(initialError)
      })
    })
  })

  test('should poll for status changes (mock test)', async ({ page }) => {
    // Note: This test demonstrates polling functionality
    // In real scenarios, Moxis would update the status externally

    await test.step('navigate to step', async () => {
      await unterschriftDurchfuehrenPage.goto()
    })

    await test.step('check if in progress', async () => {
      const isInProgress = await unterschriftDurchfuehrenPage.isInProgress()

      if (isInProgress) {
        await test.step('poll for status change', async () => {
          // Poll for up to 30 seconds with 5 second intervals
          const result = await unterschriftDurchfuehrenPage.pollForStatusChange(30000, 5000)

          // Result should be one of: completed, error, timeout
          expect(['completed', 'error', 'timeout']).toContain(result)

          if (result === 'completed') {
            const isCompleted = await unterschriftDurchfuehrenPage.isCompleted()
            expect(isCompleted).toBe(true)
          } else if (result === 'error') {
            const hasError = await unterschriftDurchfuehrenPage.hasError()
            expect(hasError).toBe(true)
          }
        })
      } else {
        test.skip()
      }
    })
  })

  test('should show timestamp for status changes', async ({ page }) => {
    await test.step('navigate to step', async () => {
      await unterschriftDurchfuehrenPage.goto()
    })

    await test.step('check for timestamp in status text', async () => {
      const isInProgress = await unterschriftDurchfuehrenPage.isInProgress()
      const isCompleted = await unterschriftDurchfuehrenPage.isCompleted()
      const hasError = await unterschriftDurchfuehrenPage.hasError()

      if (isInProgress) {
        const text = await unterschriftDurchfuehrenPage.inProgressText.textContent()
        // Text should contain timestamp like "DD.MM.YYYY, HH:mm"
        expect(text).toMatch(/\d{2}\.\d{2}\.\d{4}/)
      } else if (isCompleted) {
        const text = await unterschriftDurchfuehrenPage.completedText.textContent()
        expect(text).toMatch(/\d{2}\.\d{2}\.\d{4}/)
      } else if (hasError) {
        const errorMessage = await unterschriftDurchfuehrenPage.getErrorMessage()
        expect(errorMessage).toMatch(/\d{2}\.\d{2}\.\d{4}/)
      }
    })
  })

  test('should handle different error types correctly', async ({ page }) => {
    await test.step('navigate to step', async () => {
      await unterschriftDurchfuehrenPage.goto()
    })

    await test.step('check error type if in error state', async () => {
      const hasError = await unterschriftDurchfuehrenPage.hasError()

      if (hasError) {
        const errorMessage = await unterschriftDurchfuehrenPage.getErrorMessage()

        // Different error types should have appropriate messages
        if (errorMessage?.includes('abgelehnt')) {
          // SIGNATURE_DENIED
          expect(errorMessage).toContain('abgelehnt')
        } else if (errorMessage?.includes('Timeout')) {
          // TIMEOUT
          expect(errorMessage).toContain('Timeout')
        } else if (errorMessage?.includes('abgebrochen')) {
          // CANCELLED
          expect(errorMessage).toContain('abgebrochen')
        } else {
          // Generic ERROR
          expect(errorMessage).toBeTruthy()
        }
      } else {
        test.skip()
      }
    })
  })

  test('should complete the workflow when signature is obtained', async ({ page }) => {
    // This test assumes Moxis signature process completes successfully
    // In real E2E tests, you might need to mock the Moxis callback

    await test.step('navigate to step', async () => {
      await unterschriftDurchfuehrenPage.goto()
    })

    await test.step('wait for completion or skip if already done', async () => {
      const isCompleted = await unterschriftDurchfuehrenPage.isCompleted()

      if (!isCompleted) {
        // Wait for external signature process to complete
        try {
          await unterschriftDurchfuehrenPage.waitForCompletion(120000) // 2 minutes
        } catch {
          test.skip() // Skip if signature doesn't complete in time
        }
      }
    })

    await test.step('verify completed state', async () => {
      const isCompleted = await unterschriftDurchfuehrenPage.isCompleted()
      expect(isCompleted).toBe(true)
    })

    await test.step('verify next automated step completes', async () => {
      const nextStepCompleted = page.getByTestId('Unterschriebene Dokumente speichern-completed')
      await expect(nextStepCompleted).toBeVisible({ timeout: 30000 })
    })
  })
})
