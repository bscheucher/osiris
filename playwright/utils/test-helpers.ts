import { Page, BrowserContext, expect } from '@playwright/test'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import fs from 'fs/promises'
import path from 'path'

import 'dayjs/locale/de'

// Extend dayjs with custom parse format
dayjs.extend(customParseFormat)

// Storage file paths
const STORAGE_DIR = path.join(__dirname, '../storage')
const PERSONALNUMMER_FILE = path.join(STORAGE_DIR, 'personalnummer.json')
const SESSION_FILE = path.join(STORAGE_DIR, 'session.json')

// Ensure storage directory exists
async function ensureStorageDir() {
  try {
    await fs.mkdir(STORAGE_DIR, { recursive: true })
  } catch (error) {
    // Directory already exists
  }
}

/**
 * Date handling utilities
 */
export class DateHelpers {
  /**
   * Calculate age from birthday string
   * @param birthday - Birthday in format YYYY-MM-DD, DD-MM-YYYY, or DD.MM.YYYY
   * @returns Age as string
   */
  static getAgeAsString(birthday: string): string {
    const parsedDate = dayjs(
      birthday,
      ['YYYY-MM-DD', 'DD-MM-YYYY', 'DD.MM.YYYY'],
      'de'
    )
    return Math.floor(dayjs().diff(parsedDate, 'year', true)).toString()
  }

  /**
   * Format date to DD.MM.YYYY format
   * @param date - Date object or string
   * @returns Formatted date string
   */
  static formatToDDMMYYYY(date: Date | string): string {
    return dayjs(date).format('DD.MM.YYYY')
  }

  /**
   * Get a random date between two dates
   * @param from - Start date
   * @param to - End date
   * @returns Formatted date string (DD.MM.YYYY)
   */
  static getRandomDateBetween(from: string, to: string): string {
    const start = dayjs(from).valueOf()
    const end = dayjs(to).valueOf()
    const random = Math.random() * (end - start) + start
    return dayjs(random).format('DD.MM.YYYY')
  }
}

/**
 * Personalnummer (Employee Number) storage utilities
 */
export class PersonalnummerStorage {
  /**
   * Save employee number to storage
   * @param personalnummer - Employee personnel number
   */
  static async save(personalnummer: string): Promise<void> {
    await ensureStorageDir()
    try {
      await fs.writeFile(
        PERSONALNUMMER_FILE,
        JSON.stringify({ personalnummer }, null, 2)
      )
    } catch (error) {
      console.error('Error writing to personalnummer.json file', error)
    }
  }

  /**
   * Load employee number from storage
   * @returns Employee personnel number or null if not found
   */
  static async load(): Promise<string | null> {
    try {
      const data = await fs.readFile(PERSONALNUMMER_FILE, 'utf-8')
      return JSON.parse(data).personalnummer
    } catch (error) {
      return null
    }
  }

  /**
   * Delete employee number from storage
   */
  static async delete(): Promise<void> {
    try {
      await fs.writeFile(PERSONALNUMMER_FILE, JSON.stringify({}, null, 2))
      console.log('personalnummer.json purged successfully.')
    } catch (error) {
      console.error('Error deleting personalnummer.json file:', error)
    }
  }
}

/**
 * Session storage utilities
 */
export interface SessionData {
  cookies: any[]
  localStorage?: { [key: string]: string }
}

export class SessionStorage {
  /**
   * Save session data (cookies, localStorage) to storage
   * @param context - Browser context
   */
  static async save(context: BrowserContext): Promise<void> {
    await ensureStorageDir()
    const cookies = await context.cookies()
    try {
      await fs.writeFile(SESSION_FILE, JSON.stringify({ cookies }, null, 2))
    } catch (error) {
      console.error('Error writing to session.json file', error)
    }
  }

  /**
   * Load session data from storage
   * @returns Session data or null if not found
   */
  static async load(): Promise<SessionData | null> {
    try {
      const data = await fs.readFile(SESSION_FILE, 'utf-8')
      return JSON.parse(data)
    } catch (error) {
      console.error('Error reading session.json file:', error)
      return null
    }
  }

  /**
   * Delete session data from storage
   */
  static async delete(): Promise<void> {
    try {
      await fs.writeFile(SESSION_FILE, JSON.stringify({}, null, 2))
      console.log('session.json deleted successfully.')
    } catch (error) {
      console.error('Error deleting session.json file:', error)
    }
  }
}

/**
 * Authentication helpers
 */
export class AuthHelpers {
  /**
   * Login to the application
   * @param page - Playwright page object
   */
  static async login(page: Page): Promise<void> {
    await page.goto('/login')

    const username = process.env.E2E_USER
    const password = process.env.E2E_PASSWORD

    if (!username || !password) {
      throw new Error(
        'E2E_USER or E2E_PASSWORD environment variables are not set'
      )
    }

    await page.fill('input[name="username"]', username)
    await page.fill('input[name="password"]', password)
    await page.click('button[type="submit"]')
    await page.waitForNavigation()
  }

  /**
   * Restore session from storage or login if no session exists
   * @param context - Browser context
   * @param page - Playwright page object
   */
  static async restoreSessionOrLogin(
    context: BrowserContext,
    page: Page
  ): Promise<void> {
    const sessionData = await SessionStorage.load()

    if (sessionData && sessionData.cookies.length > 0) {
      await context.addCookies(sessionData.cookies)
    } else {
      await AuthHelpers.login(page)
      await SessionStorage.save(context)
    }
  }
}

/**
 * URL validation helpers
 */
export interface URLSearchParamsCheck {
  [key: string]: string | undefined
}

