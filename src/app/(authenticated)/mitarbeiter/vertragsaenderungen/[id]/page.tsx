'use client'

import { useParams, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import React, { useState } from 'react'

import DatenVervollstaendigen from '../views/daten-vervollstaendigen'
import GenehmigerPrueft from '../views/genehmiger-prueft'
import LohnverrechnungPrueft from '../views/lohnverrechnung-prueft'
import PeoplePrueft from '../views/people-prueft'
import UnterschriftenlaufStarten from '../views/unterschriftenlauf-starten'
import ZurPruefungVorlegen from '../views/zur-pruefung-vorlegen'
import LoaderTw, { LoaderSize } from '@/components/atoms/loader-tw'
import { PermissionWrapper } from '@/components/molecules/permission-wrapper'
import NavigatorTw from '@/components/organisms/navigator-tw'
import { ROLE } from '@/lib/constants/role-constants'
import { WorkflowItem } from '@/lib/interfaces/workflow'

const Page = () => {
  const t = useTranslations('mitarbeiterVertragsaenderungen.detail')
  const { id } = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const wfiSearchParam = searchParams.get('wfi') || ''
  const [workflowItems, setWorkflowItems] = useState<WorkflowItem[]>([])

  const getStepByWfi = () => {
    switch (parseInt(wfiSearchParam)) {
      case 43:
        return (
          <PermissionWrapper
            rolesToCheck={ROLE.MA_VERTRAGSAENDERUNG_DATENVERVOLLSTAENDIGEN}
          >
            <DatenVervollstaendigen
              vertragsdatenAenderungId={id}
              setWorkflowItems={setWorkflowItems}
            />
          </PermissionWrapper>
        )
      case 45:
        return (
          <PermissionWrapper
            rolesToCheck={ROLE.MA_VERTRAGSAENDERUNG_DATENVERVOLLSTAENDIGEN}
          >
            <ZurPruefungVorlegen
              vertragsdatenAenderungId={id}
              setWorkflowItems={setWorkflowItems}
            />
          </PermissionWrapper>
        )
      case 47:
        return (
          <PermissionWrapper
            rolesToCheck={ROLE.MA_VERTRAGSAENDERUNG_PRUEFEN_PEOPLE}
          >
            <PeoplePrueft
              vertragsdatenAenderungId={id}
              setWorkflowItems={setWorkflowItems}
            />
          </PermissionWrapper>
        )
      case 49:
        return (
          <PermissionWrapper
            rolesToCheck={ROLE.MA_VERTRAGSAENDERUNG_PRUEFEN_LOHNVERRECHNUNG}
          >
            <LohnverrechnungPrueft
              vertragsdatenAenderungId={id}
              setWorkflowItems={setWorkflowItems}
            />
          </PermissionWrapper>
        )
      case 51:
        return (
          <PermissionWrapper
            rolesToCheck={ROLE.MA_VERTRAGSAENDERUNG_PRUEFEN_GENEHMIGENDEN}
          >
            <GenehmigerPrueft
              vertragsdatenAenderungId={id}
              setWorkflowItems={setWorkflowItems}
            />
          </PermissionWrapper>
        )
      case 52:
        return (
          <PermissionWrapper
            rolesToCheck={ROLE.MA_VERTRAGSAENDERUNG_DATENVERVOLLSTAENDIGEN}
          >
            <UnterschriftenlaufStarten
              vertragsdatenAenderungId={id}
              setWorkflowItems={setWorkflowItems}
            />
          </PermissionWrapper>
        )
      default: {
        return `WFI ${parseInt(wfiSearchParam)}`
      }
    }
  }

  return (
    <div className="2xl:max-w-8xl container mx-auto max-w-6xl">
      <div className="mb-8 flex justify-between">
        <h1 className="block text-3xl font-semibold tracking-tight text-gray-900">
          {t('labels.zusatz')}
        </h1>
      </div>
      <div className="flex bg-white shadow sm:rounded-lg">
        <div
          id="navigator-container"
          className="flex-[0_0_260px] border-r border-gray-200 p-8 pr-6 xl:flex-[0_0_320px]"
          data-testid="navigator-container"
        >
          {workflowItems.length ? (
            <NavigatorTw workflowItems={workflowItems} />
          ) : (
            <div className="z-50 flex h-[450px] w-full items-center justify-center">
              <LoaderTw size={LoaderSize.XLarge} />
            </div>
          )}
        </div>
        <div className="relative flex-1 p-8">{getStepByWfi()}</div>
      </div>
    </div>
  )
}

export default Page
