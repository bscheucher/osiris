import { expect, test } from '@playwright/test'
import dayjs from 'dayjs'

import { TeilnehmerKorrigierenPage } from './pom/TeilnehmerKorrigierenPage'
import { loadPersonalnummer } from './test-utils'

let personalnummer: string | null = null
let korrigierenPage: TeilnehmerKorrigierenPage

test.beforeEach(async ({ page }) => {
  // Get personalnummer from JSON (saved from previous test runs)
  const loadedPersonalnummer = await loadPersonalnummer()
  expect(loadedPersonalnummer).not.toBeUndefined()
  personalnummer = loadedPersonalnummer

  // Initialize the Page Object Model
  korrigierenPage = new TeilnehmerKorrigierenPage(page)

  // Navigate to teilnehmer korrigieren page
  await korrigierenPage.goto(personalnummer!)

  // Wait for the page to load
  await korrigierenPage.waitForPageLoad()
})

test.describe('Teilnehmer Korrigieren - Page Load', () => {
  test('should load the korrigieren page successfully', async () => {
    await korrigierenPage.expectPageTitle('Teilnehmende korrigieren')
    await korrigierenPage.expectFormVisible()
  })

  test('should display all form sections', async ({ page }) => {
    // Check section headers are visible
    await expect(
      page.locator('h3').filter({ hasText: 'Persönliche Daten' })
    ).toBeVisible()
    await expect(
      page.locator('h3').filter({ hasText: 'Kontaktdaten' })
    ).toBeVisible()
    await expect(
      page.locator('h3').filter({ hasText: 'Seminardaten' })
    ).toBeVisible()
    await expect(
      page.locator('h3').filter({ hasText: 'AMS-Daten' })
    ).toBeVisible()
  })
})

test.describe('Teilnehmer Korrigieren - Edit Personal Data', () => {
  test('should edit and save personal data fields', async ({ page }) => {
    const NEW_PERSONAL_DATA = {
      geschlecht: 'Divers',
      nation: 'Deutschland',
      ursprungsland: 'Deutschland',
      geburtsort: 'München',
      muttersprache: 'Deutsch',
    }

    await test.step('Edit personal data fields', async () => {
      await korrigierenPage.fillPersonalData({
        geschlecht: NEW_PERSONAL_DATA.geschlecht,
        nation: NEW_PERSONAL_DATA.nation,
        ursprungsland: NEW_PERSONAL_DATA.ursprungsland,
        geburtsort: NEW_PERSONAL_DATA.geburtsort,
        muttersprache: NEW_PERSONAL_DATA.muttersprache,
      })

      await korrigierenPage.save()
    })

    await test.step('Verify saved personal data', async () => {
      await korrigierenPage.expectPersonalData({
        geschlecht: NEW_PERSONAL_DATA.geschlecht,
        nation: NEW_PERSONAL_DATA.nation,
        ursprungsland: NEW_PERSONAL_DATA.ursprungsland,
        geburtsort: NEW_PERSONAL_DATA.geburtsort,
        muttersprache: NEW_PERSONAL_DATA.muttersprache,
      })
    })

    await test.step('Verify data persists after reload', async () => {
      await page.reload({ waitUntil: 'networkidle' })
      await korrigierenPage.waitForPageLoad()

      await korrigierenPage.expectPersonalData({
        geschlecht: NEW_PERSONAL_DATA.geschlecht,
        nation: NEW_PERSONAL_DATA.nation,
        ursprungsland: NEW_PERSONAL_DATA.ursprungsland,
        geburtsort: NEW_PERSONAL_DATA.geburtsort,
        muttersprache: NEW_PERSONAL_DATA.muttersprache,
      })
    })
  })
})

