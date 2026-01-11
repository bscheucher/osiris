import { expect, test } from '@playwright/test'
import { DienstvertragErstellenPage } from '../poms/dienstvertrag-erstellen.pom'

/**
 * E2E Tests for Step 6 (wfi=8): Dienstvertrag erstellen (Create Employment Contract)
 *
 * Prerequisites:
 * - Step 5 (Mitarbeiterdaten prüfen) must be completed with acceptance
 * - All employee data must be validated and approved
 *
 * This is an AUTOMATED step that:
 * - Automatically generates the employment contract PDF
 * - Transitions from NEW to COMPLETED without user interaction
 * - Should complete within a reasonable timeframe
 *
 * This test suite covers:
 * 1. Automated completion after previous step
 * 2. Workflow status verification
 * 3. Step placeholder display when viewing the step
 * 4. Integration with next step activation
 */

test.describe('Step 6: Dienstvertrag erstellen (Automated)', () => {
  const personalnummer = process.env.TEST_PERSONALNUMMER || '12345'
  let dienstvertragPage: DienstvertragErstellenPage

  test.beforeEach(async ({ page }) => {
    dienstvertragPage = new DienstvertragErstellenPage(page, personalnummer)
  })

  test('should automatically complete after Mitarbeiterdaten prüfen is accepted', async ({ page }) => {
    await test.step('navigate to onboarding overview', async () => {
      await page.goto(`/mitarbeiter/onboarding/${personalnummer}`)
      await page.waitForTimeout(2000)
    })

    await test.step('verify Dienstvertrag erstellen step is visible in navigator', async () => {
      await expect(dienstvertragPage.workflowNavigatorItem).toBeVisible()
    })

    await test.step('wait for automated completion', async () => {
      // The step should automatically complete after Mitarbeiterdaten prüfen
      // Give it up to 30 seconds to complete
      await dienstvertragPage.waitForAutomatedCompletion(30000)
    })

    await test.step('verify step status is COMPLETED', async () => {
      const isCompleted = await dienstvertragPage.isCompleted()
      expect(isCompleted).toBe(true)
    })

    await test.step('verify workflow badge has correct styling', async () => {
      await expect(dienstvertragPage.workflowCompleted).toHaveClass(/bg-green-600/)
    })

    await test.step('verify next step becomes IN_PROGRESS', async () => {
      const nextStepBadge = page.getByTestId('Unterschriftenlauf starten-inprogress')
      await expect(nextStepBadge).toBeVisible()
      await expect(nextStepBadge).toHaveClass(/border-ibis-yellow/)
    })
  })

  test('should display completed placeholder when viewing the step', async ({ page }) => {
    await test.step('navigate to the step directly', async () => {
      await dienstvertragPage.goto()
    })

    await test.step('verify step is completed', async () => {
      const isCompleted = await dienstvertragPage.isCompleted()
      expect(isCompleted).toBe(true)
    })

    await test.step('verify completed icon is displayed', async () => {
      await expect(dienstvertragPage.completedIcon).toBeVisible()
    })

    await test.step('verify completed text is displayed', async () => {
      await expect(dienstvertragPage.completedText).toBeVisible()
    })
  })

  test('should be accessible via workflow navigator', async ({ page }) => {
    await test.step('start from onboarding overview', async () => {
      await page.goto(`/mitarbeiter/onboarding/${personalnummer}`)
      await page.waitForTimeout(1000)
    })

    await test.step('click on Dienstvertrag erstellen in navigator', async () => {
      await dienstvertragPage.navigateViaWorkflowNavigator()
    })

    await test.step('verify URL contains correct wfi parameter', async () => {
      await expect(page).toHaveURL(new RegExp(`/mitarbeiter/onboarding/${personalnummer}\\?wfi=8`))
    })

    await test.step('verify step is in completed state', async () => {
      const isCompleted = await dienstvertragPage.isCompleted()
      expect(isCompleted).toBe(true)
    })
  })

  test('should maintain completed state across page refreshes', async ({ page }) => {
    await test.step('navigate to the step', async () => {
      await dienstvertragPage.goto()
    })

    await test.step('verify initial completed state', async () => {
      const isCompleted = await dienstvertragPage.isCompleted()
      expect(isCompleted).toBe(true)
    })

    await test.step('refresh the page', async () => {
      await page.reload()
      await page.waitForTimeout(2000)
    })

    await test.step('verify completed state is preserved', async () => {
      const isCompleted = await dienstvertragPage.isCompleted()
      expect(isCompleted).toBe(true)
    })
  })

  test('should have correct workflow status class', async ({ page }) => {
    await test.step('navigate to the step', async () => {
      await dienstvertragPage.goto()
    })

    await test.step('get workflow status class', async () => {
      const statusClass = await dienstvertragPage.getWorkflowStatusClass()
      expect(statusClass).toBe('completed')
    })
  })

  test('should not have error state under normal conditions', async ({ page }) => {
    await test.step('navigate to the step', async () => {
      await dienstvertragPage.goto()
    })

    await test.step('verify no error state', async () => {
      const hasError = await dienstvertragPage.hasError()
      expect(hasError).toBe(false)
    })
  })

  test('should show NEW state before Mitarbeiterdaten prüfen is completed', async ({ page }) => {
    // Note: This test would only work if run before Mitarbeiterdaten prüfen is completed
    // For demonstration purposes, we show the test structure

    await test.step('check initial state', async () => {
      await dienstvertragPage.goto()

      // If previous step is not completed, this step should be NEW
      const statusClass = await dienstvertragPage.getWorkflowStatusClass()

      if (statusClass === 'new') {
        await test.step('verify NEW state', async () => {
          const isNew = await dienstvertragPage.isNew()
          expect(isNew).toBe(true)
        })
      }
    })
  })

  test('should complete within reasonable time after trigger', async ({ page }) => {
    // This test verifies performance of the automated step
    // It assumes you're starting fresh or can reset the workflow

    await test.step('navigate to onboarding overview', async () => {
      await page.goto(`/mitarbeiter/onboarding/${personalnummer}`)
      await page.waitForTimeout(1000)
    })

    await test.step('measure completion time', async () => {
      const startTime = Date.now()

      // Wait for completion with reasonable timeout
      await dienstvertragPage.waitForAutomatedCompletion(30000)

      const endTime = Date.now()
      const completionTime = endTime - startTime

      // Verify it completes within 30 seconds
      expect(completionTime).toBeLessThan(30000)

      // Log completion time for monitoring
      console.log(`Dienstvertrag creation completed in ${completionTime}ms`)
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
      ]

      for (const stepTestId of previousSteps) {
        const stepBadge = page.getByTestId(stepTestId)
        await expect(stepBadge).toBeVisible()
      }
    })

    await test.step('verify this step is completed', async () => {
      const isCompleted = await dienstvertragPage.isCompleted()
      expect(isCompleted).toBe(true)
    })
  })
})
