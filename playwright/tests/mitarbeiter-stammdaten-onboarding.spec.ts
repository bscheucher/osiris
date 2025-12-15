import { test, expect } from '@playwright/test'
import { Faker, de } from '@faker-js/faker'
import dayjs from 'dayjs'
import path from 'path'
import { MitarbeiterStammdatenErfassenPage } from '../pages/mitarbeiter-stammdaten-erfassen.page'

// Initialize Faker with German locale
const faker = new Faker({ locale: [de] })

/**
 * Example test suite for Mitarbeiter Stammdaten Erfassen using Page Object Model
 *
 * This test demonstrates how to use the MitarbeiterStammdatenErfassenPage POM
 * to test the employee onboarding personal data form.
 */

// TODO: Replace with actual employee number or load from storage
const TEST_PERSONALNUMMER = '12345'

test.describe('Mitarbeiter Stammdaten Erfassen - Using POM', () => {
  let stammdatenPage: MitarbeiterStammdatenErfassenPage

  test.beforeEach(async ({ page }) => {
    stammdatenPage = new MitarbeiterStammdatenErfassenPage(page)
  })

  test('should navigate to Stammdaten page and display form', async ({ page }) => {
    await test.step('navigate to stammdaten form', async () => {
      await stammdatenPage.goto(TEST_PERSONALNUMMER, 3)
    })

    await test.step('verify page loaded correctly', async () => {
      await expect(stammdatenPage.pageTitle).toBeVisible()
      await expect(stammdatenPage.saveButton).toBeVisible()
    })
  })

  test('should show validation errors when saving empty form', async ({ page }) => {
    await test.step('navigate to stammdaten form', async () => {
      await stammdatenPage.goto(TEST_PERSONALNUMMER, 3)
    })

    await test.step('save form without filling data', async () => {
      await stammdatenPage.save()
    })

    await test.step('verify all required field errors are visible', async () => {
      await stammdatenPage.verifyRequiredFieldErrors()
    })

    await test.step('verify workflow shows error status', async () => {
      await stammdatenPage.verifyWorkflowError()
    })
  })

  test('should successfully fill and save all Personendaten', async ({ page }) => {
    await test.step('navigate to stammdaten form', async () => {
      await stammdatenPage.goto(TEST_PERSONALNUMMER, 3)
    })

    await test.step('fill Personendaten section', async () => {
      await stammdatenPage.fillPersonendaten({
        anrede: 'Herr',
        geschlecht: 'männlich',
        vorname: faker.person.firstName(),
        nachname: faker.person.lastName(),
        staatsbuergerschaft: 'Österreich',
        svnr: '1234567890',
        geburtsDatum: dayjs(faker.date.birthdate({ min: 18, max: 65, mode: 'age' })).format('DD.MM.YYYY'),
        ecardPath: path.join(__dirname, '../test-files/ecard.png'),
      })
    })

    await test.step('verify ecard uploaded successfully', async () => {
      await expect(stammdatenPage.ecardFilename).toContainText('ecard.png')
    })

    await test.step('verify success toast appears', async () => {
      await stammdatenPage.verifySuccessToast()
    })
  })

  test('should successfully fill and save all Kontaktdaten', async ({ page }) => {
    await test.step('navigate to stammdaten form', async () => {
      await stammdatenPage.goto(TEST_PERSONALNUMMER, 3)
    })

    await test.step('fill Kontaktdaten section', async () => {
      await stammdatenPage.fillKontaktdaten({
        strasse: 'Testgasse 1',
        plz: '1070',
        ort: 'Wien',
        land: 'Österreich',
        email: faker.internet.email(),
        mobilnummer: faker.phone.number({ style: 'international' }),
        handySignatur: true,
      })
    })

    await test.step('save the form', async () => {
      await stammdatenPage.save()
    })

    await test.step('verify contact data errors are hidden', async () => {
      await expect(stammdatenPage.strasseError).toBeHidden()
      await expect(stammdatenPage.plzError).toBeHidden()
      await expect(stammdatenPage.ortError).toBeHidden()
      await expect(stammdatenPage.landError).toBeHidden()
      await expect(stammdatenPage.emailError).toBeHidden()
      await expect(stammdatenPage.mobilnummerError).toBeHidden()
    })
  })

  test('should successfully fill and save all Bankdaten', async ({ page }) => {
    await test.step('navigate to stammdaten form', async () => {
      await stammdatenPage.goto(TEST_PERSONALNUMMER, 3)
    })

    await test.step('fill Bankdaten section', async () => {
      await stammdatenPage.fillBankdaten({
        bank: 'UNICREDIT BANK AUSTRIA AG',
        iban: 'AT021200000703447144',
        bic: 'BKAUATWW',
        bankcardPath: path.join(__dirname, '../test-files/debitkarte.jpg'),
      })
    })

    await test.step('verify bankcard uploaded successfully', async () => {
      await expect(stammdatenPage.bankcardFilename).toContainText('debitkarte.jpg')
    })

    await test.step('verify success toast appears', async () => {
      await stammdatenPage.verifySuccessToast()
    })
  })

  test('should successfully fill complete form and mark workflow as complete', async ({ page }) => {
    await test.step('navigate to stammdaten form', async () => {
      await stammdatenPage.goto(TEST_PERSONALNUMMER, 3)
    })

    await test.step('fill complete form with all required data', async () => {
      await stammdatenPage.fillCompleteForm({
        personendaten: {
          anrede: 'Herr',
          geschlecht: 'männlich',
          vorname: faker.person.firstName(),
          nachname: faker.person.lastName(),
          staatsbuergerschaft: 'Österreich',
          svnr: '1234567890',
          geburtsDatum: dayjs(faker.date.birthdate({ min: 18, max: 65, mode: 'age' })).format('DD.MM.YYYY'),
          ecardPath: path.join(__dirname, '../test-files/ecard.png'),
        },
        kontaktdaten: {
          strasse: 'Testgasse 1',
          plz: '1070',
          ort: 'Wien',
          land: 'Österreich',
          email: faker.internet.email(),
          mobilnummer: faker.phone.number({ style: 'international' }),
          handySignatur: true,
        },
        bankdaten: {
          bank: 'UNICREDIT BANK AUSTRIA AG',
          iban: 'AT021200000703447144',
          bic: 'BKAUATWW',
          bankcardPath: path.join(__dirname, '../test-files/debitkarte.jpg'),
        },
        arbeitsbereitschaft: ['Wien', 'Niederösterreich', 'Burgenland'],
      })
    })

    await test.step('verify no validation errors remain', async () => {
      await stammdatenPage.verifyNoRequiredFieldErrors()
    })

    await test.step('verify workflow marked as complete', async () => {
      await stammdatenPage.verifyWorkflowCompleted()
    })
  })

  test('should fill alternative address when provided', async ({ page }) => {
    await test.step('navigate to stammdaten form', async () => {
      await stammdatenPage.goto(TEST_PERSONALNUMMER, 3)
    })

    await test.step('fill alternative address', async () => {
      await stammdatenPage.fillAlternativeAddress({
        astrasse: 'Alternative Straße 99',
        aplz: '2340',
        aort: 'Mödling',
        aland: 'Österreich',
      })
    })

    await test.step('save the form', async () => {
      await stammdatenPage.save()
    })

    await test.step('verify form saved successfully', async () => {
      await stammdatenPage.verifySuccessToast()
    })
  })

  test('should fill work permit for non-EU citizens', async ({ page }) => {
    await test.step('navigate to stammdaten form', async () => {
      await stammdatenPage.goto(TEST_PERSONALNUMMER, 3)
    })

    await test.step('fill work permit information', async () => {
      await stammdatenPage.fillArbeitsgenehmigung({
        arbeitsgenehmigungDokPath: path.join(__dirname, '../test-files/arbeitsgenehmigung.jpg'),
        arbeitsgenehmigung: 'Rot-Weiß-Rot Karte',
        gueltigBis: dayjs().add(2, 'year').format('DD.MM.YYYY'),
      })
    })

    await test.step('verify work permit document uploaded', async () => {
      await expect(stammdatenPage.arbeitsgenehmigungDokFilename).toContainText('arbeitsgenehmigung.jpg')
    })
  })

  test('should select multiple Austrian states for work readiness', async ({ page }) => {
    await test.step('navigate to stammdaten form', async () => {
      await stammdatenPage.goto(TEST_PERSONALNUMMER, 3)
    })

    await test.step('select work readiness states', async () => {
      await stammdatenPage.setArbeitsbereitschaft([
        'Wien',
        'Niederösterreich',
        'Oberösterreich',
        'Burgenland',
        'Steiermark',
      ])
    })

    await test.step('verify checkboxes are checked', async () => {
      await expect(stammdatenPage.wienCheckbox).toBeChecked()
      await expect(stammdatenPage.niederoesterreichCheckbox).toBeChecked()
      await expect(stammdatenPage.oberoesterreichCheckbox).toBeChecked()
      await expect(stammdatenPage.burgenlandCheckbox).toBeChecked()
      await expect(stammdatenPage.steiermarkCheckbox).toBeChecked()
    })

    await test.step('verify other states remain unchecked', async () => {
      await expect(stammdatenPage.kaerntenCheckbox).not.toBeChecked()
      await expect(stammdatenPage.salzburgCheckbox).not.toBeChecked()
      await expect(stammdatenPage.tirolCheckbox).not.toBeChecked()
      await expect(stammdatenPage.vorarlbergCheckbox).not.toBeChecked()
    })
  })
})
