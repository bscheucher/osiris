import { Page, Locator, Download } from '@playwright/test'
import { waitForLoader, navigateToWorkflowStep } from '../test-utils'

/**
 * Page Object Model for Step 5 (wfi=7): Mitarbeiterdaten prüfen (Review Employee Data)
 *
 * This step allows users with MA_UEBERPRUEFEN role to review and accept/reject
 * uploaded documents (bankcard, e-card, work permit) and salary classification.
 */
export class MitarbeiterdatenPruefenPage {
  readonly page: Page
  readonly personalnummer: string

  // Page elements
  readonly pageTitle: Locator
  readonly submitButton: Locator

  // Bankcard section
  readonly bankcardDownloadButton: Locator
  readonly bankcardToggle: Locator
  readonly bankcardReasonInput: Locator
  readonly bankcardReasonLabel: Locator
  readonly bankcardReasonError: Locator

  // E-Card section
  readonly ecardDownloadButton: Locator
  readonly ecardToggle: Locator
  readonly ecardReasonInput: Locator
  readonly ecardReasonLabel: Locator
  readonly ecardReasonError: Locator

  // Arbeitsgenehmigung section
  readonly arbeitsgenehmigungNotRequired: Locator
  readonly arbeitsgenehmigungDownloadButton: Locator
  readonly arbeitsgenehmigungToggle: Locator
  readonly arbeitsgenehmigungReasonInput: Locator
  readonly arbeitsgenehmigungReasonLabel: Locator
  readonly arbeitsgenehmigungReasonError: Locator

  // Gehalt Einstufung section
  readonly gehaltEinstufungToggle: Locator
  readonly gehaltEinstufungReasonInput: Locator
  readonly gehaltEinstufungReasonLabel: Locator
  readonly gehaltEinstufungReasonError: Locator

  // Workflow navigator
  readonly workflowNavigatorItem: Locator
  readonly workflowInProgress: Locator
  readonly workflowCompleted: Locator
  readonly workflowError: Locator

  // Related workflow items that may go to error state
  readonly stammdatenError: Locator
  readonly vertragsdatenError: Locator

  constructor(page: Page, personalnummer: string) {
    this.page = page
    this.personalnummer = personalnummer

    // Page elements
    this.pageTitle = page.locator('h2', { hasText: 'Mitarbeitendedaten' })
    this.submitButton = page.getByTestId('ma-pruefen-submit-button')

    // Bankcard
    this.bankcardDownloadButton = page.getByTestId('bankcard-download-button')
    this.bankcardToggle = page.getByTestId('bankcard')
    this.bankcardReasonInput = page.getByTestId('bankcardReason')
    this.bankcardReasonLabel = page.getByTestId('bankcardReason-label')
    this.bankcardReasonError = page.getByTestId('bankcardReason-error')

    // E-Card
    this.ecardDownloadButton = page.getByTestId('ecard-download-button')
    this.ecardToggle = page.getByTestId('ecard')
    this.ecardReasonInput = page.getByTestId('ecardReason')
    this.ecardReasonLabel = page.getByTestId('ecardReason-label')
    this.ecardReasonError = page.getByTestId('ecardReason-error')

    // Arbeitsgenehmigung
    this.arbeitsgenehmigungNotRequired = page.getByTestId('arbeitsgenehmigungDok-not-required')
    this.arbeitsgenehmigungDownloadButton = page.getByTestId('arbeitsgenehmigungDok-download-button')
    this.arbeitsgenehmigungToggle = page.getByTestId('arbeitsgenehmigungDok')
    this.arbeitsgenehmigungReasonInput = page.getByTestId('arbeitsgenehmigungDokReason')
    this.arbeitsgenehmigungReasonLabel = page.getByTestId('arbeitsgenehmigungDokReason-label')
    this.arbeitsgenehmigungReasonError = page.getByTestId('arbeitsgenehmigungDokReason-error')

    // Gehalt Einstufung
    this.gehaltEinstufungToggle = page.getByTestId('gehaltEinstufung')
    this.gehaltEinstufungReasonInput = page.getByTestId('gehaltEinstufungReason')
    this.gehaltEinstufungReasonLabel = page.getByTestId('gehaltEinstufungReason-label')
    this.gehaltEinstufungReasonError = page.getByTestId('gehaltEinstufungReason-error')

    // Workflow navigator
    this.workflowNavigatorItem = page.getByTestId('Mitarbeitendedaten prüfen')
    this.workflowInProgress = page.getByTestId('Mitarbeitendedaten prüfen-inprogress')
    this.workflowCompleted = page.getByTestId('Mitarbeitendedaten prüfen-completed')
    this.workflowError = page.getByTestId('Mitarbeitendedaten prüfen-error')

    // Related workflow errors
    this.stammdatenError = page.getByTestId('Stammdaten erfassen-error')
    this.vertragsdatenError = page.getByTestId('Vertragsdaten erfassen-error')
  }

  /**
   * Navigate to this workflow step
   */
  async goto(): Promise<void> {
    await navigateToWorkflowStep(this.page, this.personalnummer, 7)
  }

  /**
   * Download bankcard
   */
  async downloadBankcard(): Promise<Download> {
    const downloadPromise = this.page.waitForEvent('download')
    await this.bankcardDownloadButton.click()
    return await downloadPromise
  }

