/* eslint-disable no-console */
import { Page } from '@playwright/test'

/**
 * Wait for loader to appear and disappear
 */
export async function waitForLoader(page: Page, timeout = 30000): Promise<void> {
  try {
    await page
      .getByTestId('loader')
      .first()
      .waitFor({ state: 'visible', timeout })
    await page
      .getByTestId('loader')
      .first()
      .waitFor({ state: 'hidden', timeout })
  } catch (error) {
    console.log('Loader not found or already hidden')
  }
}

/**
 * Navigate to a specific workflow step
 */
export async function navigateToWorkflowStep(
  page: Page,
  personalnummer: string,
  wfi: number
): Promise<void> {
  await page.goto(`/mitarbeiter/onboarding/${personalnummer}?wfi=${wfi}`)
  await waitForLoader(page)
}

/**
 * Click on workflow navigator item
 */
export async function clickWorkflowNavigatorItem(
  page: Page,
  stepName: string
): Promise<void> {
  await page.getByTestId(stepName).click()
  await waitForLoader(page)
}

/**
 * Wait for workflow step status badge
 */
export async function waitForWorkflowStatus(
  page: Page,
  stepName: string,
  status: 'inprogress' | 'completed' | 'error' | 'disabled'
): Promise<void> {
  const statusBadge = page.getByTestId(`${stepName}-${status}`)
  await statusBadge.waitFor({ state: 'visible', timeout: 30000 })
}

/**
 * Check if workflow step has specific status
 */
export async function hasWorkflowStatus(
  page: Page,
  stepName: string,
  status: 'inprogress' | 'completed' | 'error' | 'disabled'
): Promise<boolean> {
  const statusBadge = page.getByTestId(`${stepName}-${status}`)
  return await statusBadge.isVisible()
}

/**
 * Wait for success toast message
 */
export async function waitForSuccessToast(page: Page): Promise<void> {
  await page.waitForSelector('[role="status"]', { state: 'visible', timeout: 5000 })
}

/**
 * Wait for error toast message
 */
export async function waitForErrorToast(page: Page): Promise<void> {
  await page.waitForSelector('[role="alert"]', { state: 'visible', timeout: 5000 })
}

/**
 * Get personalnummer from URL
 */
export function getPersonalnummerFromUrl(url: string): string | null {
  const match = url.match(/\/mitarbeiter\/onboarding\/([^/?]+)/)
  return match ? match[1] : null
}

/**
 * Wait for API response
 */
export async function waitForApiResponse(
  page: Page,
  endpoint: string,
  timeout = 30000
): Promise<void> {
  await page.waitForResponse(
    (response) => response.url().includes(endpoint) && response.status() === 200,
    { timeout }
  )
}
