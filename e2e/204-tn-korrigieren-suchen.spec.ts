import { expect, test } from '@playwright/test'

import { TeilnehmerKorrigierenSuchenPage } from './pom/teilnehmer-korrigieren-suchen.pom'
import { TN_KORRIGIEREN_IDS } from './private/tn-korrigieren-data'
import { URLMatcher } from './test-utils'

// Test data for teilnehmer with errors (fehlerhaft)
const SELECTED_TN = TN_KORRIGIEREN_IDS[0]

test.describe('Teilnehmer Korrigieren Suchen Page', () => {
  test('should display page and filter components correctly', async ({
    page,
  }) => {
    const korrigierenPage = new TeilnehmerKorrigierenSuchenPage(page)

    await test.step('navigate to korrigieren page', async () => {
      await korrigierenPage.goto()
      await korrigierenPage.expectPageTitle('Teilnehmende korrigieren')
    })

    await test.step('open filters and verify all filter fields are visible', async () => {
      await korrigierenPage.openFilters()
      await korrigierenPage.expectFiltersVisible()
    })

    await test.step('verify massnahmennummer filter is available (korrigieren specific)', async () => {
      await expect(korrigierenPage.massnahmennummerSelect).toBeVisible()
    })
  })

  test('search and filter teilnehmer with errors', async ({ page }) => {
    const korrigierenPage = new TeilnehmerKorrigierenSuchenPage(page)
    const { vorname, nachname, seminarId, svNummer } = SELECTED_TN

    await test.step('navigate to korrigieren page', async () => {
      await korrigierenPage.goto()
      await korrigierenPage.expectPageTitle()
    })

    await test.step('open filters', async () => {
      await korrigierenPage.openFilters()
      await korrigierenPage.expectFiltersVisible()
    })

    await test.step('filter by seminar and search', async () => {
      await korrigierenPage.selectSeminar(seminarId)
      await korrigierenPage.searchAndWaitForResults()

      await korrigierenPage.expectTableVisible()
      await korrigierenPage.expectTeilnehmerInTable(vorname, nachname)

      await korrigierenPage.expectURL({
        pathname: '/teilnehmer/korrigieren',
        searchParams: {
          page: '1',
          seminarName: seminarId,
        },
      })
    })

    await test.step('reset form and verify table is hidden', async () => {
      await korrigierenPage.resetForm()
      await korrigierenPage.expectTableNotVisible()
    })
  })

  test('search by name and verify results', async ({ page }) => {
    const korrigierenPage = new TeilnehmerKorrigierenSuchenPage(page)
    const { vorname, nachname, seminarId } = SELECTED_TN

    await test.step('navigate to korrigieren page', async () => {
      await korrigierenPage.goto()
    })

    await test.step('open filters', async () => {
      await korrigierenPage.openFilters()
    })

    await test.step('search by name and filter by seminar', async () => {
      await korrigierenPage.fillSearchInput(nachname)
      await korrigierenPage.selectSeminar(seminarId)
      await korrigierenPage.searchAndWaitForResults()

      await korrigierenPage.expectTableVisible()
      await korrigierenPage.expectTeilnehmerInTable(vorname, nachname)

      await korrigierenPage.expectURL({
        pathname: '/teilnehmer/korrigieren',
        searchParams: {
          page: '1',
          identifiersString: nachname,
          seminarName: seminarId,
        },
      })
    })

    await test.step('reset form', async () => {
      await korrigierenPage.resetForm()
    })
  })

  test('search by SVNR', async ({ page }) => {
    const korrigierenPage = new TeilnehmerKorrigierenSuchenPage(page)
    const { vorname, nachname, svNummer } = SELECTED_TN

    await test.step('navigate to korrigieren page', async () => {
      await korrigierenPage.goto()
    })

    await test.step('search by social security number', async () => {
      await korrigierenPage.fillSearchInput(svNummer)
      await korrigierenPage.searchAndWaitForResults()

      await korrigierenPage.expectTableVisible()
      await korrigierenPage.expectTeilnehmerInTable(vorname, nachname)

      await korrigierenPage.expectURL({
        pathname: '/teilnehmer/korrigieren',
        searchParams: {
          page: '1',
          identifiersString: svNummer,
        },
      })
    })

    await test.step('reset form', async () => {
      await korrigierenPage.resetForm()
    })
  })

  test('search for non-existent user shows empty results', async ({ page }) => {
    const korrigierenPage = new TeilnehmerKorrigierenSuchenPage(page)
    const nonExistentName = 'ZZZZNONEXISTENT12345'

    await test.step('navigate to korrigieren page', async () => {
      await korrigierenPage.goto()
    })

    await test.step('search for non-existent user', async () => {
      await korrigierenPage.fillSearchInput(nonExistentName)
      await korrigierenPage.searchAndWaitForEmptyResults()

      await korrigierenPage.expectTableNotVisible()
      await korrigierenPage.expectEmptyResults()

      await korrigierenPage.expectURL({
        pathname: '/teilnehmer/korrigieren',
        searchParams: {
          page: '1',
          identifiersString: nonExistentName,
        },
      })
    })

    await test.step('reset form', async () => {
      await korrigierenPage.resetForm()
    })
  })

  test('verify error column is displayed for teilnehmer', async ({ page }) => {
    const korrigierenPage = new TeilnehmerKorrigierenSuchenPage(page)
    const { seminarId, vorname } = SELECTED_TN

    await test.step('navigate to korrigieren page', async () => {
      await korrigierenPage.goto()
    })

    await test.step('open filters and search', async () => {
      await korrigierenPage.openFilters()
      await korrigierenPage.selectSeminar(seminarId)
      await korrigierenPage.searchAndWaitForResults()
    })

    await test.step('verify error column is visible for teilnehmer', async () => {
      await korrigierenPage.expectTableVisible()
      await korrigierenPage.expectRowHasError(vorname)
    })
  })

  test('navigate to edit page from search results', async ({ page }) => {
    const korrigierenPage = new TeilnehmerKorrigierenSuchenPage(page)
    const { seminarId, vorname } = SELECTED_TN

    await test.step('navigate to korrigieren page and search', async () => {
      await korrigierenPage.goto()
      await korrigierenPage.openFilters()
      await korrigierenPage.selectSeminar(seminarId)
      await korrigierenPage.searchAndWaitForResults()
    })

    await test.step('click edit link and navigate to edit page', async () => {
      await korrigierenPage.navigateToEditPage(vorname)

      await expect(page).toHaveURL(/\/teilnehmer\/korrigieren\/[a-f0-9-]+/)
      await expect(page.locator('h1')).toContainText('Teilnehmende korrigieren')
    })
  })

  test('filter by project', async ({ page }) => {
    const korrigierenPage = new TeilnehmerKorrigierenSuchenPage(page)
    const { projectName, vorname, nachname } = SELECTED_TN

    await test.step('navigate to korrigieren page', async () => {
      await korrigierenPage.goto()
    })

    await test.step('open filters and filter by project', async () => {
      await korrigierenPage.openFilters()
      await korrigierenPage.selectProject(projectName)
      await korrigierenPage.searchAndWaitForResults()

      await korrigierenPage.expectTableVisible()
      await korrigierenPage.expectTeilnehmerInTable(vorname, nachname)

      await korrigierenPage.expectURL({
        pathname: '/teilnehmer/korrigieren',
        searchParams: {
          page: '1',
          projectName: projectName,
        },
      })
    })

    await test.step('reset form', async () => {
      await korrigierenPage.resetForm()
    })
  })

  test('filter by massnahmennummer', async ({ page }) => {
    const korrigierenPage = new TeilnehmerKorrigierenSuchenPage(page)
    const { massnahmennummer, vorname, nachname } = SELECTED_TN

    await test.step('navigate to korrigieren page', async () => {
      await korrigierenPage.goto()
    })

    await test.step('open filters and filter by massnahmennummer', async () => {
      await korrigierenPage.openFilters()
      await korrigierenPage.selectMassnahmennummer(massnahmennummer)
      await korrigierenPage.searchAndWaitForResults()

      await korrigierenPage.expectTableVisible()
      await korrigierenPage.expectTeilnehmerInTable(vorname, nachname)

      await korrigierenPage.expectURL({
        pathname: '/teilnehmer/korrigieren',
        searchParams: {
          page: '1',
          massnahmennummer: massnahmennummer,
        },
      })
    })

    await test.step('reset form', async () => {
      await korrigierenPage.resetForm()
    })
  })

  test('combined filters: project, seminar and search term', async ({
    page,
  }) => {
    const korrigierenPage = new TeilnehmerKorrigierenSuchenPage(page)
    const { projectName, seminarId, vorname, nachname } = SELECTED_TN

    await test.step('navigate to korrigieren page', async () => {
      await korrigierenPage.goto()
    })

    await test.step('apply multiple filters and search', async () => {
      await korrigierenPage.openFilters()
      await korrigierenPage.fillSearchInput(nachname)
      await korrigierenPage.selectProject(projectName)
      await korrigierenPage.selectSeminar(seminarId)
      await korrigierenPage.searchAndWaitForResults()

      await korrigierenPage.expectTableVisible()
      await korrigierenPage.expectTeilnehmerInTable(vorname, nachname)

      await korrigierenPage.expectURL({
        pathname: '/teilnehmer/korrigieren',
        searchParams: {
          page: '1',
          identifiersString: nachname,
          projectName: projectName,
          seminarName: seminarId,
        },
      })
    })

    await test.step('reset form', async () => {
      await korrigierenPage.resetForm()
    })
  })
})
