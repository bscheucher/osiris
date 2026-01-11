import { Page, Locator } from '@playwright/test'
import { waitForLoader, navigateToWorkflowStep } from '../test-utils'

/**
 * Page Object Model for Step 4 (wfi=6): Lohnverrechnung informieren (Inform Payroll)
 *
 * This step allows users with MA_ONBOARDING_LV_INFORMIEREN role to notify
 * the payroll department about a new employee.
 */
export class LohnverrechnungInformierenPage {
  readonly page: Page
  readonly personalnummer: string

  // Locators
  readonly pageTitle: Locator
  readonly infoText: Locator
  readonly informButton: Locator
  readonly noPermissionError: Locator
  readonly completedMessage: Locator

  // Workflow navigator items
  readonly workflowNavigatorItem: Locator
  readonly workflowInProgress: Locator
  readonly workflowCompleted: Locator

  constructor(page: Page, personalnummer: string) {
    this.page = page
    this.personalnummer = personalnummer

    // Page elements
    this.pageTitle = page.locator('h2', { hasText: 'Lohnverrechnung informieren' })
    this.infoText = page.getByTestId('info-section')
    this.informButton = page.getByTestId('lohnverrechnungInformieren-button')
    this.noPermissionError = page.getByTestId('error-section')
    this.completedMessage = page.locator('text=Schritt wurde erfolgreich abgeschlossen')

    // Workflow navigator
    this.workflowNavigatorItem = page.getByTestId('Lohnverrechnung informieren')
    this.workflowInProgress = page.getByTestId('Lohnverrechnung informieren-inprogress')
    this.workflowCompleted = page.getByTestId('Lohnverrechnung informieren-completed')
  }

  /**
   * Navigate to this workflow step
   */
  async goto(): Promise<void> {
    await navigateToWorkflowStep(this.page, this.personalnummer, 6)
  }

  /**
   * Click the "Lohnverrechnung informieren" button
   */
  async clickInformButton(): Promise<void> {
    await this.informButton.click()
    await waitForLoader(this.page)
  }

  /**
   * Check if the inform button is visible
   */
  async isInformButtonVisible(): Promise<boolean> {
    return await this.informButton.isVisible()
  }

  /**
   * Check if the inform button is enabled
   */
  async isInformButtonEnabled(): Promise<boolean> {
    return await this.informButton.isEnabled()
  }

  /**
   * Check if user has permission error
   */
  async hasNoPermissionError(): Promise<boolean> {
    return await this.noPermissionError.isVisible()
  }

  /**
   * Wait for step to be completed
   */
  async waitForCompletion(): Promise<void> {
    await this.workflowCompleted.waitFor({ state: 'visible', timeout: 30000 })
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
   * Navigate using workflow navigator
   */
  async navigateViaWorkflowNavigator(): Promise<void> {
    await this.workflowNavigatorItem.click()
    await waitForLoader(this.page)
  }
}
