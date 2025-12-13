import { de, Faker } from '@faker-js/faker'
import { expect, Page, test } from '@playwright/test'
import dayjs from 'dayjs'

import { MA_PN_IDS } from './private/ma-data' // user reference data that shouldn't be tracked
import {
  deleteVertragsaenderung,
  loadVertragsaenderung,
  saveVertragsaenderung,
} from './test-utils'

// TODO: move to playwright config
export const faker = new Faker({
  locale: [de],
})
// https://v9.fakerjs.dev/guide/

const SELECTED_MA = MA_PN_IDS[0]

async function waitForLoader(page: Page) {
  await page
    .getByTestId('loader')
    .first()
    .waitFor({ state: 'visible', timeout: 20000 })
  await page
    .getByTestId('loader')
    .first()
    .waitFor({ state: 'hidden', timeout: 20000 })
}

test.describe('Start Vertragsaenderung', () => {
  test('Create new Vertragsaenderung from url', async ({ page }) => {
    await test.step('Should open correct form', async () => {
      await page.goto(`/mitarbeiter/vertragsaenderungen/anlegen/${SELECTED_MA}`)
      await expect(page).toHaveURL(
        `/mitarbeiter/vertragsaenderungen/anlegen/${SELECTED_MA}`
      )
      await expect(page.locator('h3').first()).toContainText('Basis Angaben')
    })

    await test.step('Fill all mandatory fields and change tracked fields', async () => {
      // Prepare the path to the file you want to upload
      const GUELTIG_AB = dayjs(
        faker.date.between({ from: '2025-08-01', to: '2026-12-01' })
      ).format('YYYY-MM-DD')

      // fill Basisdaten
      await page.locator('#gueltigAb').fill(GUELTIG_AB)

      await page
        .getByTestId('interneAnmerkung')
        .fill(`Ausgemachte Änderung für ${faker.person.lastName()}`)

      // change Vertragsdaten

      // befristungBis
      const befristungCheckbox = page.getByTestId('isBefristet')
      await expect(befristungCheckbox).toBeEnabled()

      const isBefristungCheckboxChecked = await befristungCheckbox.isChecked()
      await befristungCheckbox.click({ force: true })
      if (!isBefristungCheckboxChecked) {
        await expect(befristungCheckbox).toBeChecked()
      } else {
        await expect(befristungCheckbox).not.toBeChecked()
      }

      // TODO: test kostenstelle

      // set kategorie to Mitarbeiter to get predicatable arbeitszeitmodell values

      await page.getByTestId('kategorie').selectOption('Mitarbeiter')

      // jobBezeichnung
      await page.getByTestId('jobBezeichnung').fill('Fin')
      await page
        .getByTestId('jobBezeichnung-option-Teamleiter_in Finance')
        .click()
      // verwendungsgruppe
      await page.getByTestId('verwendungsgruppe').selectOption('VB 8')

      const arbeitszeitmodellValue = await page
        .getByTestId('arbeitszeitmodell')
        .inputValue()
      // set field to a differen value
      await page
        .getByTestId('arbeitszeitmodell')
        .selectOption(
          arbeitszeitmodellValue !== 'Fixzeitmodell - VZ'
            ? 'Fixzeitmodell - VZ'
            : 'Fix mit 7h Pause (NÖ) Vollzeit'
        )

      // wochenstunden and times
      await page.getByTestId('wochenstunden').fill('30')
      await page.getByTestId('montagBisFreitagVon').fill('07:35')
      await page.getByTestId('montagBisFreitagBis').fill('15:45')
      await page.getByTestId('montagBisFreitagNetto').fill('6')

      // gehaltvereinbart
      await page
        .getByTestId('gehaltVereinbart')
        .fill(faker.number.int({ min: 1500, max: 2500 }).toString())

      // fixZulage
      const fixZulageCheckbox = page.getByTestId('fixZulage')
      await expect(fixZulageCheckbox).toBeEnabled()

      // don't check on re-run
      if (!(await fixZulageCheckbox.isChecked())) {
        await fixZulageCheckbox.click({ force: true })
      }

      await expect(fixZulageCheckbox).toBeChecked()
      await expect(page.getByTestId('zulageInEuroFix')).toBeEnabled()
      await page
        .getByTestId('zulageInEuroFix')
        .fill(faker.number.int({ min: 200, max: 500 }).toString())

      // funktionsZulage
      const funktionsZulageCheckbox = page.getByTestId('funktionsZulage')
      await expect(funktionsZulageCheckbox).toBeEnabled()

      // don't check on re-run
      if (!(await funktionsZulageCheckbox.isChecked())) {
        await funktionsZulageCheckbox.click({ force: true })
      }
      await expect(funktionsZulageCheckbox).toBeChecked()

      await expect(page.getByTestId('zulageInEuroFunktion')).toBeEnabled()
      await page
        .getByTestId('zulageInEuroFunktion')
        .fill(faker.number.int({ min: 200, max: 500 }).toString())

      // leitungsZulage
      const leitungsZulageCheckbox = page.getByTestId('leitungsZulage')
      await expect(leitungsZulageCheckbox).toBeEnabled()

      // don't check on re-run
      if (!(await leitungsZulageCheckbox.isChecked())) {
        await leitungsZulageCheckbox.click({ force: true })
      }
      await expect(leitungsZulageCheckbox).toBeChecked()
      await expect(page.getByTestId('zulageInEuroLeitung')).toBeEnabled()
      await page
        .getByTestId('zulageInEuroLeitung')
        .fill(faker.number.int({ min: 200, max: 500 }).toString())

      // mobileWorking
      const mobileWorkingCheckbox = page.getByTestId('mobileWorking')
      await expect(mobileWorkingCheckbox).toBeEnabled()

      const ismobileWorkingCheckboxChecked =
        await mobileWorkingCheckbox.isChecked()
      await mobileWorkingCheckbox.click({ force: true })

      if (!ismobileWorkingCheckboxChecked) {
        await expect(mobileWorkingCheckbox).toBeChecked()
      } else {
        await expect(mobileWorkingCheckbox).not.toBeChecked()
      }
    })

    await test.step('After Save, user should be redirected to new page with WFIs', async () => {
      page.getByTestId('save').click()

      // wait for loader to disappear
      await page
        .getByTestId('loader')
        .first()
        .waitFor({ state: 'hidden', timeout: 10000 })

      await expect(page).toHaveURL(
        /\/mitarbeiter\/vertragsaenderungen\/\d+\?wfi=\d+/
      )

      // Check for specific wfi parameter value
      const url = new URL(page.url())
      expect(url.searchParams.get('wfi')).toBe('43')

      // first wfi should be complete
      await expect(
        await page.getByTestId(
          'Daten vervollständigen (Vertragsänderung)-completed'
        )
      ).toBeVisible()

      // third wfi should be in progress
      await expect(
        await page.getByTestId(
          'Zur Prüfung vorlegen (Vertragsänderung)-inprogress'
        )
      ).toBeVisible()

      // third wfi should be in progress
      await expect(
        await page.getByTestId('People informieren (Vertragsänderung)-new')
      ).toBeVisible()
    })

    await test.step('save vertragsaenderung to json file for later usage', async () => {
      // purge file to ensure clean writes
      await deleteVertragsaenderung()

      const pathname = new URL(page.url()).pathname
      const vertragsaenderungId = pathname.split('/').pop()

      if (vertragsaenderungId) {
        // console.log(`Extracted vertragsaenderung: ${vertragsaenderung}`)
        await saveVertragsaenderung(vertragsaenderungId)
      } else {
        throw new Error('Failed to extract vertragsaenderung from URL')
      }
    })

    await test.step('After click on next WFI, user should be redirected to Pruefen Form', async () => {
      await page.getByTestId('Zur Prüfung vorlegen (Vertragsänderung)').click()

      await expect(page.locator('h2')).toContainText('Zur Prüfung Vorlegen')

      // Check for specific wfi parameter value
      const url = new URL(page.url())
      await expect(url.searchParams.get('wfi')).toBe('45')

      // wait for loader to disappear
      await page
        .getByTestId('button-loader')
        .first()
        .waitFor({ state: 'hidden', timeout: 10000 })
    })
  })

  test('Go to "Zur Prüfung vorlegen" Step and Accept changes', async ({
    page,
  }) => {
    await test.step('After navigation, pruefen form should be visible', async () => {
      // get vertragsaenderungId from JSON
      const vertragsaenderungId = await loadVertragsaenderung()
      expect(vertragsaenderungId).not.toBeUndefined()

      await page.goto(
        `/mitarbeiter/vertragsaenderungen/${vertragsaenderungId}?wfi=45`
      )

      // wait for loader to disappear
      await page
        .getByTestId('loader')
        .first()
        .waitFor({ state: 'hidden', timeout: 10000 })

      await expect(page.locator('h2')).toContainText('Zur Prüfung Vorlegen')
    })

    await test.step('After click on "Accept" button, the WFIs should be updated', async () => {
      page.getByTestId('pruefen-accept').click()
      // wait for loader to disappear
      await page
        .getByTestId('button-loader')
        .first()
        .waitFor({ state: 'visible', timeout: 10000 })
      await page
        .getByTestId('button-loader')
        .first()
        .waitFor({ state: 'hidden', timeout: 10000 })

      // current wfi should be complete
      await expect(
        await page.getByTestId(
          'Zur Prüfung vorlegen (Vertragsänderung)-completed'
        )
      ).toBeVisible()

      // next wfi should be complete
      await expect(
        await page.getByTestId(
          'People informieren (Vertragsänderung)-completed'
        )
      ).toBeVisible()

      // People prüft should be in progress
      await expect(
        await page.getByTestId('People prüft (Vertragsänderung)-inprogress')
      ).toBeVisible()

      // Lohnverrechnung informieren should be new
      await expect(
        await page.getByTestId(
          'Lohnverrechnung informieren (Vertragsänderung)-new'
        )
      ).toBeVisible()
    })

    await test.step('After click on next WFI, user should be redirected to "People Prüft"', async () => {
      await page.getByTestId('People prüft (Vertragsänderung)').click()

      await expect(page.locator('h2')).toContainText('People prüft')

      // Check for specific wfi parameter value
      const url = new URL(page.url())
      await expect(url.searchParams.get('wfi')).toBe('47')

      // wait for loader to disappear
      await page
        .getByTestId('button-loader')
        .first()
        .waitFor({ state: 'hidden', timeout: 10000 })
    })
  })

  test('Go to "People prüft" Step and Accept changes', async ({ page }) => {
    await test.step('After navigation, pruefen form should be visible', async () => {
      // get vertragsaenderungId from JSON
      const vertragsaenderungId = await loadVertragsaenderung()
      expect(vertragsaenderungId).not.toBeUndefined()

      await page.goto(
        `/mitarbeiter/vertragsaenderungen/${vertragsaenderungId}?wfi=47`
      )

      // wait for loader to disappear
      await page
        .getByTestId('loader')
        .first()
        .waitFor({ state: 'hidden', timeout: 10000 })

      await expect(page.locator('h2')).toContainText('People prüft')
    })

    await test.step('After click on "Accept" button, the WFIs should be updated', async () => {
      page.getByTestId('pruefen-accept').click()
      // wait for loader to disappear
      await page
        .getByTestId('button-loader')
        .first()
        .waitFor({ state: 'visible', timeout: 10000 })
      await page
        .getByTestId('button-loader')
        .first()
        .waitFor({ state: 'hidden', timeout: 10000 })

      // current wfi should be complete
      await expect(
        await page.getByTestId('People prüft (Vertragsänderung)-completed')
      ).toBeVisible()

      // next wfi should be complete
      await expect(
        await page.getByTestId(
          'Lohnverrechnung informieren (Vertragsänderung)-completed'
        )
      ).toBeVisible()

      // Lohnverrechnung prüft should be in progress
      await expect(
        await page.getByTestId(
          'Lohnverrechnung prüft (Vertragsänderung)-inprogress'
        )
      ).toBeVisible()

      // Genehmiger informieren should be new
      await expect(
        await page.getByTestId('Genehmiger informieren (Vertragsänderung)-new')
      ).toBeVisible()
    })

    await test.step('After click on next WFI, user should be redirected to "Lohnverrechnung prüft"', async () => {
      await page.getByTestId('Lohnverrechnung prüft (Vertragsänderung)').click()

      await expect(page.locator('h2')).toContainText('Lohnverrechnung prüft')

      // Check for specific wfi parameter value
      const url = new URL(page.url())
      await expect(url.searchParams.get('wfi')).toBe('49')

      // wait for loader to disappear
      await page
        .getByTestId('button-loader')
        .first()
        .waitFor({ state: 'hidden', timeout: 10000 })
    })
  })

  test('Go to "Lohnverrechnung prüft" Step and Accept changes', async ({
    page,
  }) => {
    await test.step('After navigation, pruefen form should be visible', async () => {
      // get vertragsaenderungId from JSON
      const vertragsaenderungId = await loadVertragsaenderung()
      expect(vertragsaenderungId).not.toBeUndefined()

      await page.goto(
        `/mitarbeiter/vertragsaenderungen/${vertragsaenderungId}?wfi=49`
      )

      // wait for loader to disappear
      await page
        .getByTestId('loader')
        .first()
        .waitFor({ state: 'hidden', timeout: 10000 })

      await expect(page.locator('h2')).toContainText('Lohnverrechnung prüft')
    })

    await test.step('After click on "Accept" button, the WFIs should be updated', async () => {
      page.getByTestId('pruefen-accept').click()
      // wait for loader to disappear
      await page
        .getByTestId('button-loader')
        .first()
        .waitFor({ state: 'visible', timeout: 10000 })
      await page
        .getByTestId('button-loader')
        .first()
        .waitFor({ state: 'hidden', timeout: 10000 })

      // current wfi should be complete
      await expect(
        await page.getByTestId(
          'Lohnverrechnung prüft (Vertragsänderung)-completed'
        )
      ).toBeVisible()

      // next wfi should be complete
      await expect(
        await page.getByTestId(
          'Genehmiger informieren (Vertragsänderung)-completed'
        )
      ).toBeVisible()

      // Genehmiger prüft prüft should be in progress
      await expect(
        await page.getByTestId('Genehmiger prüft (Vertragsänderung)-inprogress')
      ).toBeVisible()

      // Unterschriftenlauf starten should be new
      await expect(
        await page.getByTestId(
          'Unterschriftenlauf starten (Vertragsänderung)-new'
        )
      ).toBeVisible()
    })

    await test.step('After click on next WFI, user should be redirected to "Genehmiger prüft"', async () => {
      await page.getByTestId('Genehmiger prüft (Vertragsänderung)').click()

      await expect(page.locator('h2')).toContainText('Genehmiger prüft')

      // Check for specific wfi parameter value
      const url = new URL(page.url())
      await expect(url.searchParams.get('wfi')).toBe('51')

      // wait for loader to disappear
      await page
        .getByTestId('button-loader')
        .first()
        .waitFor({ state: 'hidden', timeout: 10000 })
    })
  })
})
