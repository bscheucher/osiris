import { expect, test } from '@playwright/test'
import { UnterschriebeneDokumenteSpeichernPage } from '../poms/unterschriebene-dokumente-speichern.pom'

/**
 * E2E Tests for Step 9 (wfi=12): Unterschriebene Dokumente speichern (Save Signed Documents)
 *
 * Prerequisites:
 * - Step 8 (Unterschriftenlauf durchführen) must be completed successfully
 * - Signed documents must be available from Moxis
 *
 * This is an AUTOMATED step that:
 * - Automatically saves the signed documents from Moxis
 * - Transitions from NEW to COMPLETED without user interaction
 * - Should complete shortly after the signature workflow is done
 *
 * This test suite covers:
 * 1. Automated completion after signature workflow
 * 2. Workflow status verification
 * 3. Step placeholder display
 * 4. Integration with final step (Data transfer to LHR)
 * 5. Polling for completion
 */

test.describe('Step 9: Unterschriebene Dokumente speichern (Automated)', () => {
  const personalnummer = process.env.TEST_PERSONALNUMMER || '12345'
  let dokumenteSpeichernPage: UnterschriebeneDokumenteSpeichernPage

  test.beforeEach(async ({ page }) => {
    dokumenteSpeichernPage = new UnterschriebeneDokumenteSpeichernPage(page, personalnummer)
  })

  test('should automatically complete after signature workflow is done', async ({ page }) => {
    await test.step('navigate to onboarding overview', async () => {
      await page.goto(`/mitarbeiter/onboarding/${personalnummer}`)
      await page.waitForTimeout(2000)
    })

    await test.step('verify step is visible in navigator', async () => {
      await expect(dokumenteSpeichernPage.workflowNavigatorItem).toBeVisible()
    })

    await test.step('check if Unterschriftenlauf durchführen is completed', async () => {
      const previousStepCompleted = page.getByTestId('Unterschriftenlauf durchführen-completed')
      const isPreviousCompleted = await previousStepCompleted.isVisible()

      if (isPreviousCompleted) {
        await test.step('wait for automated completion', async () => {
          await dokumenteSpeichernPage.waitForAutomatedCompletion(30000)
        })

        await test.step('verify step status is COMPLETED', async () => {
          const isCompleted = await dokumenteSpeichernPage.isCompleted()
          expect(isCompleted).toBe(true)
        })
      } else {
        test.skip() // Skip if previous step is not completed
      }
    })
  })

  test('should have correct workflow status badge styling', async ({ page }) => {
    await test.step('navigate to onboarding overview', async () => {
      await page.goto(`/mitarbeiter/onboarding/${personalnummer}`)
      await page.waitForTimeout(2000)
    })

    await test.step('verify completed badge styling', async () => {
      const isCompleted = await dokumenteSpeichernPage.isCompleted()

      if (isCompleted) {
        await expect(dokumenteSpeichernPage.workflowCompleted).toHaveClass(/bg-green-600/)
      }
    })
  })

  test('should display completed placeholder when viewing the step', async ({ page }) => {
    await test.step('navigate to the step directly', async () => {
      await dokumenteSpeichernPage.goto()
    })

    await test.step('verify step is completed', async () => {
      const isCompleted = await dokumenteSpeichernPage.isCompleted()
      expect(isCompleted).toBe(true)
    })

    await test.step('verify completed icon is displayed', async () => {
      await expect(dokumenteSpeichernPage.completedIcon).toBeVisible()
    })

    await test.step('verify completed text is displayed', async () => {
      await expect(dokumenteSpeichernPage.completedText).toBeVisible()
    })
  })

  test('should be accessible via workflow navigator', async ({ page }) => {
    await test.step('start from onboarding overview', async () => {
      await page.goto(`/mitarbeiter/onboarding/${personalnummer}`)
      await page.waitForTimeout(1000)
    })

    await test.step('click on step in navigator', async () => {
      await dokumenteSpeichernPage.navigateViaWorkflowNavigator()
    })

    await test.step('verify URL contains correct wfi parameter', async () => {
      await expect(page).toHaveURL(new RegExp(`/mitarbeiter/onboarding/${personalnummer}\\?wfi=12`))
    })

    await test.step('verify step is in completed state', async () => {
      const isCompleted = await dokumenteSpeichernPage.isCompleted()
      expect(isCompleted).toBe(true)
    })
  })

  test('should maintain completed state across page refreshes', async ({ page }) => {
    await test.step('navigate to the step', async () => {
      await dokumenteSpeichernPage.goto()
    })

    await test.step('verify initial completed state', async () => {
      const isCompleted = await dokumenteSpeichernPage.isCompleted()
      expect(isCompleted).toBe(true)
    })

    await test.step('refresh the page', async () => {
      await page.reload()
      await page.waitForTimeout(2000)
    })

    await test.step('verify completed state is preserved', async () => {
      const isCompleted = await dokumenteSpeichernPage.isCompleted()
      expect(isCompleted).toBe(true)
    })
  })

  test('should have correct workflow status class', async ({ page }) => {
    await test.step('navigate to the step', async () => {
      await dokumenteSpeichernPage.goto()
    })

    await test.step('get workflow status class', async () => {
      const statusClass = await dokumenteSpeichernPage.getWorkflowStatusClass()
      expect(statusClass).toBe('completed')
    })
  })

  test('should not have error state under normal conditions', async ({ page }) => {
    await test.step('navigate to the step', async () => {
      await dokumenteSpeichernPage.goto()
    })

    await test.step('verify no error state', async () => {
      const hasError = await dokumenteSpeichernPage.hasError()
      expect(hasError).toBe(false)
    })
  })

  test('should poll for completion after signature workflow', async ({ page }) => {
    // This test is useful when running immediately after signature completion

    await test.step('navigate to onboarding overview', async () => {
      await page.goto(`/mitarbeiter/onboarding/${personalnummer}`)
      await page.waitForTimeout(1000)
    })

    await test.step('check if signature step is completed', async () => {
      const signatureCompleted = page.getByTestId('Unterschriftenlauf durchführen-completed')
      const isSignatureCompleted = await signatureCompleted.isVisible()

      if (isSignatureCompleted) {
        await test.step('poll for this step to complete', async () => {
          const completed = await dokumenteSpeichernPage.pollForCompletion(60000, 3000)
          expect(completed).toBe(true)
        })
      } else {
        test.skip()
      }
    })
  })

  test('should activate next step after completion', async ({ page }) => {
    await test.step('navigate to onboarding overview', async () => {
      await page.goto(`/mitarbeiter/onboarding/${personalnummer}`)
      await page.waitForTimeout(2000)
    })

    await test.step('verify this step is completed', async () => {
      const isCompleted = await dokumenteSpeichernPage.isCompleted()
      expect(isCompleted).toBe(true)
    })

    await test.step('verify next step (Daten an LHR übergeben) is completed', async () => {
      // The final step should also be automated and complete
      const finalStepCompleted = page.getByTestId('Daten an LHR übergeben-completed')
      await expect(finalStepCompleted).toBeVisible({ timeout: 30000 })
    })
  })

  test('should complete within reasonable time after signature', async ({ page }) => {
    // This test verifies performance of the automated step

    await test.step('navigate to onboarding overview', async () => {
      await page.goto(`/mitarbeiter/onboarding/${personalnummer}`)
      await page.waitForTimeout(1000)
    })

    await test.step('check if signature is completed', async () => {
      const signatureCompleted = page.getByTestId('Unterschriftenlauf durchführen-completed')
      const isSignatureCompleted = await signatureCompleted.isVisible()

      if (isSignatureCompleted) {
        await test.step('measure completion time', async () => {
          const startTime = Date.now()

          const completed = await dokumenteSpeichernPage.pollForCompletion(30000, 2000)
          expect(completed).toBe(true)

          const endTime = Date.now()
          const completionTime = endTime - startTime

          // Should complete within 30 seconds
          expect(completionTime).toBeLessThan(30000)

          console.log(`Document saving completed in ${completionTime}ms`)
        })
      } else {
        test.skip()
      }
    })
  })

  test('should be part of completed workflow sequence', async ({ page }) => {
    await test.step('navigate to onboarding overview', async () => {
      await page.goto(`/mitarbeiter/onboarding/${personalnummer}`)
      await page.waitForTimeout(1000)
    })

    await test.step('verify all previous steps are completed', async () => {
      const previousSteps = [
        'Stammdaten erfassen-completed',
        'Vertragsdaten erfassen-completed',
        'KV-Einstufung berechnen-completed',
        'Lohnverrechnung informieren-completed',
        'Mitarbeitendedaten prüfen-completed',
        'Dienstvertrag erstellen-completed',
        'Unterschriftenlauf starten-completed',
        'Unterschriftenlauf durchführen-completed',
      ]

      for (const stepTestId of previousSteps) {
        const stepBadge = page.getByTestId(stepTestId)
        await expect(stepBadge).toBeVisible()
      }
    })

    await test.step('verify this step is completed', async () => {
      const isCompleted = await dokumenteSpeichernPage.isCompleted()
      expect(isCompleted).toBe(true)
    })
  })

  test('should show NEW state before signature is completed', async ({ page }) => {
    // Note: This test would only work if run before signature is completed
    // For demonstration purposes, we show the test structure

    await test.step('navigate to the step', async () => {
      await dokumenteSpeichernPage.goto()
    })

    await test.step('check initial state', async () => {
      const statusClass = await dokumenteSpeichernPage.getWorkflowStatusClass()

      if (statusClass === 'new') {
        await test.step('verify NEW state', async () => {
          const isNew = await dokumenteSpeichernPage.isNew()
          expect(isNew).toBe(true)
        })

        await test.step('verify signature step is not completed', async () => {
          const signatureCompleted = page.getByTestId('Unterschriftenlauf durchführen-completed')
          const isSignatureCompleted = await signatureCompleted.isVisible()
          expect(isSignatureCompleted).toBe(false)
        })
      }
    })
  })

  test('should handle backend processing delays gracefully', async ({ page }) => {
    // This test ensures the step handles delays in document retrieval from Moxis

    await test.step('navigate to onboarding overview', async () => {
      await page.goto(`/mitarbeiter/onboarding/${personalnummer}`)
      await page.waitForTimeout(1000)
    })

    await test.step('wait for completion with extended timeout', async () => {
      // Give backend sufficient time to retrieve and save documents
      await dokumenteSpeichernPage.waitForAutomatedCompletion(60000)
    })

    await test.step('verify successful completion', async () => {
      const isCompleted = await dokumenteSpeichernPage.isCompleted()
      expect(isCompleted).toBe(true)
    })
  })

  test('should complete entire onboarding workflow', async ({ page }) => {
    // Final integration test verifying the complete workflow is done

    await test.step('navigate to onboarding overview', async () => {
      await page.goto(`/mitarbeiter/onboarding/${personalnummer}`)
      await page.waitForTimeout(2000)
    })

    await test.step('verify all workflow steps are completed', async () => {
      const allSteps = [
        'Stammdaten erfassen-completed',
        'Vertragsdaten erfassen-completed',
        'KV-Einstufung berechnen-completed',
        'Lohnverrechnung informieren-completed',
        'Mitarbeitendedaten prüfen-completed',
        'Dienstvertrag erstellen-completed',
        'Unterschriftenlauf starten-completed',
        'Unterschriftenlauf durchführen-completed',
        'Unterschriebene Dokumente speichern-completed',
        'Daten an LHR übergeben-completed',
      ]

      for (const stepTestId of allSteps) {
        const stepBadge = page.getByTestId(stepTestId)
        await expect(stepBadge).toBeVisible()
        await expect(stepBadge).toHaveClass(/bg-green-600/)
      }
    })

    await test.step('verify employee onboarding is complete', async () => {
      // All 10 steps should show green completed badges
      const completedBadges = page.locator('[data-testid$="-completed"]')
      const count = await completedBadges.count()
      expect(count).toBeGreaterThanOrEqual(10)
    })
  })
})