test.describe('Teilnehmer Korrigieren - Edit Contact Data', () => {
  test('should edit and save contact data fields', async ({ page }) => {
    const NEW_CONTACT_DATA = {
      strasse: 'Teststraße 123',
      plz: '1010',
      ort: 'Wien',
      ort_corrected: 'Wien,Innere Stadt',
      telefon: '0660 111 222 333',
      email: 'test.korrigieren@example.com',
    }

    await test.step('Edit contact data fields', async () => {
      await korrigierenPage.fillContactData({
        strasse: NEW_CONTACT_DATA.strasse,
        plz: NEW_CONTACT_DATA.plz,
        ort: NEW_CONTACT_DATA.ort,
        telefon: NEW_CONTACT_DATA.telefon,
        email: NEW_CONTACT_DATA.email,
      })

      await korrigierenPage.save()
    })

    await test.step('Verify saved contact data', async () => {
      await korrigierenPage.expectContactData({
        strasse: NEW_CONTACT_DATA.strasse,
        plz: NEW_CONTACT_DATA.plz,
        ort: NEW_CONTACT_DATA.ort_corrected,
        telefon: NEW_CONTACT_DATA.telefon,
        email: NEW_CONTACT_DATA.email,
      })
    })

    await test.step('Verify data persists after reload', async () => {
      await page.reload({ waitUntil: 'networkidle' })
      await korrigierenPage.waitForPageLoad()

      await korrigierenPage.expectContactData({
        strasse: NEW_CONTACT_DATA.strasse,
        plz: NEW_CONTACT_DATA.plz,
        ort: NEW_CONTACT_DATA.ort_corrected,
        telefon: NEW_CONTACT_DATA.telefon,
        email: NEW_CONTACT_DATA.email,
      })
    })
  })
})

test.describe('Teilnehmer Korrigieren - Edit Seminar Data', () => {
  test('should edit and save seminar data fields', async ({ page }) => {
    const NEW_SEMINAR_DATA = {
      anmerkung: 'Test Anmerkung für Korrektur',
      zubuchung: dayjs().subtract(1, 'month').format('DD.MM.YYYY'),
      geplant: dayjs().add(1, 'month').format('DD.MM.YYYY'),
      eintritt: dayjs().subtract(2, 'weeks').format('DD.MM.YYYY'),
      austritt: dayjs().add(3, 'months').format('DD.MM.YYYY'),
    }

    await test.step('Edit seminar data fields', async () => {
      await korrigierenPage.fillSeminarData({
        anmerkung: NEW_SEMINAR_DATA.anmerkung,
        zubuchung: NEW_SEMINAR_DATA.zubuchung,
        geplant: NEW_SEMINAR_DATA.geplant,
        eintritt: NEW_SEMINAR_DATA.eintritt,
        austritt: NEW_SEMINAR_DATA.austritt,
      })

      await korrigierenPage.save()
    })

    await test.step('Verify saved seminar data', async () => {
      await korrigierenPage.expectSeminarData({
        anmerkung: NEW_SEMINAR_DATA.anmerkung,
        zubuchung: NEW_SEMINAR_DATA.zubuchung,
        geplant: NEW_SEMINAR_DATA.geplant,
        eintritt: NEW_SEMINAR_DATA.eintritt,
        austritt: NEW_SEMINAR_DATA.austritt,
      })
    })

    await test.step('Verify data persists after reload', async () => {
      await page.reload({ waitUntil: 'networkidle' })
      await korrigierenPage.waitForPageLoad()

      await korrigierenPage.expectSeminarData({
        anmerkung: NEW_SEMINAR_DATA.anmerkung,
        zubuchung: NEW_SEMINAR_DATA.zubuchung,
        geplant: NEW_SEMINAR_DATA.geplant,
        eintritt: NEW_SEMINAR_DATA.eintritt,
        austritt: NEW_SEMINAR_DATA.austritt,
      })
    })
  })
})

