import { useTranslations } from 'next-intl'
import React, { ReactNode, useEffect, useState } from 'react'

import Loader from '@/components/atoms/loader'
import SubtitleComponent from '@/components/atoms/subtitle'
import { BasicProjectDto } from '@/lib/interfaces/dtos'
import {
  Forecast,
  Revenue,
} from '@/lib/interfaces/project-controlling/project-controlling-table-data'
import { formatMoneyNumber, formatNumber } from '@/lib/utils/number-utils'
import { showErrorMessage } from '@/lib/utils/toast-utils'
import {
  getFromToDate,
  getProjectData,
  getProjectForecast,
} from '@/lib/utils/widget-utils'

export interface ProjectControllingForm {
  from: null | Date
  to: null | Date
  dirty: boolean
  error: string
  selectedDropDown: string
  isFuture: boolean
  isActive: boolean
  projects: BasicProjectDto[]
  index: number
}

export default function ProjectControllingTable({
  form,
  isForecast,
  preview,
  showSollStunden,
}: {
  form: ProjectControllingForm
  isForecast?: boolean
  preview?: boolean
  showSollStunden?: boolean
}) {
  const t = useTranslations('dashboard.projectControllingDaten')
  const [isLoading, setIsLoading] = useState(false)
  const [projectData, setProjectData] = useState<Partial<
    Revenue & Forecast
  > | null>(null)
  useEffect(() => {
    if (form.projects.length == 0 || form.error.length > 0) {
      return setProjectData(null)
    }
    setIsLoading(true)
    let promise = null
    const [from, to] = getFromToDate(form)
    if (isForecast) {
      if ((from == null || to == null) && !(from == null && to == null)) {
        return setIsLoading(false)
      }
      promise = getProjectForecast(form.projects[form.index].projektNumber)
    } else {
      if (from == null || to == null) {
        return setIsLoading(false)
      }
      promise = getProjectData(
        form.projects[form.index].projektNumber,
        from,
        to,
        form.selectedDropDown == 'PEOT',
        form.selectedDropDown == 'TDEOP'
      )
    }
    promise
      .then((data) => {
        // we still have data, user didnt quick-change while we have a call
        if (form.projects.length > 0 && form.projects[form.index]) {
          setProjectData(data)
        } else {
          setProjectData(null)
        }
      })
      .catch((error) => {
        setProjectData(null)
        showErrorMessage(error)
      })
      .finally(() => setIsLoading(false))
  }, [form])

  // TODO: fix all as any AND ts-ignore!!
  return (
    <div className={'basis-[250px] ' + 'overflow-hidden'}>
      <h2 className="text-lg">
        {isForecast ? (
          <SubtitleComponent subtitle={t('subtitle')} />
        ) : (
          <>
            {t('projekt')}:{' '}
            <span className="text-ibis-blue">
              {form.projects[form.index]?.project}
            </span>
          </>
        )}
      </h2>
      {preview ? (
        <b>{t('text.preview')}</b>
      ) : isLoading ? (
        <Loader />
      ) : form?.projects?.length == 0 ? (
        <b>{t('text.noData')}</b>
      ) : (
        <div className={`table-container relative max-h-[450px]`}>
          <table className="z-0 min-w-full border border-x-0 border-t-0 border-slate-200 bg-white">
            <thead className="bg-gray-50">
              <tr className="text-center">
                <Th width={30} />
                {showSollStunden && <Th width={22}>{t('soll')}</Th>}
                <Th width={22}>{t('plan')}</Th>
                <Th width={22}>{isForecast ? t('forecast') : t('ist')}</Th>
              </tr>
            </thead>
            <tbody>
              <Tr width={30}>
                <Td right={false}>{t('stunden')}</Td>
                {showSollStunden && (
                  <Td>{formatNumber(projectData?.sollStunden)}</Td>
                )}
                <Td>{formatNumber(projectData?.planStunden)}</Td>
                <Td>
                  {formatNumber(
                    isForecast
                      ? projectData?.forecastStunden
                      : projectData?.istStunden
                  )}
                </Td>
              </Tr>
              <Tr width={30}>
                <Td right={false}>{t('umsatz')}</Td>
                {showSollStunden && (
                  <Td n={projectData?.sollUmsatz}>
                    {formatMoneyNumber(projectData?.sollUmsatz)}
                  </Td>
                )}
                <Td n={projectData?.planUmsatz}>
                  {formatMoneyNumber(projectData?.planUmsatz)}
                </Td>
                <Td
                  n={
                    isForecast
                      ? projectData?.forecastUmsatz
                      : projectData?.istUmsatz
                  }
                >
                  {formatMoneyNumber(
                    isForecast
                      ? projectData?.forecastUmsatz
                      : projectData?.istUmsatz
                  )}
                </Td>
              </Tr>
              {isForecast && (
                <Tr width={22}>
                  <Td right={false}>{t('abweichungSoll')}</Td>
                  <Td />
                  <Td n={projectData?.abweichungSollPlan}>
                    {formatMoneyNumber(projectData?.abweichungSollPlan)}
                  </Td>
                  <Td
                    n={
                      isForecast
                        ? projectData?.abweichungSollForecast
                        : projectData?.abweichungSollIst
                    }
                  >
                    {formatMoneyNumber(
                      isForecast
                        ? projectData?.abweichungSollForecast
                        : projectData?.abweichungSollIst
                    )}
                  </Td>
                </Tr>
              )}
              <Tr width={22}>
                <Td right={false}>{t('abweichungPlan')}</Td>
                <Td></Td>
                {isForecast && <Td></Td>}
                <Td
                  n={
                    isForecast
                      ? projectData?.abweichungPlanForecast
                      : projectData?.abweichungPlanIst
                  }
                >
                  {formatMoneyNumber(
                    isForecast
                      ? projectData?.abweichungPlanForecast
                      : projectData?.abweichungPlanIst
                  )}
                </Td>
              </Tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function Th({ children }: { width: number; children?: ReactNode }) {
  return (
    <th className="sticky top-0 z-10 border-b bg-gray-50 px-4 py-2 font-bold">
      {children}
    </th>
  )
}

function Tr({ children }: { width: number; children?: ReactNode }) {
  return <tr className="border-b text-sm">{children}</tr>
}

function Td({
  right = true,
  children,
  n,
}: {
  right?: boolean
  children?: ReactNode
  n?: number
}) {
  const negative = (n ?? 1) < 0
  let clasName = 'px-4 py-2 '
  if (right) {
    clasName += 'text-right '
  }
  if (negative) {
    clasName += 'text-red'
  }
  return <td className={clasName}>{children}</td>
}
