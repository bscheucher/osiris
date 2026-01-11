import { expect, test } from '@playwright/test'
import { MitarbeiterdatenPruefenPage } from '../poms/mitarbeiterdaten-pruefen.pom'
import { waitForLoader } from '../test-utils'

/**
 * E2E Tests for Step 5 (wfi=7): Mitarbeiterdaten prüfen (Review Employee Data)
 *
 * Prerequisites:
 * - Step 4 (Lohnverrechnung informieren) must be completed
 * - User must have MA_UEBERPRUEFEN role
 * - Employee documents must be uploaded (bankcard, e-card, optionally work permit)
 *
 * This test suite covers:
 * 1. Form state and field visibility
 * 2. Document download functionality
 * 3. Accept/Reject toggles and reason fields
 * 4. Form validation
 * 5. Accepting all documents (happy path)
 * 6. Rejecting documents (error path)
 * 7. Workflow status transitions
 */

test.describe('Step 5: Mitarbeiterdaten prüfen', () => {
  const personalnummer = process.env.TEST_PERSONALNUMMER || '12345'
  let pruefenPage: MitarbeiterdatenPruefenPage

  test.beforeEach(async ({ page }) => {
    pruefenPage = new MitarbeiterdatenPruefenPage(page, personalnummer)
    await pruefenPage.goto()
    await page.waitForTimeout(2000) // Wait for form to fully load
  })

  test('should display all form elements correctly', async ({ page }) => {
    await test.step('verify page title', async () => {
      await expect(pruefenPage.pageTitle).toBeVisible()
    })

    await test.step('verify bankcard section', async () => {
      await expect(pruefenPage.bankcardDownloadButton).toBeVisible()
      await expect(pruefenPage.bankcardToggle).toBeEnabled()
      await expect(pruefenPage.bankcardToggle).not.toBeChecked()
      await expect(pruefenPage.bankcardReasonInput).toBeVisible()
      await expect(pruefenPage.bankcardReasonLabel).toHaveText('Bemerkung*')
    })

    await test.step('verify e-card section', async () => {
      await expect(pruefenPage.ecardDownloadButton).toBeVisible()
      await expect(pruefenPage.ecardToggle).toBeEnabled()
      await expect(pruefenPage.ecardToggle).not.toBeChecked()
      await expect(pruefenPage.ecardReasonInput).toBeVisible()
      await expect(pruefenPage.ecardReasonLabel).toHaveText('Bemerkung*')
    })

    await test.step('verify gehalt einstufung section', async () => {
      await expect(pruefenPage.gehaltEinstufungToggle).toBeEnabled()
      await expect(pruefenPage.gehaltEinstufungToggle).not.toBeChecked()
      await expect(pruefenPage.gehaltEinstufungReasonInput).toBeVisible()
      await expect(pruefenPage.gehaltEinstufungReasonLabel).toHaveText('Bemerkung*')
    })

    await test.step('verify submit button', async () => {
      await expect(pruefenPage.submitButton).toBeEnabled()
    })
  })

  test('should handle work permit section based on nationality', async ({ page }) => {
    const isArbeitsgenehmigungRequired = await pruefenPage.isArbeitsgenehmigungRequired()

    if (isArbeitsgenehmigungRequired) {
      await test.step('verify work permit section for non-EU nationality', async () => {
        await expect(pruefenPage.arbeitsgenehmigungDownloadButton).toBeVisible()
        await expect(pruefenPage.arbeitsgenehmigungToggle).toBeEnabled()
        await expect(pruefenPage.arbeitsgenehmigungReasonInput).toBeVisible()
      })
    } else {
      await test.step('verify "not required" message for EU nationality', async () => {
        await expect(pruefenPage.arbeitsgenehmigungNotRequired).toBeVisible()
        await expect(pruefenPage.arbeitsgenehmigungNotRequired).toContainText('Nicht erforderlich')
      })
    }
  })

  test('should download all uploaded documents', async ({ page }) => {
    await test.step('download bankcard', async () => {
      const download = await pruefenPage.downloadBankcard()
      expect(download.suggestedFilename()).toContain('BANKCARD')
    })

    await test.step('download e-card', async () => {
      const download = await pruefenPage.downloadEcard()
      expect(download.suggestedFilename()).toContain('ECARD')
    })

    if (await pruefenPage.isArbeitsgenehmigungRequired()) {
      await test.step('download work permit', async () => {
        const download = await pruefenPage.downloadArbeitsgenehmigung()
        expect(download.suggestedFilename()).toContain('ARBEITSGENEHMIGUNG')
      })
    }
  })

  test('should validate required reason fields when rejecting', async ({ page }) => {
    await test.step('click submit without making any selections', async () => {
      await pruefenPage.submit()
    })

    await test.step('verify validation errors appear', async () => {
      await expect(pruefenPage.bankcardReasonError).toContainText('Dieses Feld ist erforderlich')
      await expect(pruefenPage.ecardReasonError).toContainText('Dieses Feld ist erforderlich')
      await expect(pruefenPage.gehaltEinstufungReasonError).toContainText('Dieses Feld ist erforderlich')

      if (await pruefenPage.isArbeitsgenehmigungRequired()) {
        await expect(pruefenPage.arbeitsgenehmigungReasonError).toContainText('Dieses Feld ist erforderlich')
      }
    })
  })

  test('should toggle acceptance and disable reason field', async ({ page }) => {
    await test.step('accept bankcard', async () => {
      await pruefenPage.acceptBankcard()
      await expect(pruefenPage.bankcardToggle).toBeChecked()
      await expect(pruefenPage.bankcardReasonInput).toBeDisabled()
      await expect(pruefenPage.bankcardReasonInput).toHaveValue('')
    })

    await test.step('reject bankcard again', async () => {
      await pruefenPage.bankcardToggle.click({ force: true })
      await expect(pruefenPage.bankcardToggle).not.toBeChecked()
      await expect(pruefenPage.bankcardReasonInput).not.toBeDisabled()
    })

    await test.step('enter rejection reason', async () => {
      await pruefenPage.bankcardReasonInput.fill('Invalid bank card')
      await expect(pruefenPage.bankcardReasonInput).toHaveValue('Invalid bank card')
    })
  })

  test('should successfully accept all documents', async ({ page }) => {
    await test.step('accept all documents and salary classification', async () => {
      await pruefenPage.acceptAll()
    })

    await test.step('verify all toggles are checked', async () => {
      await expect(pruefenPage.bankcardToggle).toBeChecked()
      await expect(pruefenPage.ecardToggle).toBeChecked()
      await expect(pruefenPage.gehaltEinstufungToggle).toBeChecked()

      if (await pruefenPage.isArbeitsgenehmigungRequired()) {
        await expect(pruefenPage.arbeitsgenehmigungToggle).toBeChecked()
      }
    })

    await test.step('verify all reason fields are disabled and empty', async () => {
      await expect(pruefenPage.bankcardReasonInput).toBeDisabled()
      await expect(pruefenPage.ecardReasonInput).toBeDisabled()
      await expect(pruefenPage.gehaltEinstufungReasonInput).toBeDisabled()
    })

    await test.step('submit the form', async () => {
      await pruefenPage.submit()
    })

    await test.step('verify workflow transitions to completed', async () => {
      await pruefenPage.waitForCompletion()
      const isCompleted = await pruefenPage.isCompleted()
      expect(isCompleted).toBe(true)
    })

    await test.step('verify next step becomes completed (Dienstvertrag erstellen)', async () => {
      const dienstvertragCompleted = page.getByTestId('Dienstvertrag erstellen-completed')
      await expect(dienstvertragCompleted).toBeVisible()
    })

    await test.step('verify subsequent step becomes IN_PROGRESS', async () => {
      const unterschriftenlaufInProgress = page.getByTestId('Unterschriftenlauf starten-inprogress')
      await expect(unterschriftenlaufInProgress).toBeVisible()
    })
  })

  test('should reject all documents and set related steps to ERROR', async ({ page }) => {
    await test.step('reject all documents with reasons', async () => {
      const reasons = {
        bankcard: 'Invalid bank card',
        ecard: 'E-Card expired',
        arbeitsgenehmigung: 'Work permit not valid',
        gehaltEinstufung: 'Salary classification incorrect',
      }
      await pruefenPage.rejectAll(reasons)
    })

    await test.step('verify all reason fields have values', async () => {
      await expect(pruefenPage.bankcardReasonInput).toHaveValue('Invalid bank card')
      await expect(pruefenPage.ecardReasonInput).toHaveValue('E-Card expired')
      await expect(pruefenPage.gehaltEinstufungReasonInput).toHaveValue('Salary classification incorrect')
    })

    await test.step('submit the form', async () => {
      await pruefenPage.submit()
    })

    await test.step('verify current step goes to ERROR', async () => {
      await pruefenPage.waitForError()
      const hasError = await pruefenPage.hasError()
      expect(hasError).toBe(true)
    })

    await test.step('verify related steps go to ERROR', async () => {
      const relatedStepsHaveErrors = await pruefenPage.doRelatedStepsHaveErrors()
      expect(relatedStepsHaveErrors).toBe(true)

      await expect(pruefenPage.stammdatenError).toBeVisible()
      await expect(pruefenPage.stammdatenError).toHaveClass(/bg-red-600/)

      await expect(pruefenPage.vertragsdatenError).toBeVisible()
      await expect(pruefenPage.vertragsdatenError).toHaveClass(/bg-red-600/)
    })
  })

  test('should fix errors and re-complete the workflow', async ({ page }) => {
    // This test assumes the previous test has run and created error states
    await test.step('navigate to Stammdaten via navigator', async () => {
      await page.getByTestId('Stammdaten erfassen').click()
      await waitForLoader(page)
    })

    await test.step('re-save Stammdaten to clear error', async () => {
      await page.waitForTimeout(1000)
      const saveButton = page.getByTestId('save-button')
      await saveButton.click()
      await waitForLoader(page)

      const stammdatenCompleted = page.getByTestId('Stammdaten erfassen-completed')
      await expect(stammdatenCompleted).toBeVisible()
    })

    await test.step('navigate to Vertragsdaten via navigator', async () => {
      await page.getByTestId('Vertragsdaten erfassen').click()
      await waitForLoader(page)
    })

    await test.step('re-save Vertragsdaten to clear error', async () => {
      await page.waitForTimeout(1000)
      const saveButton = page.getByTestId('save-button').first()
      await saveButton.click()
      await waitForLoader(page)

      const vertragsdatenCompleted = page.getByTestId('Vertragsdaten erfassen-completed')
      await expect(vertragsdatenCompleted).toBeVisible()
    })

    await test.step('navigate back to Mitarbeiterdaten prüfen', async () => {
      await pruefenPage.navigateViaWorkflowNavigator()
    })

    await test.step('accept all documents this time', async () => {
      await pruefenPage.acceptAll()
      await pruefenPage.submit()
    })

    await test.step('verify successful completion', async () => {
      await pruefenPage.waitForCompletion()
      const isCompleted = await pruefenPage.isCompleted()
      expect(isCompleted).toBe(true)
    })
  })

  test('should handle read-only mode after signature workflow starts', async ({ page }) => {
    // Note: This test requires that Unterschriftenlauf starten has been completed
    // For demonstration, we show the test structure

    await test.step('check if form is in read-only mode', async () => {
      const isSubmitButtonEnabled = await pruefenPage.isSubmitButtonEnabled()

      // If Unterschriftenlauf starten is completed, form should be read-only
      // All toggles and inputs should be disabled
      if (!isSubmitButtonEnabled) {
        await expect(pruefenPage.bankcardToggle).toBeDisabled()
        await expect(pruefenPage.ecardToggle).toBeDisabled()
        await expect(pruefenPage.gehaltEinstufungToggle).toBeDisabled()
      }
    })
  })
})
