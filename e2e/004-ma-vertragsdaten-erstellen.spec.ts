import { de, Faker } from '@faker-js/faker'
import { expect, Page, test } from '@playwright/test'
import dayjs from 'dayjs'
import path from 'path'

import { getAgeAsString, loadPersonalnummer } from './test-utils'

export const faker = new Faker({
  locale: [de],
})
test.setTimeout(40000)

let personalnummer: string | null = null

test.beforeEach(async ({ page }) => {
  // get personalNummer from JSON
  const loadedPersonalnummer = await loadPersonalnummer()
  expect(loadedPersonalnummer).not.toBeUndefined()

  personalnummer = loadedPersonalnummer

  // go to stammdaten page
  await page.goto(`/mitarbeiter/onboarding/${personalnummer}?wfi=4`)
})

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

async function saveVertragsdaten(page: Page) {
  await page.getByTestId('save-button').first().click()
  await waitForLoader(page)
}

test.describe('Enter Vertragsdaten', () => {
  test('should navigate to page and fill out vertragsdaten successful', async ({
    page,
  }) => {
    await test.step('after redirect, navigator and WFIs should become visible', async () => {
      await page.waitForTimeout(3000)
      await expect(page.getByTestId('navigator-title')).toContainText(
        'Navigator',
        {
          timeout: 10000,
        }
      )
      await expect(page.getByTestId('navigator-container')).toContainText(
        'Stammdaten erfassen',
        { timeout: 10000 }
      )
      await expect(page.getByTestId('navigator-container')).toContainText(
        'Vertragsdaten erfassen',
        { timeout: 10000 }
      )

      await expect(page.locator('h2')).toContainText('Vertragsdaten erfassen')
    })

    await test.step('after initial save, all required fields should show an error', async () => {
      // check weitereAdressezuHauptwohnsitz to get more error results
      const weitereAdressezuHauptwohnsitzCheckbox = page.getByTestId(
        'weitereAdressezuHauptwohnsitz'
      )
      await expect(weitereAdressezuHauptwohnsitzCheckbox).toBeEnabled()

      // don't check on re-run
      if (!(await weitereAdressezuHauptwohnsitzCheckbox.isChecked())) {
        await weitereAdressezuHauptwohnsitzCheckbox.click({ force: true })
      }
      await expect(weitereAdressezuHauptwohnsitzCheckbox).toBeChecked()

      await saveVertragsdaten(page)

      // expext errors for all required fields on the allgemein section
      await expect(page.getByTestId('eintritt-error')).toBeVisible()
      await expect(page.getByTestId('kostenstelle-error')).toBeVisible()
      await expect(page.getByTestId('dienstort-error')).toBeVisible()
      await expect(page.getByTestId('fuehrungskraft-error')).toBeVisible()
      await expect(page.getByTestId('taetigkeit-error')).toBeVisible()
      await expect(page.getByTestId('jobBezeichnung-error')).toBeVisible()
      await expect(page.getByTestId('kollektivvertrag-error')).toBeVisible()
      await expect(page.getByTestId('verwendungsgruppe-error')).toBeVisible()

      // expect errors for all required fields on the arbeitszeit section
      await expect(
        page.getByTestId('beschaeftigungsausmass-error')
      ).toBeVisible()

      await expect(page.getByTestId('wochenstunden-error')).toBeVisible()
      await expect(page.getByTestId('arbeitszeitmodell-error')).toBeVisible()
      await expect(page.getByTestId('abrechnungsgruppe-error')).toBeVisible()
      await expect(page.getByTestId('dienstnehmergruppe-error')).toBeVisible()

      await expect(page.getByTestId('amontagVon-error')).toBeVisible()
      await expect(page.getByTestId('amontagBis-error')).toBeVisible()
      await expect(page.getByTestId('amontagNetto-error')).toBeVisible()

      await expect(page.getByTestId('adienstagVon-error')).toBeVisible()
      await expect(page.getByTestId('adienstagBis-error')).toBeVisible()
      await expect(page.getByTestId('adienstagNetto-error')).toBeVisible()

      await expect(page.getByTestId('amittwochVon-error')).toBeVisible()
      await expect(page.getByTestId('amittwochBis-error')).toBeVisible()
      await expect(page.getByTestId('amittwochNetto-error')).toBeVisible()

      await expect(page.getByTestId('adonnerstagVon-error')).toBeVisible()
      await expect(page.getByTestId('adonnerstagBis-error')).toBeVisible()
      await expect(page.getByTestId('adonnerstagNetto-error')).toBeVisible()

      await expect(page.getByTestId('afreitagVon-error')).toBeVisible()
      await expect(page.getByTestId('afreitagBis-error')).toBeVisible()
      await expect(page.getByTestId('afreitagNetto-error')).toBeVisible()

      // expect errors for all required fields in the Zusatzvereinbarung section
      await expect(page.getByTestId('strasse-error')).toBeVisible()
      await expect(page.getByTestId('plz-error')).toBeVisible()
      await expect(page.getByTestId('ort-error')).toBeVisible()
      await expect(page.getByTestId('land-error')).toBeVisible()
    })

    await test.step('enter Allgemein data into form', async () => {
      const eintritt = dayjs(
        faker.date.between({ from: '2025-09-01', to: '2026-03-01' })
      ).format('DD.MM.YYYY')
      const befristungBis = dayjs(
        faker.date.between({ from: '2026-03-01', to: '2026-06-01' })
      ).format('DD.MM.YYYY')

      await page
        .getByTestId('loader')
        .first()
        .waitFor({ state: 'hidden', timeout: 10000 })

      await page.locator('#eintritt').click()
      await page.locator('#eintritt').fill(eintritt)

      const befristungCheckbox = page.getByTestId('isBefristet')
      await expect(befristungCheckbox).toBeEnabled()

      const isBefristungCheckboxChecked = await befristungCheckbox.isChecked()
      if (!isBefristungCheckboxChecked) {
        await befristungCheckbox.click({ force: true })
      }
      await expect(befristungCheckbox).toBeChecked()

      await page.locator('#befristungBis').fill(befristungBis)

      // native selecy menut
      await page.getByTestId('kostenstelle').selectOption('IDC')

      // combobox: click button only
      await page.getByTestId('dienstort-button').click()
      await page.getByTestId('dienstort-option-Baden (Goethegasse 14)').click()

      // combobox: fill directly
      await page.getByTestId('fuehrungskraft').fill('Alex')
      await page
        .getByTestId('fuehrungskraft-option-Alexander Pollinger')
        .click()

      await page.getByTestId('kategorie').selectOption('Führungskraft')

      await page.getByTestId('taetigkeit-button').click()
      await page.getByTestId('taetigkeit-option-Geschäftsfeldleitung').click()

      await page.getByTestId('jobBezeichnung').fill('Buch')
      await page.getByTestId('jobBezeichnung-option-Buchhalter_in').click()

      await page.getByTestId('kollektivvertrag').selectOption('BABE')

      await page.getByTestId('verwendungsgruppe').selectOption('VB 3')

      await saveVertragsdaten(page)

      // expect no errors on the changed fields after save
      await expect(page.getByTestId('eintritt-error')).toBeHidden()
      await expect(page.getByTestId('kostenstelle-error')).toBeHidden()
      await expect(page.getByTestId('dienstort-error')).toBeHidden()
      await expect(page.getByTestId('fuehrungskraft-error')).toBeHidden()
      await expect(page.getByTestId('kategorie-error')).toBeHidden()
      await expect(page.getByTestId('taetigkeit-error')).toBeHidden()
      await expect(page.getByTestId('jobBezeichnung-error')).toBeHidden()
      await expect(page.getByTestId('kollektivvertrag-error')).toBeHidden()
      await expect(page.getByTestId('verwendungsgruppe-error')).toBeHidden()
      await expect(page.getByTestId('notizAllgemein-error')).toBeHidden()
    })

    await test.step('enter Arbeitszeiten data into form', async () => {
      await page
        .getByTestId('beschaeftigungsausmass')
        .selectOption('Vollversicherung')
      await page
        .getByTestId('beschaeftigungsstatus')
        .selectOption('Angestellter')
      await page.getByTestId('wochenstunden').fill('38')
      await page
        .getByTestId('arbeitszeitmodell')
        .selectOption('Fixzeitmodell - VZ')

      // eintritt am should set arbeitszeitmodell von
      const eintrittValue = await page.locator('#eintritt').inputValue()
      await expect(page.locator('#arbeitszeitmodellVon')).toHaveValue(
        eintrittValue
      )
      await expect(page.locator('#arbeitszeitmodellVon')).toBeDisabled()
      await expect(page.locator('#arbeitszeitmodellBis')).toBeDisabled()
      await expect(
        page.getByTestId('auswahlBegruendungFuerDurchrechner')
      ).toBeDisabled()
      await page.getByTestId('abrechnungsgruppe').selectOption('GF Beratung')
      await page.getByTestId('dienstnehmergruppe').selectOption('ANG Wien')

      await page.getByTestId('montagBisFreitagVon').fill('08:00')
      await page.getByTestId('montagBisFreitagBis').fill('17:00')
      await page.getByTestId('montagBisFreitagNetto').fill('8')

      // expect quick entry fields to work properly
      await expect(page.getByTestId('amontagVon-picker-input')).toHaveValue(
        '08:00'
      )
      await expect(page.getByTestId('amontagBis-picker-input')).toHaveValue(
        '17:00'
      )
      await expect(page.getByTestId('amontagNetto')).toHaveValue('8')

      await expect(page.getByTestId('adienstagVon-picker-input')).toHaveValue(
        '08:00'
      )
      await expect(page.getByTestId('adienstagBis-picker-input')).toHaveValue(
        '17:00'
      )
      await expect(page.getByTestId('adienstagNetto')).toHaveValue('8')

      await expect(page.getByTestId('amittwochVon-picker-input')).toHaveValue(
        '08:00'
      )
      await expect(page.getByTestId('amittwochBis-picker-input')).toHaveValue(
        '17:00'
      )
      await expect(page.getByTestId('amittwochNetto')).toHaveValue('8')

      await expect(page.getByTestId('adonnerstagVon-picker-input')).toHaveValue(
        '08:00'
      )
      await expect(page.getByTestId('adonnerstagBis-picker-input')).toHaveValue(
        '17:00'
      )
      await expect(page.getByTestId('adonnerstagNetto')).toHaveValue('8')

      await expect(page.getByTestId('afreitagVon-picker-input')).toHaveValue(
        '08:00'
      )
      await expect(page.getByTestId('afreitagBis-picker-input')).toHaveValue(
        '17:00'
      )
      await expect(page.getByTestId('afreitagNetto')).toHaveValue('8')

      await page.getByTestId('afreitagVon').fill('08:00')
      await page.getByTestId('afreitagBis').fill('13:00')
      await page.getByTestId('afreitagNetto').fill('6')

      const location = faker.helpers.arrayElement([
        'in der Kantine',
        'am Arbeitsplatz',
        'außerhalb',
      ])
      const notizArbeitszeit = faker.helpers.arrayElement([
        'Flexible Arbeitszeiten',
        'Fixe Arbeitszeiten',
      ])
      await page.getByTestId('spezielleMittagspausenregelung').fill(location)
      await page.getByTestId('notizArbeitszeit').fill(notizArbeitszeit)

      await saveVertragsdaten(page)

      // Expect no errors to be shown
      await expect(
        page.getByTestId('beschaeftigungsausmass-error')
      ).toBeHidden()
      await expect(page.getByTestId('beschaeftigungsstatus-error')).toBeHidden()
      await expect(page.getByTestId('wochenstunden-error')).toBeHidden()
      await expect(page.getByTestId('arbeitszeitmodell-error')).toBeHidden()
      await expect(page.getByTestId('arbeitszeitmodellVon-error')).toBeHidden()
      await expect(page.getByTestId('arbeitszeitmodellBis-error')).toBeHidden()
      await expect(
        page.getByTestId('auswahlBegruendungFuerDurchrechner-error')
      ).toBeHidden()
      await expect(page.getByTestId('abrechnungsgruppe-error')).toBeHidden()
      await expect(page.getByTestId('dienstnehmergruppe-error')).toBeHidden()
      await expect(page.getByTestId('amontagVon-error')).toBeHidden()
      await expect(page.getByTestId('amontagBis-error')).toBeHidden()
      await expect(page.getByTestId('amontagNetto-error')).toBeHidden()

      await expect(page.getByTestId('adienstagVon-error')).toBeHidden()
      await expect(page.getByTestId('adienstagBis-error')).toBeHidden()
      await expect(page.getByTestId('adienstagNetto-error')).toBeHidden()

      await expect(page.getByTestId('amittwochVon-error')).toBeHidden()
      await expect(page.getByTestId('amittwochBis-error')).toBeHidden()
      await expect(page.getByTestId('amittwochNetto-error')).toBeHidden()

      await expect(page.getByTestId('adonnerstagVon-error')).toBeHidden()
      await expect(page.getByTestId('adonnerstagBis-error')).toBeHidden()
      await expect(page.getByTestId('adonnerstagNetto-error')).toBeHidden()

      await expect(page.getByTestId('afreitagVon-error')).toBeHidden()
      await expect(page.getByTestId('afreitagBis-error')).toBeHidden()
      await expect(page.getByTestId('afreitagNetto-error')).toBeHidden()

      await expect(page.getByTestId('asamstagVon-error')).toBeHidden()
      await expect(page.getByTestId('asamstagBis-error')).toBeHidden()
      await expect(page.getByTestId('asamstagNetto-error')).toBeHidden()

      await expect(page.getByTestId('asonntagVon-error')).toBeHidden()
      await expect(page.getByTestId('asonntagBis-error')).toBeHidden()
      await expect(page.getByTestId('asonntagNetto-error')).toBeHidden()
      await expect(
        page.getByTestId('spezielleMittagspausenregelung-error')
      ).toBeHidden()
      await expect(page.getByTestId('notizArbeitszeit-error')).toBeHidden()
    })

    await test.step('enter Gehalt data into form', async () => {
      await page
        .getByTestId('angerechneteIbisMonate')
        .fill(faker.number.int({ min: 4, max: 24 }).toString())
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

      const jobticketCheckbox = page.getByTestId('jobticket')
      await expect(jobticketCheckbox).toBeEnabled()

      // don't check on re-run
      if (!(await jobticketCheckbox.isChecked())) {
        await jobticketCheckbox.click({ force: true })
      }
      await expect(jobticketCheckbox).toBeChecked()

      await expect(page.getByTestId('jobticketTitle')).toBeEnabled()

      await page.getByTestId('jobticketTitle').selectOption('Klimaticket')

      const notizGehalt = faker.helpers.arrayElement([
        'Gehalt inkl. Prämie',
        'ohne 15.Gehalt',
      ])
      await page.getByTestId('notizGehalt').fill(notizGehalt)

      await saveVertragsdaten(page)

      await expect(
        page.getByTestId('angerechneteIbisMonate-error')
      ).toBeHidden()
      await expect(page.getByTestId('gehaltVereinbart-error')).toBeHidden()
      await expect(page.getByTestId('fixZulage-error')).toBeHidden()
      await expect(page.getByTestId('zulageInEuroFix-error')).toBeHidden()
      await expect(page.getByTestId('funktionsZulage-error')).toBeHidden()
      await expect(page.getByTestId('zulageInEuroFunktion-error')).toBeHidden()
      await expect(page.getByTestId('leitungsZulage-error')).toBeHidden()
      await expect(page.getByTestId('zulageInEuroLeitung-error')).toBeHidden()
      await expect(page.getByTestId('jobticket-error')).toBeHidden()
      await expect(page.getByTestId('jobticketTitle-error')).toBeHidden()
      await expect(page.getByTestId('notizGehalt-error')).toBeHidden()
    })

    await test.step('enter Zusatzvereinbarung data into form', async () => {
      await page
        .getByTestId('loader')
        .first()
        .waitFor({ state: 'hidden', timeout: 10000 })
      const mobileWorkingCheckbox = page.getByTestId('mobileWorking')
      await expect(mobileWorkingCheckbox).toBeEnabled()

      // don't check on re-run
      if (!(await mobileWorkingCheckbox.isChecked())) {
        await mobileWorkingCheckbox.click({ force: true })
      }
      await expect(mobileWorkingCheckbox).toBeChecked()

      const weitereAdressezuHauptwohnsitzCheckbox = page.getByTestId(
        'weitereAdressezuHauptwohnsitz'
      )
      await expect(weitereAdressezuHauptwohnsitzCheckbox).toBeEnabled()

      // don't check on re-run
      if (!(await weitereAdressezuHauptwohnsitzCheckbox.isChecked())) {
        await weitereAdressezuHauptwohnsitzCheckbox.click({ force: true })
      }
      await expect(weitereAdressezuHauptwohnsitzCheckbox).toBeChecked()

      await expect(page.getByTestId('strasse')).toBeEnabled()
      await page.getByTestId('strasse').fill(faker.location.streetAddress())

      await expect(page.getByTestId('land')).toBeEnabled()
      await page.getByTestId('land').fill('Öst')
      await page.getByTestId('land-option-Österreich').click()

      await expect(page.getByTestId('plz')).toBeEnabled()
      await page
        .getByTestId('plz')
        .fill(faker.helpers.arrayElement(['1020', '1120', '1150', '1220']))

      await expect(page.getByTestId('ort')).toBeEnabled()
      await page.getByTestId('ort').fill('Wien')

      const notizZusatzvereinbarung = faker.helpers.arrayElement([
        'Firmenhandy',
        'Weiterbildungskurse',
      ])
      await page
        .getByTestId('notizZusatzvereinbarung')
        .fill(notizZusatzvereinbarung)

      await saveVertragsdaten(page)

      await expect(page.getByTestId('mobileWorking-error')).toBeHidden()
      await expect(
        page.getByTestId('weitereAdressezuHauptwohnsitz-error')
      ).toBeHidden()
      await expect(page.getByTestId('strasse-error')).toBeHidden()
      await expect(page.getByTestId('land-error')).toBeHidden()
      await expect(page.getByTestId('plz-error')).toBeHidden()
      await expect(page.getByTestId('ort-error')).toBeHidden()
      await expect(
        page.getByTestId('notizZusatzvereinbarung-error')
      ).toBeHidden()
    })
  })

  test('should show vereinbarung überstunden with all in option', async ({
    page,
  }) => {
    // enter Verwendungsgrppe VB 3 into form
    await page.getByTestId('verwendungsgruppe').selectOption('VB 3')

    // check if Vereinbarung Überstunden dropdown is disabled and value is Keine
    const inputElement = page.getByTestId('vereinbarungUEberstunden')
    await expect(inputElement).toBeDisabled()
    await expect(inputElement).toHaveValue('Keine')

    // enter Verwendungsgrppe VB 5 into form
    await page.getByTestId('verwendungsgruppe').selectOption('VB 7')

    // check if Vereinbarung Überstunden dropdown option is set
    await expect(page.getByTestId('vereinbarungUEberstunden')).toBeEnabled()
    await page.getByTestId('vereinbarungUEberstunden').selectOption('All in')
    await expect(page.getByTestId('vereinbarungUEberstunden')).toHaveValue(
      'All in'
    )
  })

  test('should show kernzeiten', async ({ page }) => {
    await test.step('set Arbeitszeitmodell to Gleitzeit', async () => {
      const kernzeitCheckbox = page.getByTestId('kernzeit')
      await kernzeitCheckbox.waitFor({ state: 'visible', timeout: 10000 })

      await expect(kernzeitCheckbox).toBeDisabled()

      await page.getByTestId('arbeitszeitmodell').selectOption('Gleitzeit - VZ')

      await expect(kernzeitCheckbox).toBeEnabled()
    })

    await test.step('enable kernzeit toggle and fill fields', async () => {
      const kernzeitCheckbox = page.getByTestId('kernzeit')

      // don't check on re-run
      if (!(await kernzeitCheckbox.isChecked())) {
        await kernzeitCheckbox.click({ force: true })
      }
      await expect(kernzeitCheckbox).toBeChecked()

      await page.getByTestId('montagBisFreitagKernzeitVon').fill('10:00')
      await page.getByTestId('montagBisFreitagKernzeitBis').fill('15:00')

      await expect(page.getByTestId('kmontagVon')).toHaveValue('10:00')
      await expect(page.getByTestId('kmontagBis')).toHaveValue('15:00')

      await expect(page.getByTestId('kdienstagVon')).toHaveValue('10:00')
      await expect(page.getByTestId('kdienstagBis')).toHaveValue('15:00')

      await expect(page.getByTestId('kmittwochVon')).toHaveValue('10:00')
      await expect(page.getByTestId('kmittwochBis')).toHaveValue('15:00')

      await expect(page.getByTestId('kdonnerstagVon')).toHaveValue('10:00')
      await expect(page.getByTestId('kdonnerstagBis')).toHaveValue('15:00')

      await expect(page.getByTestId('kfreitagVon')).toHaveValue('10:00')
      await expect(page.getByTestId('kfreitagBis')).toHaveValue('15:00')

      await page.getByTestId('kfreitagVon').fill('10:30')
      await page.getByTestId('kfreitagBis').fill('13:30')

      await saveVertragsdaten(page)

      await expect(kernzeitCheckbox).toBeEnabled()
      await expect(kernzeitCheckbox).toBeChecked()
      await expect(await page.getByTestId('kfreitagVon')).toHaveValue('10:30')
      await expect(await page.getByTestId('kfreitagBis')).toHaveValue('13:30')
    })
  })

  test('eintritt date should set arbeitszeitmodell fields correctly', async ({
    page,
  }) => {
    const previousDate = dayjs().subtract(5, 'day').format('DD.MM.YYYY')
    const todaysDate = dayjs().format('DD.MM.YYYY')

    //set eintritt am before today's date
    await page.locator('#eintritt').fill(previousDate)
    await page.keyboard.press('Tab')

    // arbeitszeitModellVon should have same date as eintritt
    await expect(page.locator('#arbeitszeitmodellVon')).toHaveValue(
      previousDate
    )

    await test.step('arbeitszeitmodellBis should be visible and selecting before today not possible', async () => {
      await page.getByTestId('kategorie').selectOption('Training')

      await page
        .getByTestId('arbeitszeitmodell')
        .selectOption('Durchrechnung - VZ')
      await expect(page.locator('#arbeitszeitmodellBis')).toBeEnabled()
      await page.locator('#arbeitszeitmodellBis').fill(todaysDate)
      await page.keyboard.press('Tab')

      await page.locator('#arbeitszeitmodellBis').click()
      const todaySelector =
        '.react-datepicker__day--today:not(.react-datepicker__day--disabled)'
      await expect(page.locator(todaySelector)).toBeVisible()

      const previousMonthButton = page.locator(
        'button.react-datepicker__navigation--previous'
      )
      const nextMonthButton = page.locator(
        'button.react-datepicker__navigation--next'
      )
      await expect(previousMonthButton).not.toBeVisible()
      await expect(nextMonthButton).toBeVisible()

      // filling previous dates shouldn't work
      await page.locator('#arbeitszeitmodellBis').fill(previousDate)
      await page.keyboard.press('Tab')
      await expect(page.locator('#arbeitszeitmodellBis')).toHaveValue(
        todaysDate
      )

      await page.locator('#arbeitszeitmodellBis').fill(todaysDate)
      await page.keyboard.press('Tab')
      await expect(page.locator('#arbeitszeitmodellBis')).toHaveValue(
        todaysDate
      )
    })
  })

  test('should show filter "Arbeitszeitmodell" according to "Kategorie"', async ({
    page,
  }) => {
    const getDropdownOptions = async () => {
      const dropdown = await page.getByTestId('arbeitszeitmodell')
      return dropdown.evaluate((select: HTMLSelectElement) =>
        Array.from(select.options).map((option) => option.text)
      )
    }

    await test.step('set Kategorie to "Mitarbeiter"', async () => {
      await page.getByTestId('kategorie').selectOption('Mitarbeiter')
      const fuehrungskraftOptions = await getDropdownOptions()

      expect(fuehrungskraftOptions).toContain('Fixzeitmodell - VZ')
      expect(fuehrungskraftOptions).toContain('Fixzeitmodell - TZ')

      expect(fuehrungskraftOptions).not.toContain('Gleitzeit - VZ')
      expect(fuehrungskraftOptions).not.toContain('Gleitzeit - TZ')

      expect(fuehrungskraftOptions).not.toContain('Durchrechnung - TZ')
      expect(fuehrungskraftOptions).not.toContain('Durchrechnung - VZ')

      expect(fuehrungskraftOptions).not.toContain('All In Teilzeit')
      expect(fuehrungskraftOptions).not.toContain('All In Vollzeit AIVZ')
      expect(fuehrungskraftOptions).not.toContain('Gleitzeit ÜP')
    })

    await test.step('set Kategorie to "Führungskraft"', async () => {
      await page.getByTestId('kategorie').selectOption('Führungskraft')
      const fuehrungskraftOptions = await getDropdownOptions()
      expect(fuehrungskraftOptions).toContain('All In Teilzeit')
      expect(fuehrungskraftOptions).toContain('All In Vollzeit AIVZ')
      expect(fuehrungskraftOptions).toContain('Gleitzeit ÜP')

      expect(fuehrungskraftOptions).toContain('Gleitzeit - VZ')
      expect(fuehrungskraftOptions).toContain('Gleitzeit - TZ')

      expect(fuehrungskraftOptions).not.toContain('Durchrechnung - TZ')
      expect(fuehrungskraftOptions).not.toContain('Durchrechnung - VZ')
    })

    await test.step('set Kategorie to "Training"', async () => {
      await page.getByTestId('kategorie').selectOption('Training')
      const fuehrungskraftOptions = await getDropdownOptions()
      expect(fuehrungskraftOptions).not.toContain('All In Teilzeit')
      expect(fuehrungskraftOptions).not.toContain('Gleitzeit ÜP')

      expect(fuehrungskraftOptions).toContain('Durchrechnung - TZ')
      expect(fuehrungskraftOptions).toContain('Durchrechnung - VZ')

      expect(fuehrungskraftOptions).not.toContain('Gleitzeit - VZ')
      expect(fuehrungskraftOptions).not.toContain('Gleitzeit - TZ')
    })
  })

  test('should enter, edit and delete vordienstzeit successfully', async ({
    page,
  }) => {
    const vordienstzeitenVon = dayjs(
      faker.date.between({ from: '2009-01-01', to: '2019-08-30' })
    ).format('YYYY-MM-DD')
    const vordienstzeitenVon2 = dayjs(
      faker.date.between({ from: '2009-01-01', to: '2019-08-30' })
    ).format('YYYY-MM-DD')
    const vordienstzeitenBis = dayjs(
      faker.date.between({ from: '2020-01-01', to: '2023-08-30' })
    ).format('YYYY-MM-DD')
    const vordienstzeitenBis2 = dayjs(
      faker.date.between({ from: '2020-01-01', to: '2023-08-30' })
    ).format('YYYY-MM-DD')
    const companyName = faker.company.name()
    const companyName2 = faker.company.name()
    const workingHours = faker.number.int({ min: 10, max: 39 }).toString()
    const workingHours2 = faker.number.int({ min: 10, max: 39 }).toString()

    await page
      .getByTestId('vordienstzeit-create-button')
      .waitFor({ state: 'visible' })

    await test.step('enter Vordienstzeiten data into form', async () => {
      await page.getByTestId('vordienstzeit-create-button').click()
      await page
        .getByTestId('vordienstzeiten-form-headline')
        .waitFor({ state: 'visible' })

      await page
        .locator('#vordienstzeitenVon')
        .fill(dayjs(vordienstzeitenVon).format('DD.MM.YYYY'))
      await page.keyboard.press('Tab')
      await page
        .locator('#vordienstzeitenBis')
        .fill(dayjs(vordienstzeitenBis).format('DD.MM.YYYY'))
      await page.keyboard.press('Tab')

      await page.getByTestId('vwochenstunden').fill(workingHours)

      await page.getByTestId('firma').fill(companyName)

      await page.getByTestId('vertragsart').selectOption('Fix')

      await page
        .getByTestId('nachweis')
        .setInputFiles(path.join(__dirname, './test-files/arbeitsnachweis.pdf'))
      await page.getByTestId('vordienstzeit-save-button').click()
      await page
        .getByTestId('vordienstzeiten-form-modal')
        .waitFor({ state: 'hidden' })

      await expect(page.locator('td', { hasText: companyName })).toBeVisible()
      await expect(
        page.locator('td', {
          hasText: `${dayjs(vordienstzeitenVon).format('DD.MM.YYYY')} - ${dayjs(vordienstzeitenBis).format('DD.MM.YYYY')}`,
        })
      ).toBeVisible()
      await expect(
        page.locator('td', { hasText: workingHours }).first()
      ).toBeVisible()
    })

    // Edit
    await test.step('edit Vordienstzeit', async () => {
      page
        .locator('tr', { hasText: companyName })
        .getByTestId('vordienstzeit-edit-button')
        .click()

      await page.waitForTimeout(1000)
      await page
        .getByTestId('vordienstzeiten-form-headline')
        .waitFor({ state: 'visible' })

      await page.getByTestId('vertragsart').selectOption('Werkvertrag')

      await expect(page.getByTestId('firma')).toHaveValue(companyName)
      await page.getByTestId('firma').fill(companyName2)
      await page
        .locator('#vordienstzeitenVon')
        .fill(dayjs(vordienstzeitenVon2).format('DD.MM.YYYY'))
      await page.keyboard.press('Tab')
      await page
        .locator('#vordienstzeitenBis')
        .fill(dayjs(vordienstzeitenBis2).format('DD.MM.YYYY'))
      await page.keyboard.press('Tab')
      await page.getByTestId('vwochenstunden').fill(workingHours2)

      await page.getByTestId('vordienstzeit-save-button').click()
      await page
        .getByTestId('vordienstzeiten-form-modal')
        .waitFor({ state: 'hidden' })

      await expect(page.locator('td', { hasText: companyName2 })).toBeVisible()
      await expect(
        page.locator('td', {
          hasText: `${dayjs(vordienstzeitenVon2).format('DD.MM.YYYY')} - ${dayjs(vordienstzeitenBis2).format('DD.MM.YYYY')}`,
        })
      ).toBeVisible()
      await expect(
        page.locator('td', { hasText: workingHours2 }).first()
      ).toBeVisible()
    })

    // Delete
    await test.step('delete Vordienstzeit', async () => {
      page
        .locator('tr', { hasText: companyName2 })
        .getByTestId('vordienstzeit-delete-button')
        .click()

      await expect(
        page.getByTestId('vordienstzeit-delete-confirm-button')
      ).toBeVisible()

      await page.getByTestId('vordienstzeit-delete-confirm-button').click()
      await expect(
        page.getByTestId('vordienstzeit-delete-confirm-button')
      ).toBeHidden()
      await expect(
        page.locator('td', { hasText: companyName2 })
      ).not.toBeVisible()
    })
  })

  test('should enter, edit and delete unterhaltsberechtigte successfully', async ({
    page,
  }) => {
    const firstname = faker.person.firstName()
    const firstname2 = faker.person.firstName()
    const lastname = faker.person.lastName()
    const lastname2 = faker.person.lastName()

    const birthday = dayjs(
      faker.date.between({ from: '2000-01-01', to: '2012-01-01' })
    ).format('YYYY-MM-DD')
    const birthday2 = dayjs(
      faker.date.between({ from: '2000-01-01', to: '2012-01-01' })
    ).format('YYYY-MM-DD')

    const svnr = `0000${dayjs(birthday).format('DDMMYY')}`
    const svnr2 = `0000${dayjs(birthday2).format('DDMMYY')}`

    // Create
    await test.step('enter Unterhaltsberechtigte data into form', async () => {
      await page
        .getByTestId('unterhaltsberechtigt-create-button')
        .waitFor({ state: 'visible' })

      await test.step('enter unterhaltsberechtigte data into form', async () => {
        await page.getByTestId('unterhaltsberechtigt-create-button').click()
        await page
          .getByTestId('unterhaltsberechtigt-form-headline')
          .waitFor({ state: 'visible' })

        await page.getByTestId('uvorname').fill(firstname)
        await page.getByTestId('unachname').fill(lastname)
        await page.getByTestId('usvnr').fill(svnr)
        await page.locator('#ugeburtsdatum').fill(birthday)

        await page.getByTestId('uverwandtschaft').click()
        await page.getByTestId('uverwandtschaft').selectOption('Enkelkind')

        await page.getByTestId('unterhaltsberechtigt-save-button').click()
        await page
          .getByTestId('unterhaltsberechtigte-form-modal')
          .waitFor({ state: 'hidden' })

        await expect(page.locator('td', { hasText: firstname })).toBeVisible()
        await expect(page.locator('td', { hasText: lastname })).toBeVisible()
        await expect(page.locator('td', { hasText: svnr })).toBeVisible()
        await expect(
          page.locator('td', { hasText: dayjs(birthday).format('DD.MM.YYYY') })
        ).toBeVisible()
        await expect(
          page.locator('td', { hasText: 'Enkelkind' }).first()
        ).toBeVisible()
        await expect(
          page.locator('td', { hasText: getAgeAsString(birthday) }).first()
        ).toBeVisible()
      })

      // Edit
      await test.step('edit Unterhaltsberechtigte', async () => {
        page
          .locator('tr', { hasText: svnr })
          .getByTestId('unterhaltsberechtigt-edit-button')
          .click()

        await page
          .getByTestId('unterhaltsberechtigt-form-headline')
          .waitFor({ state: 'visible' })

        await page.getByTestId('uvorname').fill(firstname2)
        await page.getByTestId('unachname').fill(lastname2)
        await page.getByTestId('usvnr').fill(svnr2)
        await page.locator('#ugeburtsdatum').fill(birthday2)
        await page.keyboard.press('Tab')

        await page.getByTestId('uverwandtschaft').click()
        await page.getByTestId('uverwandtschaft').selectOption('Partner')

        await page.getByTestId('unterhaltsberechtigt-save-button').click()
        await page
          .getByTestId('unterhaltsberechtigte-form-modal')
          .waitFor({ state: 'hidden' })

        await expect(page.locator('td', { hasText: firstname2 })).toBeVisible()
        await expect(page.locator('td', { hasText: lastname2 })).toBeVisible()
        await expect(page.locator('td', { hasText: svnr2 })).toBeVisible()
        await expect(
          page.locator('td', {
            hasText: dayjs(birthday2).format('DD.MM.YYYY'),
          })
        ).toBeVisible()
        await expect(
          page.locator('td', { hasText: getAgeAsString(birthday2) }).first()
        ).toBeVisible()
      })

      // Delete
      await test.step('delete Unterhaltsberechtigte', async () => {
        page
          .locator('tr', { hasText: svnr2 })
          .getByTestId('unterhaltsberechtigt-delete-button')
          .click()

        await expect(
          page.getByTestId('unterhaltsberechtigt-delete-confirm-button')
        ).toBeVisible()

        await page
          .getByTestId('unterhaltsberechtigt-delete-confirm-button')
          .click()
        await expect(
          page.getByTestId('unterhaltsberechtigt-delete-confirm-button')
        ).toBeHidden()
        await expect(page.locator('td', { hasText: svnr2 })).not.toBeVisible()
      })
    })
  })
})
