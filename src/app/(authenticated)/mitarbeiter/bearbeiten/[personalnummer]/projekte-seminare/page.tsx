'use client'

import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import LoaderTw, { LoaderSize } from '@/components/atoms/loader-tw'
import InfoSectionTw from '@/components/molecules/info-section-tw'
import {
  TableCellTw,
  TableHeaderTw,
  TableTw,
} from '@/components/molecules/table-tw'
import useAsyncEffect from '@/hooks/use-async-effect'
import { ROLE } from '@/lib/constants/role-constants'
import {
  MitarbeiterProjekt,
  MitarbeiterSeminar,
} from '@/lib/interfaces/mitarbeiter'
import { executeGET } from '@/lib/utils/gateway-utils'
import { showErrorMessage } from '@/lib/utils/toast-utils'
import useUserStore from '@/stores/user-store'

export interface ZusatzActivity {
  id: string
  createdAt: string
  gueltigAb?: string
  antragssteller?: string
  comment?: string
  fieldChanges?: {
    fieldName: string
    oldValue: string
    newValue: string
  }[]
}

const Page = () => {
  const t = useTranslations('mitarbeiter.bearbeiten.projekteSeminare')
  const tTeilnehmer = useTranslations('teilnehmer.bearbeiten')
  const { hasSomeRole } = useUserStore()

  const { personalnummer } = useParams<{ personalnummer: string }>()
  const [seminarData, setSeminarData] = useState<MitarbeiterSeminar[]>([])
  const [projectData, setProjectData] = useState<MitarbeiterProjekt[]>([])

  const [isLoading, setIsLoading] = useState(true)

  useAsyncEffect(async () => {
    if (personalnummer) {
      try {
        const { data: seminarData } = await executeGET<{
          trainerSeminar: MitarbeiterSeminar[]
        }>(`/mitarbeiter/seminars/${personalnummer}`)

        if (seminarData?.trainerSeminar) {
          setSeminarData(seminarData.trainerSeminar)
        }

        const { data: projectData } = await executeGET<{
          managerProjekt: MitarbeiterProjekt[]
        }>(`/mitarbeiter/projects/${personalnummer}`)

        if (projectData?.managerProjekt) {
          setProjectData(projectData.managerProjekt)
        }
      } catch (e) {
        showErrorMessage(e)
      } finally {
        setIsLoading(false)
      }
    }
  }, [])

  if (isLoading) {
    return (
      <div className="flex min-h-48 items-center justify-center">
        <LoaderTw size={LoaderSize.XLarge} />
      </div>
    )
  }

  if (!hasSomeRole(ROLE.MA_PROJEKTE_SEMINARE_LESEN)) {
    return <InfoSectionTw description={t('label.noRoleDescription')} />
  }

  return (
    <div className="grid grid-cols-12 gap-x-8 gap-y-8">
      <div className="col-span-12">
        <h3 className="mb-6 text-base leading-7 font-semibold text-gray-900">
          {t('label.projekte')}
        </h3>
        <div className="bg-white shadow sm:rounded-md">
          <TableTw className="flex-auto">
            <thead className="bg-gray-50">
              <tr>
                <TableHeaderTw className="whitespace-nowrap">
                  {tTeilnehmer('label.projektId')}
                </TableHeaderTw>
                <TableHeaderTw className="whitespace-nowrap">
                  {tTeilnehmer('label.projektbezeichnung')}
                </TableHeaderTw>
                <TableHeaderTw className="whitespace-nowrap">
                  {tTeilnehmer('label.startDate')}
                </TableHeaderTw>
                <TableHeaderTw className="whitespace-nowrap">
                  {tTeilnehmer('label.endDate')}
                </TableHeaderTw>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {projectData.map((project, index) => (
                <tr key={index}>
                  <TableCellTw>{project.projectId}</TableCellTw>
                  <TableCellTw>{project.bezeichnung}</TableCellTw>
                  <TableCellTw className="whitespace-nowrap">
                    {project.startDate}
                  </TableCellTw>
                  <TableCellTw className="whitespace-nowrap">
                    {project.endDate}
                  </TableCellTw>
                </tr>
              ))}
            </tbody>
          </TableTw>
        </div>
      </div>
      <div className="col-span-12">
        <h3 className="mb-6 text-base leading-7 font-semibold text-gray-900">
          {t('label.seminare')}
        </h3>
        <div className="bg-white shadow sm:rounded-md">
          <TableTw className="flex-auto">
            <thead className="bg-gray-50">
              <tr>
                <TableHeaderTw className="whitespace-nowrap">
                  {tTeilnehmer('label.seminarId')}
                </TableHeaderTw>
                <TableHeaderTw className="whitespace-nowrap">
                  {tTeilnehmer('label.seminarBezeichnung')}
                </TableHeaderTw>
                <TableHeaderTw className="whitespace-nowrap">
                  {tTeilnehmer('label.standort')}
                </TableHeaderTw>
                <TableHeaderTw className="whitespace-nowrap">
                  {tTeilnehmer('label.massnahmennummer')}
                </TableHeaderTw>
                <TableHeaderTw className="whitespace-nowrap">
                  {tTeilnehmer('label.startDate')}
                </TableHeaderTw>
                <TableHeaderTw className="whitespace-nowrap">
                  {tTeilnehmer('label.endDate')}
                </TableHeaderTw>
                <TableHeaderTw className="whitespace-nowrap">
                  {tTeilnehmer('label.role')}
                </TableHeaderTw>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {seminarData.map((seminar, index) => (
                <tr key={index}>
                  <TableCellTw>{seminar.seminarId}</TableCellTw>
                  <TableCellTw>{seminar.bezeichnung}</TableCellTw>
                  <TableCellTw>{seminar.standort}</TableCellTw>
                  <TableCellTw>{seminar.masnahmennummer}</TableCellTw>
                  <TableCellTw className="whitespace-nowrap">
                    {seminar.startDate}
                  </TableCellTw>
                  <TableCellTw className="whitespace-nowrap">
                    {seminar.endDate}
                  </TableCellTw>
                  <TableCellTw>{seminar.role}</TableCellTw>
                </tr>
              ))}
            </tbody>
          </TableTw>
        </div>
      </div>
    </div>
  )
}

export default Page
