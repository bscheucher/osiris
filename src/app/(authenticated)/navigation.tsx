'use client'

import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react'
import {
  ArrowsRightLeftIcon,
  ArrowUpCircleIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  ChevronRightIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  DocumentTextIcon,
  FolderIcon,
  FolderPlusIcon,
  HomeIcon,
  ListBulletIcon,
  PencilIcon,
  PresentationChartBarIcon,
  UserMinusIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline'
import { useMsal } from '@azure/msal-react'
import dayjs from 'dayjs'
import { useTranslations } from 'next-intl'
import React, { ReactNode } from 'react'

import NavigationLink from '@/app/(authenticated)/navigation-link'
import ButtonTw from '@/components/atoms/button-tw'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { ROLE } from '@/lib/constants/role-constants'
import { showErrorMessage } from '@/lib/utils/toast-utils'
import useUserStore from '@/stores/user-store'

const DisclosureSection = ({
  name,
  children,
  openNavigationItems,
  handleDisclosureChange,
}: {
  name: string
  children: ReactNode
  openNavigationItems: string[]
  handleDisclosureChange: (name: string, isOpen: boolean) => void
}) => {
  const t = useTranslations('navigation')

  return (
    <Disclosure defaultOpen={openNavigationItems.includes(name)} as="li">
      {({ open }) => (
        <>
          <DisclosureButton
            className="group hover:text-ibis-blue mt-6 flex cursor-pointer items-center justify-between gap-x-3 rounded-md px-3 py-2 text-sm leading-6 font-semibold text-gray-500 hover:bg-gray-50"
            as="div"
            onClick={() => handleDisclosureChange(name, open)}
            data-testid={`nav-group-${name}`}
          >
            {t(`${name}.label`)}
            <ChevronRightIcon
              aria-hidden="true"
              className="h-6 w-6 shrink-0 p-1 text-gray-400 group-data-[open]:rotate-90 group-data-[open]:text-gray-500"
            />
          </DisclosureButton>
          <DisclosurePanel as="ul">{children}</DisclosurePanel>
        </>
      )}
    </Disclosure>
  )
}

const Navigation: React.FC = () => {
  const t = useTranslations('navigation')
  const { instance } = useMsal()
  const { roles, user, hasSomeRole } = useUserStore()

  const [openNavigationItems, setOpenNavigationItems] = useLocalStorage<
    string[]
  >('openNavigationItems', [])

  const handleDisclosureChange = (name: string, isOpen: boolean) => {
    setOpenNavigationItems((prev) => {
      if (!isOpen) {
        return prev.includes(name) ? prev : [...prev, name]
      } else {
        return prev.filter((item) => item !== name)
      }
    })
  }

  const handleLogout = async () => {
    try {
      // Call backend logout endpoint
      await fetch(`${process.env.NEXT_PUBLIC_GATEWAY_URL}/benutzer/logout`, {
        cache: 'no-store',
      }).catch(() => {})

      // Logout from MSAL
      await instance.logoutRedirect({
        postLogoutRedirectUri: '/login',
      })
    } catch (e) {
      showErrorMessage(e)
    }
  }

  return (
    <nav className="flex flex-1 flex-col gap-y-7">
      {!!roles && (
        <ul role="list">
          <NavigationLink
            href="/dashboard"
            Icon={(props) => <HomeIcon {...props} />}
          >
            {t('dashboard')}
          </NavigationLink>

          {hasSomeRole([
            ROLE.AB_EIGENE_ABWESENHEITEN_LESEN,
            ROLE.AB_ABWESENHEITEN_EDITIEREN,
            ROLE.AB_UEBERSTUNDEN_AUSZAHLUNG,
            ROLE.MA_ZEITEN_LESEN,
            ROLE.MA_UNTERLAGEN_LESEN,
            ROLE.MA_LEISTUNGEN_ERFASSEN,
          ]) && (
            <DisclosureSection
              name="meinBereich"
              openNavigationItems={openNavigationItems}
              handleDisclosureChange={handleDisclosureChange}
            >
              <>
                <NavigationLink
                  href="/mein-bereich/urlaubskonto"
                  Icon={(props) => <ListBulletIcon {...props} />}
                  isVisible={hasSomeRole(ROLE.AB_EIGENE_ABWESENHEITEN_LESEN)}
                >
                  {t('meinBereich.urlaub')}
                </NavigationLink>
                <NavigationLink
                  href="/mein-bereich/meine-abwesenheiten"
                  Icon={(props) => <CalendarDaysIcon {...props} />}
                  isVisible={hasSomeRole(ROLE.AB_EIGENE_ABWESENHEITEN_LESEN)}
                >
                  {t('meinBereich.abwesenheit')}
                </NavigationLink>
                <NavigationLink
                  href="/mein-bereich/umbuchung"
                  Icon={(props) => <ArrowsRightLeftIcon {...props} />}
                  isVisible={hasSomeRole(ROLE.AB_UEBERSTUNDEN_AUSZAHLUNG)}
                >
                  {t('meinBereich.umbuchung')}
                </NavigationLink>
                <NavigationLink
                  href="/mein-bereich/meine-zeiten"
                  Icon={(props) => <ClockIcon {...props} />}
                  isVisible={hasSomeRole(ROLE.MA_ZEITEN_LESEN)}
                  testId="mitarbeiter-meine-zeiten"
                >
                  {t('meinBereich.meineZeiten')}
                </NavigationLink>
                <NavigationLink
                  href="/mein-bereich/personalakt"
                  Icon={(props) => <FolderIcon {...props} />}
                  isVisible={hasSomeRole(ROLE.MA_UNTERLAGEN_LESEN)}
                  testId="meinBereich-personalakt"
                >
                  {t('meinBereich.personalakt')}
                </NavigationLink>
                <NavigationLink
                  href="/mein-bereich/leistungen-erfassen"
                  Icon={(props) => <ChartBarIcon {...props} />}
                  isVisible={hasSomeRole(ROLE.MA_LEISTUNGEN_ERFASSEN)}
                  testId="leistungen-erfassen"
                >
                  {t('mitarbeiter.leistungenErfassen')}
                </NavigationLink>
              </>
            </DisclosureSection>
          )}

          {hasSomeRole([ROLE.AB_ABWESENHEITEN_GENEHMIGEN]) && (
            <DisclosureSection
              name="meineMitarbeiter"
              openNavigationItems={openNavigationItems}
              handleDisclosureChange={handleDisclosureChange}
            >
              <NavigationLink
                href="/meine-mitarbeiter/abwesenheiten?status=VALID"
                Icon={(props) => <ClipboardDocumentCheckIcon {...props} />}
                isVisible={hasSomeRole([ROLE.AB_ABWESENHEITEN_GENEHMIGEN])}
              >
                {t('meineMitarbeiter.abwesenheitenGenehmigen')}
              </NavigationLink>
            </DisclosureSection>
          )}

          {hasSomeRole([
            ROLE.TN_ONBOARDING,
            ROLE.TN_LESEN,
            ROLE.TEILNEHMER_DATEN_KORRIGIEREN,
            ROLE.TN_AUSTRITT,
            ROLE.TN_AN_ABWESENHEITEN_UEBERTRAGEN,
            ROLE.TN_TR_ANWESENHEITEN_LESEN,
            ROLE.TN_TR_ANWESENHEITEN_VERWALTEN,
            ROLE.TN_ADMIN_ANWESENHEITEN_LESEN,
            ROLE.TN_ADMIN_ANWESENHEITEN_VERWALTEN,
          ]) && (
            <DisclosureSection
              name="teilnehmer"
              openNavigationItems={openNavigationItems}
              handleDisclosureChange={handleDisclosureChange}
            >
              <>
                <NavigationLink
                  href="/teilnehmer/korrigieren?page=1"
                  Icon={(props) => <PencilIcon {...props} />}
                  isVisible={hasSomeRole(ROLE.TEILNEHMER_DATEN_KORRIGIEREN)}
                >
                  {t('teilnehmer.korrigieren.label')}
                </NavigationLink>
                <NavigationLink
                  href="/teilnehmer/onboarding"
                  Icon={(props) => <FolderPlusIcon {...props} />}
                  isVisible={hasSomeRole(ROLE.TN_ONBOARDING)}
                  testId="teilnehmer-onboarding"
                >
                  {t('teilnehmer.onboarding')}
                </NavigationLink>
                <NavigationLink
                  href="/teilnehmer/verwalten?page=1&isActive=true"
                  Icon={(props) => <ListBulletIcon {...props} />}
                  isVisible={hasSomeRole(ROLE.TN_LESEN)}
                  testId="teilnehmer-verwalten"
                >
                  {t('teilnehmer.verwalten')}
                </NavigationLink>
                <NavigationLink
                  href="/teilnehmer/austritte"
                  Icon={(props) => <UserMinusIcon {...props} />}
                  isVisible={hasSomeRole(ROLE.TN_AUSTRITT)}
                >
                  {t('teilnehmer.austritte.label')}
                </NavigationLink>
                <NavigationLink
                  href="/teilnehmer/abwesenheiten-uebertragen"
                  Icon={(props) => <ArrowUpCircleIcon {...props} />}
                  isVisible={hasSomeRole(ROLE.TN_AN_ABWESENHEITEN_UEBERTRAGEN)}
                >
                  {t('teilnehmer.uebertragen')}
                </NavigationLink>
                <NavigationLink
                  href={`/teilnehmer/anwesenheiten-verwalten?kursEndeFrom=${dayjs().subtract(1, 'month').format('YYYY-MM-DD')}`}
                  Icon={(props) => <CalendarDaysIcon {...props} />}
                  isVisible={hasSomeRole([
                    ROLE.TN_TR_ANWESENHEITEN_LESEN,
                    ROLE.TN_TR_ANWESENHEITEN_VERWALTEN,
                    ROLE.TN_ADMIN_ANWESENHEITEN_LESEN,
                    ROLE.TN_ADMIN_ANWESENHEITEN_VERWALTEN,
                  ])}
                >
                  {t('teilnehmer.anwesenheitenVerwalten')}
                </NavigationLink>
              </>
            </DisclosureSection>
          )}

          {hasSomeRole([
            ROLE.MA_VERTRAGSAENDERUNG_UEBERSICHT,
            ROLE.MA_STAMMDATEN_ERFASSEN,
            ROLE.MA_ONBOARDING,
            ROLE.MA_ONBOARDING_EIGENE,
            ROLE.MA_VERWALTEN_SUCHEN,
            ROLE.MA_VEREINBARUNGEN_EINSEHEN,
            ROLE.MA_ALLE_VEREINBARUNGEN_EINSEHEN,
          ]) && (
            <DisclosureSection
              name="mitarbeiter"
              openNavigationItems={openNavigationItems}
              handleDisclosureChange={handleDisclosureChange}
            >
              <>
                <NavigationLink
                  href="/mitarbeiter/erfassen"
                  Icon={(props) => <UserPlusIcon {...props} />}
                  isVisible={hasSomeRole([ROLE.MA_STAMMDATEN_ERFASSEN])}
                  testId="mitarbeiter-erfassen"
                >
                  {t('mitarbeiter.erfassen')}
                </NavigationLink>

                <NavigationLink
                  href="/mitarbeiter/onboarding"
                  Icon={(props) => <FolderPlusIcon {...props} />}
                  isVisible={hasSomeRole([
                    ROLE.MA_ONBOARDING,
                    ROLE.MA_ONBOARDING_EIGENE,
                  ])}
                  testId="mitarbeiter-onboarding"
                >
                  {t('mitarbeiter.onboarding')}
                </NavigationLink>
                <NavigationLink
                  href="/mitarbeiter/verwalten"
                  Icon={(props) => <ListBulletIcon {...props} />}
                  isVisible={hasSomeRole(ROLE.MA_VERWALTEN_SUCHEN)}
                  testId="mitarbeiter-verwalten"
                >
                  {t('mitarbeiter.verwalten')}
                </NavigationLink>
                <NavigationLink
                  href="/mitarbeiter/vertragsaenderungen?status=OPEN"
                  Icon={(props) => <PencilIcon {...props} />}
                  isVisible={hasSomeRole(ROLE.MA_VERTRAGSAENDERUNG_UEBERSICHT)}
                  testId="mitarbeiter-vertragsaenderungen"
                >
                  {t('mitarbeiter.vertragsaenderungen')}
                </NavigationLink>

                <NavigationLink
                  href="/mitarbeiter/vereinbarungen"
                  Icon={(props) => <DocumentTextIcon {...props} />}
                  isVisible={hasSomeRole([
                    ROLE.MA_VEREINBARUNGEN_EINSEHEN,
                    ROLE.MA_ALLE_VEREINBARUNGEN_EINSEHEN,
                  ])}
                  testId="mitarbeiter-vereinbarungen"
                >
                  {t('mitarbeiter.vereinbarungen')}
                </NavigationLink>
              </>
            </DisclosureSection>
          )}

          {hasSomeRole([ROLE.FN_REPORTS]) && (
            <DisclosureSection
              name="reports"
              openNavigationItems={openNavigationItems}
              handleDisclosureChange={handleDisclosureChange}
            >
              <NavigationLink
                href="/reports"
                Icon={(props) => <PresentationChartBarIcon {...props} />}
                isVisible={hasSomeRole([ROLE.FN_REPORTS])}
              >
                {t('reports.basisReports')}
              </NavigationLink>
            </DisclosureSection>
          )}

          {hasSomeRole([ROLE.FN_SEMINARE]) && (
            <DisclosureSection
              name="seminare"
              openNavigationItems={openNavigationItems}
              handleDisclosureChange={handleDisclosureChange}
            >
              <NavigationLink
                href="/vertretungsplanung"
                Icon={(props) => <CalendarDaysIcon {...props} />}
                isVisible={hasSomeRole([ROLE.FN_SEMINARE])}
              >
                {t('seminare.vertretungsplanung')}
              </NavigationLink>
            </DisclosureSection>
          )}
        </ul>
      )}
      <div className="mt-auto mb-6 text-sm leading-6 font-normal text-gray-900">
        <div className="flex flex-col items-center gap-2 text-lg">
          {user?.fullName && <span className="mb-2">{user?.fullName}</span>}
          <ButtonTw
            className="w-full"
            onClick={() => handleLogout()}
            testId="abmelden"
          >
            {t('abmelden.label')}
          </ButtonTw>
        </div>
      </div>
    </nav>
  )
}

export default Navigation
