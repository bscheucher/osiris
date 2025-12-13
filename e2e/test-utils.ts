/* eslint-disable no-console */
import {
  expect,
  test as base,
  type Page,
  type BrowserContext,
} from '@playwright/test'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import fs from 'fs/promises'
import path from 'path'

import 'dayjs/locale/de'

// Date handling

dayjs.extend(customParseFormat)

export const getAgeAsString = (birthday: string) => {
  const parsedDate = dayjs(
    birthday,
    ['YYYY-MM-DD', 'DD-MM-YYYY', 'DD.MM.YYYY'],
    'de'
  )
  return Math.floor(dayjs().diff(parsedDate, 'year', true)).toString()
}

// Personalnummer handling
const personalnummerFile = path.join(__dirname, 'storage/personalnummer.json')

export async function savePersonalnummer(
  personalnummer: string
): Promise<void> {
  try {
    await fs.writeFile(personalnummerFile, JSON.stringify({ personalnummer }))
  } catch (error) {
    console.error('Error writing to personalnummer.json file', error)
  }
}

export async function loadPersonalnummer(): Promise<string | null> {
  try {
    const data = await fs.readFile(personalnummerFile, 'utf-8')
    return JSON.parse(data).personalnummer
  } catch (error) {
    return null
  }
}

export async function deletePersonalnummer(): Promise<void> {
  try {
    await fs.writeFile(personalnummerFile, JSON.stringify({}))
    console.log('personalnummer.json purged successfully.')
  } catch (error) {
    console.error('Error deleting personalnummer.json file:', error)
  }
}

// Personalnummer handling
const vertragsaenderungFile = path.join(
  __dirname,
  'storage/vertragsaenderung.json'
)

export async function saveVertragsaenderung(
  vertragsaenderung: string
): Promise<void> {
  try {
    await fs.writeFile(
      vertragsaenderungFile,
      JSON.stringify({ vertragsaenderung })
    )
  } catch (error) {
    console.error('Error writing to vertragsaenderung.json file', error)
  }
}

export async function loadVertragsaenderung(): Promise<string | null> {
  try {
    const data = await fs.readFile(vertragsaenderungFile, 'utf-8')
    return JSON.parse(data).vertragsaenderung
  } catch (error) {
    return null
  }
}

export async function deleteVertragsaenderung(): Promise<void> {
  try {
    await fs.writeFile(vertragsaenderungFile, JSON.stringify({}))
    console.log('vertragsaenderung.json purged successfully.')
  } catch (error) {
    console.error('Error deleting vertragsaenderung.json file:', error)
  }
}

// Session handling
const sessionFile = path.join(__dirname, 'storage/session.json')

type SessionData = {
  cookies: any[]
  localStorage: { [key: string]: string }
}

export async function saveSession(context: BrowserContext): Promise<void> {
  const cookies = await context.cookies()
  try {
    await fs.writeFile(sessionFile, JSON.stringify({ cookies }))
  } catch (error) {
    console.error('Error writing to session.json file', error)
  }
}

export async function loadSession(): Promise<SessionData | null> {
  try {
    const data = await fs.readFile(sessionFile, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading session.json file:', error)
    return null
  }
}

export async function deleteSession(): Promise<void> {
  try {
    await fs.writeFile(sessionFile, JSON.stringify({}))
    console.log('session.json deleted successfully.')
  } catch (error) {
    console.error('Error deleting session.json file:', error)
  }
}

// Helper methods

export async function login(page: Page): Promise<void> {
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

export const authenticatedTest = base.extend<{
  authenticatedPage: Page
}>({
  authenticatedPage: async ({ browser }, use) => {
    const context = await browser.newContext()
    const page = await context.newPage()

    const sessionData = await loadSession()

    if (sessionData) {
      await context.addCookies(sessionData.cookies)
    } else {
      await login(page)
      await saveSession(context)
    }

    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(page)

    await context.close()
  },
})

interface URLSearchParamsCheck {
  [key: string]: string | undefined
}

interface URLCheck {
  pathname?: string
  searchParams?: URLSearchParamsCheck
}

export function URLMatcher(checks: URLCheck): (url: URL) => boolean {
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

export async function expectURL(page: Page, checks: URLCheck): Promise<void> {
  await expect(page).toHaveURL(URLMatcher(checks))
}