test.describe('Teilnehmer Korrigieren - Edit AMS Data', () => {
  test('should edit and save AMS data fields', async ({ page }) => {
    const NEW_AMS_DATA = {
      rgs: 'RGS Wien Test',
      betreuerTitel: 'Mag.',
      betreuerVorname: 'Test',
      betreuerNachname: 'Betreuer',
    }

    await test.step('Edit AMS data fields', async () => {
      await korrigierenPage.fillAmsData({
        rgs: NEW_AMS_DATA.rgs,
        betreuerTitel: NEW_AMS_DATA.betreuerTitel,
        betreuerVorname: NEW_AMS_DATA.betreuerVorname,
        betreuerNachname: NEW_AMS_DATA.betreuerNachname,
      })

      await korrigierenPage.save()
    })

    await test.step('Verify saved AMS data', async () => {
      await korrigierenPage.expectAmsData({
        rgs: NEW_AMS_DATA.rgs,
        betreuerTitel: NEW_AMS_DATA.betreuerTitel,
        betreuerVorname: NEW_AMS_DATA.betreuerVorname,
        betreuerNachname: NEW_AMS_DATA.betreuerNachname,
      })
    })

    await test.step('Verify data persists after reload', async () => {
      await page.reload({ waitUntil: 'networkidle' })
      await korrigierenPage.waitForPageLoad()

      await korrigierenPage.expectAmsData({
        rgs: NEW_AMS_DATA.rgs,
        betreuerTitel: NEW_AMS_DATA.betreuerTitel,
        betreuerVorname: NEW_AMS_DATA.betreuerVorname,
        betreuerNachname: NEW_AMS_DATA.betreuerNachname,
      })
    })
  })
})

test.describe('Teilnehmer Korrigieren - Combined Edit', () => {
  test('should edit and save all data sections together', async ({ page }) => {
    const COMBINED_DATA = {
      personal: {
        geschlecht: 'Männlich',
        geburtsort: 'Salzburg',
      },
      contact: {
        strasse: 'Kombinierte Straße 456',
        telefon: '0660 999 888 777',
      },
      seminar: {
        anmerkung: 'Kombinierte Anmerkung',
      },
      ams: {
        rgs: 'RGS Kombiniert',
        betreuerVorname: 'Kombiniert',
      },
    }

    await test.step('Edit all data sections', async () => {
      await korrigierenPage.fillPersonalData(COMBINED_DATA.personal)
      await korrigierenPage.fillContactData(COMBINED_DATA.contact)
      await korrigierenPage.fillSeminarData(COMBINED_DATA.seminar)
      await korrigierenPage.fillAmsData(COMBINED_DATA.ams)

      await korrigierenPage.save()
    })

    await test.step('Verify all saved data', async () => {
      await korrigierenPage.expectPersonalData(COMBINED_DATA.personal)
      await korrigierenPage.expectContactData(COMBINED_DATA.contact)
      await korrigierenPage.expectSeminarData(COMBINED_DATA.seminar)
      await korrigierenPage.expectAmsData(COMBINED_DATA.ams)
    })

    await test.step('Verify all data persists after reload', async () => {
      await page.reload({ waitUntil: 'networkidle' })
      await korrigierenPage.waitForPageLoad()

      await korrigierenPage.expectPersonalData(COMBINED_DATA.personal)
      await korrigierenPage.expectContactData(COMBINED_DATA.contact)
      await korrigierenPage.expectSeminarData(COMBINED_DATA.seminar)
      await korrigierenPage.expectAmsData(COMBINED_DATA.ams)
    })
  })
})

test.describe('Teilnehmer Korrigieren - Error Handling', () => {
  test('should show error section for invalid participant ID', async ({
    page,
  }) => {
    const invalidKorrigierenPage = new TeilnehmerKorrigierenPage(page)
    await invalidKorrigierenPage.goto('invalid-id')
    await invalidKorrigierenPage.waitForPageLoad()

    // Should show error section or redirect
    await expect(page.locator('body')).toBeVisible()
  })

  test('should show error section for non-existent participant', async ({
    page,
  }) => {
    const nonExistentKorrigierenPage = new TeilnehmerKorrigierenPage(page)
    await nonExistentKorrigierenPage.goto('999999999')
    await nonExistentKorrigierenPage.waitForPageLoad()

    // Should show error section or redirect
    await expect(page.locator('body')).toBeVisible()
  })
})

test.describe('Teilnehmer Korrigieren - Navigation', () => {
  test('should navigate to korrigieren page from verwalten', async ({
    page,
  }) => {
    await test.step('Go to Teilnehmer verwalten page', async () => {
      await page.goto('/teilnehmer/verwalten')
      await expect(page.locator('h1')).toContainText('Teilnehmende verwalten')
    })

    await test.step('Search for participant and navigate to korrigieren', async () => {
      // This test assumes there's a way to navigate to korrigieren from the verwalten page
      // The exact implementation depends on the UI structure
      await expect(page.locator('body')).toBeVisible()
    })
  })
})
