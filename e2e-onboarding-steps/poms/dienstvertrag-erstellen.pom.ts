import { Page, Locator } from '@playwright/test'
import { navigateToWorkflowStep } from '../test-utils'

/**
 * Page Object Model for Step 6 (wfi=8): Dienstvertrag erstellen (Create Employment Contract)
 *
 * This is an AUTOMATED step that creates the employment contract PDF.
 * There is no user interaction required - the step should automatically
 * transition from NEW to COMPLETED after the previous step is done.
 */
export class DienstvertragErstellenPage {
  readonly page: Page
  readonly personalnummer: string

  // Workflow navigator
  readonly workflowNavigatorItem: Locator
  readonly workflowNew: Locator
  readonly workflowCompleted: Locator
  readonly workflowError: Locator

  // Step placeholder (when viewing the step)
  readonly stepPlaceholder: Locator
  readonly completedIcon: Locator
  readonly completedText: Locator

  constructor(page: Page, personalnummer: string) {
    this.page = page
    this.personalnummer = personalnummer

    // Workflow navigator
    this.workflowNavigatorItem = page.getByTestId('Dienstvertrag erstellen')
    this.workflowNew = page.getByTestId('Dienstvertrag erstellen-new')
    this.workflowCompleted = page.getByTestId('Dienstvertrag erstellen-completed')
    this.workflowError = page.getByTestId('Dienstvertrag erstellen-error')

    // Step placeholder elements
    this.stepPlaceholder = page.locator('[data-testid*="step-placeholder"]')
    this.completedIcon = page.locator('svg.text-emerald-600')
    this.completedText = page.locator('text=erfolgreich abgeschlossen')
  }

  /**
   * Navigate to this workflow step (if needed for viewing)
   */
  async goto(): Promise<void> {
    await navigateToWorkflowStep(this.page, this.personalnummer, 8)
  }

  /**
   * Wait for the automated step to complete
   */
  async waitForAutomatedCompletion(timeout = 30000): Promise<void> {
    await this.workflowCompleted.waitFor({ state: 'visible', timeout })
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
   * Check if step is in NEW state
   */
  async isNew(): Promise<boolean> {
    try {
      return await this.workflowNew.isVisible({ timeout: 1000 })
    } catch {
      return false
    }
  }

  /**
   * Navigate using workflow navigator
   */
  async navigateViaWorkflowNavigator(): Promise<void> {
    await this.workflowNavigatorItem.click()
  }

  /**
   * Get the workflow status class (for visual verification)
   */
  async getWorkflowStatusClass(): Promise<string | null> {
    if (await this.isCompleted()) {
      return 'completed'
    } else if (await this.hasError()) {
      return 'error'
    } else if (await this.isNew()) {
      return 'new'
    }
    return null
  }
}