  /**
   * Download e-card
   */
  async downloadEcard(): Promise<Download> {
    const downloadPromise = this.page.waitForEvent('download')
    await this.ecardDownloadButton.click()
    return await downloadPromise
  }

  /**
   * Download work permit
   */
  async downloadArbeitsgenehmigung(): Promise<Download> {
    const downloadPromise = this.page.waitForEvent('download')
    await this.arbeitsgenehmigungDownloadButton.click()
    return await downloadPromise
  }

  /**
   * Accept bankcard (toggle to true)
   */
  async acceptBankcard(): Promise<void> {
    await this.bankcardToggle.click({ force: true })
  }

  /**
   * Reject bankcard with reason
   */
  async rejectBankcard(reason: string): Promise<void> {
    const isChecked = await this.bankcardToggle.isChecked()
    if (isChecked) {
      await this.bankcardToggle.click({ force: true })
    }
    await this.bankcardReasonInput.fill(reason)
  }

  /**
   * Accept e-card (toggle to true)
   */
  async acceptEcard(): Promise<void> {
    await this.ecardToggle.click({ force: true })
  }

  /**
   * Reject e-card with reason
   */
  async rejectEcard(reason: string): Promise<void> {
    const isChecked = await this.ecardToggle.isChecked()
    if (isChecked) {
      await this.ecardToggle.click({ force: true })
    }
    await this.ecardReasonInput.fill(reason)
  }

  /**
   * Accept work permit (toggle to true)
   */
  async acceptArbeitsgenehmigung(): Promise<void> {
    await this.arbeitsgenehmigungToggle.click({ force: true })
  }

  /**
   * Reject work permit with reason
   */
  async rejectArbeitsgenehmigung(reason: string): Promise<void> {
    const isChecked = await this.arbeitsgenehmigungToggle.isChecked()
    if (isChecked) {
      await this.arbeitsgenehmigungToggle.click({ force: true })
    }
    await this.arbeitsgenehmigungReasonInput.fill(reason)
  }

  /**
   * Accept salary classification (toggle to true)
   */
  async acceptGehaltEinstufung(): Promise<void> {
    await this.gehaltEinstufungToggle.click({ force: true })
  }

  /**
   * Reject salary classification with reason
   */
  async rejectGehaltEinstufung(reason: string): Promise<void> {
    const isChecked = await this.gehaltEinstufungToggle.isChecked()
    if (isChecked) {
      await this.gehaltEinstufungToggle.click({ force: true })
    }
    await this.gehaltEinstufungReasonInput.fill(reason)
  }

  /**
   * Accept all documents and salary
   */
  async acceptAll(): Promise<void> {
    await this.acceptBankcard()
    await this.acceptEcard()

    // Only accept work permit if it's required
    const isArbeitsgenehmigungRequired = await this.arbeitsgenehmigungToggle.isVisible()
    if (isArbeitsgenehmigungRequired) {
      await this.acceptArbeitsgenehmigung()
    }

    await this.acceptGehaltEinstufung()
  }

  /**
   * Reject all documents and salary with reasons
   */
  async rejectAll(reasons: {
    bankcard: string
    ecard: string
    arbeitsgenehmigung?: string
    gehaltEinstufung: string
  }): Promise<void> {
    await this.rejectBankcard(reasons.bankcard)
    await this.rejectEcard(reasons.ecard)

    // Only reject work permit if it's required
    const isArbeitsgenehmigungRequired = await this.arbeitsgenehmigungToggle.isVisible()
    if (isArbeitsgenehmigungRequired && reasons.arbeitsgenehmigung) {
      await this.rejectArbeitsgenehmigung(reasons.arbeitsgenehmigung)
    }

    await this.rejectGehaltEinstufung(reasons.gehaltEinstufung)
  }

  /**
   * Submit the review form
   */
  async submit(): Promise<void> {
    await this.submitButton.click()
    await waitForLoader(this.page)
  }

  /**
   * Check if submit button is enabled
   */
  async isSubmitButtonEnabled(): Promise<boolean> {
    return await this.submitButton.isEnabled()
  }

  /**
   * Check if work permit is required
   */
  async isArbeitsgenehmigungRequired(): Promise<boolean> {
    return await this.arbeitsgenehmigungToggle.isVisible()
  }

  /**
   * Wait for completion
   */
  async waitForCompletion(): Promise<void> {
    await this.workflowCompleted.waitFor({ state: 'visible', timeout: 30000 })
  }

  /**
   * Wait for error state
   */
  async waitForError(): Promise<void> {
    await this.workflowError.waitFor({ state: 'visible', timeout: 30000 })
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
    return await this.workflowError.isVisible()
  }

  /**
   * Check if related steps have errors
   */
  async doRelatedStepsHaveErrors(): Promise<boolean> {
    const stammdatenHasError = await this.stammdatenError.isVisible()
    const vertragsdatenHasError = await this.vertragsdatenError.isVisible()
    return stammdatenHasError && vertragsdatenHasError
  }

  /**
   * Navigate using workflow navigator
   */
  async navigateViaWorkflowNavigator(): Promise<void> {
    await this.workflowNavigatorItem.click()
    await waitForLoader(this.page)
  }
}
