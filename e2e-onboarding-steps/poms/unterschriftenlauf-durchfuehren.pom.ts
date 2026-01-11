import { Page, Locator } from '@playwright/test'
import { waitForLoader, navigateToWorkflowStep } from '../test-utils'

/**
 * Page Object Model for Step 8 (wfi=11): Unterschriftenlauf durchführen (Execute Signature Workflow)
 *
 * This step shows the status of the external signature process via Moxis.
 * Users can see if the signature is in progress, completed, or has errors.
 * The signature process can also be cancelled if needed.
 *
 * Possible statuses:
 * - IN_PROGRESS: Signature is being processed by Moxis
 * - COMPLETED: Signature successfully completed
 * - ERROR: Various error states (SIGNATURE_DENIED, TIMEOUT, CANCELLED, ERROR)
 */
export class UnterschriftenlaufDurchfuehrenPage {
  readonly page: Page
  readonly personalnummer: string

  // Page elements
  readonly pageTitle: Locator
  readonly cancelButton: Locator

  // Status indicators
  readonly inProgressIcon: Locator
  readonly inProgressText: Locator
  readonly inProgressDescription: Locator

  readonly completedIcon: Locator
  readonly completedText: Locator

  readonly errorIcon: Locator
  readonly errorSection: Locator
  readonly errorText: Locator

  // Workflow navigator
  readonly workflowNavigatorItem: Locator
  readonly workflowInProgress: Locator
  readonly workflowCompleted: Locator
  readonly workflowError: Locator

  constructor(page: Page, personalnummer: string) {
    this.page = page
    this.personalnummer = personalnummer

    // Page elements
    this.pageTitle = page.locator('h2', { hasText: 'Unterschriftenlauf durchführen' })
    this.cancelButton = page.getByTestId('unterschriftenlaufDurchführen-cancel-button')

    // Status indicators
    this.inProgressIcon = page.locator('svg.text-ibis-yellow, svg.h-12.w-12.text-ibis-yellow')
    this.inProgressText = page.locator('text=in Arbeit')
    this.inProgressDescription = page.locator('text=Der Unterschriftenlauf wird durchgeführt')

    this.completedIcon = page.locator('svg.text-emerald-600, svg.h-12.w-12.text-emerald-600')
    this.completedText = page.locator('text=erfolgreich abgeschlossen')

    this.errorIcon = page.locator('svg.text-red-600, svg.h-12.w-12.text-red-600')
    this.errorSection = page.getByTestId('unterschriftenlauf-error-section')
    this.errorText = page.locator('[data-testid="unterschriftenlauf-error-section"] span')

    // Workflow navigator
    this.workflowNavigatorItem = page.getByTestId('Unterschriftenlauf durchführen')
    this.workflowInProgress = page.getByTestId('Unterschriftenlauf durchführen-inprogress')
    this.workflowCompleted = page.getByTestId('Unterschriftenlauf durchführen-completed')
    this.workflowError = page.getByTestId('Unterschriftenlauf durchführen-error')
  }

  /**
   * Navigate to this workflow step
   */
  async goto(): Promise<void> {
    await navigateToWorkflowStep(this.page, this.personalnummer, 11)
  }

  /**
   * Click cancel button to abort signature process
   */
  async clickCancelButton(): Promise<void> {
    await this.cancelButton.click()
    await waitForLoader(this.page)
  }

  /**
   * Check if cancel button is visible
   */
  async isCancelButtonVisible(): Promise<boolean> {
    return await this.cancelButton.isVisible()
  }

  /**
   * Check if cancel button is enabled
   */
  async isCancelButtonEnabled(): Promise<boolean> {
    return await this.cancelButton.isEnabled()
  }

  /**
   * Check if step is in progress
   */
  async isInProgress(): Promise<boolean> {
    return await this.workflowInProgress.isVisible()
  }

  /**
   * Check if step is completed
   */
  async isCompleted(): Promise<boolean> {
    return await this.workflowCompleted.isVisible()
  }

  /**
   * Check if step has error
   */
  async hasError(): Promise<boolean> {
    try {
      return await this.workflowError.isVisible({ timeout: 1000 })
    } catch {
      return false
    }
  }

  /**
   * Check if in progress icon is visible
   */
  async isInProgressIconVisible(): Promise<boolean> {
    try {
      return await this.inProgressIcon.isVisible({ timeout: 1000 })
    } catch {
      return false
    }
  }

  /**
   * Check if completed icon is visible
   */
  async isCompletedIconVisible(): Promise<boolean> {
    try {
      return await this.completedIcon.isVisible({ timeout: 1000 })
    } catch {
      return false
    }
  }

  /**
   * Check if error icon is visible
   */
  async isErrorIconVisible(): Promise<boolean> {
    try {
      return await this.errorIcon.isVisible({ timeout: 1000 })
    } catch {
      return false
    }
  }

  /**
   * Get error message text
   */
  async getErrorMessage(): Promise<string | null> {
    if (await this.errorSection.isVisible()) {
      return await this.errorText.first().textContent()
    }
    return null
  }

  /**
   * Wait for completion
   */
  async waitForCompletion(timeout = 60000): Promise<void> {
    await this.workflowCompleted.waitFor({ state: 'visible', timeout })
  }

  /**
   * Wait for error state
   */
  async waitForError(timeout = 30000): Promise<void> {
    await this.workflowError.waitFor({ state: 'visible', timeout })
  }

  /**
   * Poll for status change (useful for waiting for Moxis response)
   * Returns true if completed, false if error or timeout
   */
  async pollForStatusChange(
    maxWaitTime = 120000,
    pollInterval = 5000
  ): Promise<'completed' | 'error' | 'timeout'> {
    const startTime = Date.now()

    while (Date.now() - startTime < maxWaitTime) {
      // Refresh the page to get latest status
      await this.page.reload()
      await waitForLoader(this.page)

      if (await this.isCompleted()) {
        return 'completed'
      }

      if (await this.hasError()) {
        return 'error'
      }

      // Wait before next poll
      await this.page.waitForTimeout(pollInterval)
    }

    return 'timeout'
  }

  /**
   * Navigate using workflow navigator
   */
  async navigateViaWorkflowNavigator(): Promise<void> {
    await this.workflowNavigatorItem.click()
    await waitForLoader(this.page)
  }
}
