import { Page, Locator } from '@playwright/test'
import { waitForLoader, navigateToWorkflowStep } from '../test-utils'

/**
 * Page Object Model for Step 7 (wfi=10): Unterschriftenlauf starten (Start Signature Workflow)
 *
 * This step allows users to preview the generated employment contract PDF
 * and send it to Moxis (external signature system) for employee signature.
 */
export class UnterschriftenlaufStartenPage {
  readonly page: Page
  readonly personalnummer: string

  // Page elements
  readonly pageTitle: Locator
  readonly previewTitle: Locator
  readonly pdfViewer: Locator
  readonly pdfContainer: Locator
  readonly loader: Locator
  readonly infoText: Locator
  readonly startButton: Locator

  // Workflow navigator
  readonly workflowNavigatorItem: Locator
  readonly workflowInProgress: Locator
  readonly workflowCompleted: Locator
  readonly workflowError: Locator

  constructor(page: Page, personalnummer: string) {
    this.page = page
    this.personalnummer = personalnummer

    // Page elements
    this.pageTitle = page.locator('h2', { hasText: 'Unterschriftenlauf starten' })
    this.previewTitle = page.locator('h3', { hasText: 'Vorschau' })
    this.pdfViewer = page.getByTestId('Unterschriftenlauf starten-PdfViewer')
    this.pdfContainer = page.locator('.pdf-viewer-container, [data-testid*="PdfViewer"]').first()
    this.loader = page.getByTestId('loader')
    this.infoText = page.getByTestId('unterschriftenlaufStarten-infoText')
    this.startButton = page.getByTestId('unterschriftenlaufStarten-button')

    // Workflow navigator
    this.workflowNavigatorItem = page.getByTestId('Unterschriftenlauf starten')
    this.workflowInProgress = page.getByTestId('Unterschriftenlauf starten-inprogress')
    this.workflowCompleted = page.getByTestId('Unterschriftenlauf starten-completed')
    this.workflowError = page.getByTestId('Unterschriftenlauf starten-error')
  }

  /**
   * Navigate to this workflow step
   */
  async goto(): Promise<void> {
    await navigateToWorkflowStep(this.page, this.personalnummer, 10)
  }

  /**
   * Wait for PDF to load
   */
  async waitForPdfToLoad(timeout = 30000): Promise<void> {
    // Wait for loader to disappear
    try {
      await this.loader.waitFor({ state: 'visible', timeout: 5000 })
      await this.loader.waitFor({ state: 'hidden', timeout })
    } catch {
      // Loader might not appear if PDF loads quickly
    }

    // Wait for PDF viewer to be visible
    await this.pdfViewer.waitFor({ state: 'visible', timeout })
  }

  /**
   * Check if PDF is loaded
   */
  async isPdfLoaded(): Promise<boolean> {
    try {
      return await this.pdfViewer.isVisible()
    } catch {
      return false
    }
  }

  /**
   * Check if info text is visible
   */
  async isInfoTextVisible(): Promise<boolean> {
    return await this.infoText.isVisible()
  }

  /**
   * Click the start button to send to Moxis
   */
  async clickStartButton(): Promise<void> {
    await this.startButton.click()
    await waitForLoader(this.page)
  }

  /**
   * Check if start button is visible
   */
  async isStartButtonVisible(): Promise<boolean> {
    return await this.startButton.isVisible()
  }

  /**
   * Check if start button is enabled
   */
  async isStartButtonEnabled(): Promise<boolean> {
    return await this.startButton.isEnabled()
  }

  /**
   * Preview PDF and start signature workflow
   */
  async previewAndStartSignature(): Promise<void> {
    await this.waitForPdfToLoad()
    await this.clickStartButton()
  }

  /**
   * Wait for completion
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
   * Navigate using workflow navigator
   */
  async navigateViaWorkflowNavigator(): Promise<void> {
    await this.workflowNavigatorItem.click()
    await waitForLoader(this.page)
  }
}
