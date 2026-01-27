import { expect, Locator, Page } from '@playwright/test'

import { URLMatcher } from '../test-utils'

/**
 * Page Object Model for the Teilnehmer Korrigieren (Search) Page
 * URL: /teilnehmer/korrigieren
 */
export class TeilnehmerKorrigierenSuchenPage {
  readonly page: Page
  readonly url = '/teilnehmer/korrigieren'

  // Main search input
  readonly identifiersStringInput: Locator

  // Filter toggle button
  readonly filterButton: Locator

  // Filter fields
  readonly projectNameSelect: Locator
  readonly seminarNameSelect: Locator
  readonly massnahmennummerSelect: Locator
  readonly isUebaTeilnehmerSelect: Locator
  readonly isActiveSelect: Locator
  readonly isAngemeldetSelect: Locator

  // Action buttons
  readonly resetButton: Locator
  readonly searchButton: Locator

  // Results table
  readonly teilnehmerTable: Locator
  readonly emptyResultsMessage: Locator

  // Page title
  readonly pageTitle: Locator

  constructor(page: Page) {
    this.page = page

    // Main search input
    this.identifiersStringInput = page.getByTestId('identifiersString')

    // Filter toggle button
    this.filterButton = page.getByTestId('tn-filter-button')

    // Filter fields
    this.projectNameSelect = page.getByTestId('projectName')
    this.seminarNameSelect = page.getByTestId('seminarName')
    this.massnahmennummerSelect = page.getByTestId('massnahmennummer')
    this.isUebaTeilnehmerSelect = page.getByTestId('isUebaTeilnehmer')
    this.isActiveSelect = page.getByTestId('isActive')
    this.isAngemeldetSelect = page.getByTestId('isAngemeldet')

    // Action buttons
    this.resetButton = page.getByTestId('tn-reset')
    this.searchButton = page.getByTestId('tn-search')

    // Results table
    this.teilnehmerTable = page.getByTestId('teilnehmer-table')
    this.emptyResultsMessage = page.locator('p', {
      hasText: 'Keine Teilnehmenden gefunden.',
    })

    // Page title
    this.pageTitle = page.locator('h1')
  }

  /**
   * Navigate to the Teilnehmer Korrigieren page
   */
  async goto() {
    await this.page.goto(this.url)
    await this.page.waitForURL(`**${this.url}**`)
  }

  /**
   * Verify page title is displayed correctly
   */
  async expectPageTitle(title: string = 'Teilnehmende korrigieren') {
    await expect(this.pageTitle).toContainText(title)
  }

  /**
   * Open filter panel
   */
  async openFilters() {
    await this.filterButton.click()
    await expect(this.projectNameSelect).toBeVisible()
  }

  /**
   * Check if filters are visible
   */
  async expectFiltersVisible() {
    await expect(this.projectNameSelect).toBeVisible()
    await expect(this.seminarNameSelect).toBeVisible()
    await expect(this.massnahmennummerSelect).toBeVisible()
    await expect(this.isUebaTeilnehmerSelect).toBeVisible()
    await expect(this.isActiveSelect).toBeVisible()
    await expect(this.isAngemeldetSelect).toBeVisible()
  }

  /**
   * Fill the main search input
   */
  async fillSearchInput(value: string) {
    await this.identifiersStringInput.fill(value)
  }

  /**
   * Select a project from the dropdown
   */
  async selectProject(projectName: string) {
    await this.projectNameSelect.fill(projectName)
    await this.page.getByTestId(`projectName-option-${projectName}`).click()
  }

  /**
   * Select a seminar from the dropdown
   */
  async selectSeminar(seminarName: string) {
    await this.seminarNameSelect.fill(seminarName)
    await this.page.getByTestId(`seminarName-option-${seminarName}`).click()
  }

  /**
   * Select a massnahmennummer from the dropdown
   */
  async selectMassnahmennummer(massnahmennummer: string) {
    await this.massnahmennummerSelect.fill(massnahmennummer)
    await this.page
      .getByTestId(`massnahmennummer-option-${massnahmennummer}`)
      .click()
  }

  /**
   * Select isUebaTeilnehmer option
   */
  async selectIsUebaTeilnehmer(value: 'true' | 'false') {
    await this.isUebaTeilnehmerSelect.selectOption(value)
  }

  /**
   * Select isActive option
   */
  async selectIsActive(value: 'true' | 'false') {
    await this.isActiveSelect.selectOption(value)
  }

  /**
   * Select isAngemeldet option
   */
  async selectIsAngemeldet(value: 'true' | 'false') {
    await this.isAngemeldetSelect.selectOption(value)
  }

  /**
   * Click the search button and wait for results
   */
  async search() {
    await this.searchButton.click()
  }

  /**
   * Click search and wait for table to be visible
   */
  async searchAndWaitForResults() {
    await this.searchButton.click()
    await this.teilnehmerTable.waitFor({ state: 'visible' })
  }

  /**
   * Click search and wait for empty results message
   */
  async searchAndWaitForEmptyResults() {
    await this.searchButton.click()
    await expect(this.emptyResultsMessage).toBeVisible()
  }

  /**
   * Reset the form
   */
  async resetForm() {
    await this.resetButton.click()
    await this.teilnehmerTable.waitFor({ state: 'hidden' })
    await expect(this.page).toHaveURL(this.url)
    await expect(this.teilnehmerTable).not.toBeVisible()
  }

  /**
   * Check if the results table is visible
   */
  async expectTableVisible() {
    await expect(this.teilnehmerTable).toBeVisible()
  }

  /**
   * Check if the results table is not visible
   */
  async expectTableNotVisible() {
    await expect(this.teilnehmerTable).not.toBeVisible()
  }

  /**
   * Check if empty results message is shown
   */
  async expectEmptyResults() {
    await expect(this.emptyResultsMessage).toBeVisible()
  }

  /**
   * Check if a teilnehmer is in the table by vorname and nachname
   */
  async expectTeilnehmerInTable(vorname: string, nachname: string) {
    await expect(
      this.page.locator('td', { hasText: vorname }).first()
    ).toBeVisible()
    await expect(
      this.page.locator('td', { hasText: nachname }).first()
    ).toBeVisible()
  }

  /**
   * Check if a row contains error text (red error column)
   */
  async expectRowHasError(identifier: string) {
    const row = this.page.locator('tr', { hasText: identifier })
    await expect(row.locator('.text-red-600')).toBeVisible()
  }

  /**
   * Get the edit link for a specific teilnehmer row
   */
  getEditLink(identifier: string): Locator {
    return this.page
      .locator('tr', { hasText: identifier })
      .getByTestId('teilnehmer-edit-link')
  }

  /**
   * Click edit link for a specific teilnehmer
   */
  async clickEditLink(identifier: string) {
    await this.getEditLink(identifier).click()
  }

  /**
   * Navigate to edit page for a specific teilnehmer and wait for navigation
   */
  async navigateToEditPage(identifier: string) {
    await this.clickEditLink(identifier)
    await this.page.waitForURL('**/teilnehmer/korrigieren/**')
  }

  /**
   * Verify URL matches expected pathname and search params
   */
  async expectURL(checks: {
    pathname?: string
    searchParams?: { [key: string]: string | undefined }
  }) {
    await expect(this.page).toHaveURL(
      URLMatcher({
        pathname: checks.pathname ?? this.url,
        searchParams: checks.searchParams,
      })
    )
  }

  /**
   * Get all visible row data from the table
   */
  async getTableRowCount(): Promise<number> {
    await this.teilnehmerTable.waitFor({ state: 'visible' })
    return await this.page.locator('tbody tr').count()
  }
}