export interface URLCheck {
  pathname?: string
  searchParams?: URLSearchParamsCheck
}

export class URLHelpers {
  /**
   * Create a URL matcher function for Playwright expectations
   * @param checks - URL checks to perform
   * @returns Matcher function
   */
  static createMatcher(checks: URLCheck): (url: URL) => boolean {
    return (url: URL) => {
      // Check pathname if provided
      if (checks.pathname !== undefined) {
        if (url.pathname !== checks.pathname) {
          return false
        }
      }

      // Check search parameters if provided
      if (checks.searchParams) {
        const params = url.searchParams

        for (const [key, expectedValue] of Object.entries(checks.searchParams)) {
          // If expectedValue is undefined, just check if the parameter exists
          if (expectedValue === undefined) {
            if (!params.has(key)) {
              return false
            }
          } else {
            // Check if parameter exists and has the expected value
            if (!params.has(key) || params.get(key) !== expectedValue) {
              return false
            }
          }
        }
      }

      return true
    }
  }

  /**
   * Assert that the page URL matches the expected checks
   * @param page - Playwright page object
   * @param checks - URL checks to perform
   */
  static async expectURL(page: Page, checks: URLCheck): Promise<void> {
    await expect(page).toHaveURL(URLHelpers.createMatcher(checks))
  }
}

/**
 * Wait helpers
 */
export class WaitHelpers {
  /**
   * Wait for loader to appear and disappear
   * @param page - Playwright page object
   * @param testId - Test ID of the loader element (default: 'loader')
   */
  static async waitForLoader(page: Page, testId: string = 'loader'): Promise<void> {
    await page
      .getByTestId(testId)
      .first()
      .waitFor({ state: 'visible', timeout: 20000 })
    await page
      .getByTestId(testId)
      .first()
      .waitFor({ state: 'hidden', timeout: 20000 })
  }

  /**
   * Wait for loader to disappear (if already visible or not visible)
   * @param page - Playwright page object
   * @param testId - Test ID of the loader element (default: 'loader')
   */
  static async waitForLoaderToDisappear(page: Page, testId: string = 'loader'): Promise<void> {
    await page
      .getByTestId(testId)
      .first()
      .waitFor({ state: 'hidden', timeout: 10000 })
  }

  /**
   * Wait for toast notification to appear
   * @param page - Playwright page object
   * @param timeout - Timeout in milliseconds (default: 3000)
   */
  static async waitForToast(page: Page, timeout: number = 3000): Promise<void> {
    await expect(page.locator('.toast-container').first()).toBeVisible({
      timeout,
    })
  }
}

/**
 * Form helpers
 */
export class FormHelpers {
  /**
   * Fill a combobox (combo-select component)
   * @param page - Playwright page object
   * @param testId - Test ID of the combobox
   * @param value - Value to select
   */
  static async fillCombobox(
    page: Page,
    testId: string,
    value: string
  ): Promise<void> {
    await page.getByTestId(testId).fill(value)
    await page.getByTestId(`${testId}-option-${value}`).click()
  }

  /**
   * Upload a file to a file input
   * @param page - Playwright page object
   * @param testId - Test ID of the file input
   * @param filePath - Path to the file
   * @param waitForToast - Whether to wait for toast notification (default: true)
   */
  static async uploadFile(
    page: Page,
    testId: string,
    filePath: string,
    waitForToast: boolean = true
  ): Promise<void> {
    await page.getByTestId(testId).setInputFiles(filePath)
    await page.getByTestId(`${testId}-upload-button`).click()

    if (waitForToast) {
      await WaitHelpers.waitForToast(page)
    }
  }

  /**
   * Fill a date field
   * @param page - Playwright page object
   * @param fieldId - ID of the date field
   * @param date - Date string in DD.MM.YYYY format
   */
  static async fillDate(
    page: Page,
    fieldId: string,
    date: string
  ): Promise<void> {
    await page.locator(`#${fieldId}`).click()
    await page.locator(`#${fieldId}`).fill(date)
  }
}

/**
 * Workflow helpers
 */
export class WorkflowHelpers {
  /**
   * Verify workflow item status badge
   * @param page - Playwright page object
   * @param itemName - Name of the workflow item
   * @param status - Expected status (completed, error, inprogress, new)
   * @param expectedClass - Expected CSS class pattern (default based on status)
   */
  static async verifyWorkflowStatus(
    page: Page,
    itemName: string,
    status: 'completed' | 'error' | 'inprogress' | 'new',
    expectedClass?: RegExp
  ): Promise<void> {
    const badge = page.getByTestId(`${itemName}-${status}`)
    await expect(badge).toBeVisible({ timeout: 10000 })

    if (expectedClass) {
      await expect(badge).toHaveClass(expectedClass)
    } else {
      // Default class patterns
      const classPatterns = {
        completed: /bg-green-600/,
        error: /bg-red-600/,
        inprogress: /bg-ibis-yellow/,
        new: /bg-gray-300/,
      }
      await expect(badge).toHaveClass(classPatterns[status])
    }
  }

  /**
   * Navigate to a specific workflow step
   * @param page - Playwright page object
   * @param personalnummer - Employee personnel number
   * @param wfi - Workflow item ID
   * @param employeeType - Employee type (mitarbeiter or teilnehmer, default: mitarbeiter)
   */
  static async navigateToStep(
    page: Page,
    personalnummer: string,
    wfi: number,
    employeeType: 'mitarbeiter' | 'teilnehmer' = 'mitarbeiter'
  ): Promise<void> {
    await page.goto(`/${employeeType}/onboarding/${personalnummer}?wfi=${wfi}`)
    await WaitHelpers.waitForLoaderToDisappear(page)
  }
}
