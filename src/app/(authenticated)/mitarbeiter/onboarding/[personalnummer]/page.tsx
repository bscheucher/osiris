'use client'

import { useParams, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import MitarbeiterStammdatenErfassenView from './views/mitarbeiter-stammdaten-erfassen-view'
import MitarbeiterVertragsdatenErfassenView from './views/mitarbeiter-vertragsdaten-erfassen-view'
import MitarbeiterPruefenView from './views/mitarbeiterdaten-pruefen-view'
import LoaderTw, { LoaderSize } from '@/components/atoms/loader-tw'
import LohnverrechnungInformieren from '@/components/organisms/lohnverrechnung-informieren'
import NavigatorTw from '@/components/organisms/navigator-tw'
import StepPlaceholder from '@/components/organisms/step-placeholder'
import UnterschriftenlaufDurchfuehren from '@/components/organisms/unterschriftenlauf-durchfuehren'
import UnterschriftenlaufStarten from '@/components/organisms/unterschriftenlauf-starten'
import useAsyncEffect from '@/hooks/use-async-effect'
import {
  ID_TO_STEP_NAME,
  STEP_NAME,
  STEP_NAME_TO_ID,
} from '@/lib/constants/mitarbeiter-constants'
import { MitarbeiterType } from '@/lib/interfaces/mitarbeiter'
import {
  getWorkflowItemByName,
  getWorkflowItemByReferenceId,
} from '@/lib/utils/mitarbeiter/workflow-utils'
import useMasterdataStore from '@/stores/form-store'
import useOnboardingStore from '@/stores/onboarding-store'

export default function Page() {
  const { workflowItems, fetchWorkflowGroup, fetchKostenstellen } =
    useOnboardingStore()
  const { fetchMasterdata } = useMasterdataStore()
  const t = useTranslations('mitarbeiter.erfassen')
  const searchParams = useSearchParams()
  const wfiSearchParam = searchParams.get('wfi') || ''
  const { personalnummer } = useParams<{ personalnummer: string }>()

  const [isLoading, setIsLoading] = useState<boolean>(true)

  useAsyncEffect(async () => {
    // fetch current workflow group into the store
    if (personalnummer) {
      await Promise.all([
        fetchWorkflowGroup(personalnummer),
        fetchKostenstellen(personalnummer),
        fetchMasterdata(MitarbeiterType.Mitarbeiter),
      ])
    }
    // reset workflow store on page init
    setIsLoading(false)
  }, [personalnummer])

  if (isLoading) {
    return (
      <div className="flex h-[760px] items-center justify-center">
        <LoaderTw size={LoaderSize.XLarge} />
      </div>
    )
  }

  const getStepByWfi = () => {
    switch (parseInt(wfiSearchParam)) {
      case STEP_NAME_TO_ID[STEP_NAME.STAMMDATEN_ERFASSEN]:
        return (
          <MitarbeiterStammdatenErfassenView personalnummer={personalnummer} />
        )
      case STEP_NAME_TO_ID[STEP_NAME.VERTRAGSDATEN_ERFASSEN]:
        return (
          <MitarbeiterVertragsdatenErfassenView
            personalnummer={personalnummer}
          />
        )
      case STEP_NAME_TO_ID[STEP_NAME.LOHNVERRECHUNG_INFORMIEREN]:
        return (
          <LohnverrechnungInformieren
            personalnummer={personalnummer}
            workflowItem={getWorkflowItemByName(
              workflowItems,
              ID_TO_STEP_NAME[parseInt(wfiSearchParam)]
            )}
          />
        )
      case STEP_NAME_TO_ID[STEP_NAME.UNTERSCHRIFTENLAUF_STARTEN]:
        return <UnterschriftenlaufStarten personalnummer={personalnummer} />
      case STEP_NAME_TO_ID[STEP_NAME.UNTERSCHRIFTENLAUF_DURCHFUEHREN]:
        return (
          <UnterschriftenlaufDurchfuehren
            personalnummer={personalnummer}
            workflowItem={getWorkflowItemByName(
              workflowItems,
              STEP_NAME.UNTERSCHRIFTENLAUF_DURCHFUEHREN
            )}
          />
        )
      case STEP_NAME_TO_ID[STEP_NAME.MITARBEITERDATEN_PRUEFEN]:
        return <MitarbeiterPruefenView personalnummer={personalnummer} />
      default: {
        const wfi = getWorkflowItemByReferenceId(
          workflowItems,
          parseInt(wfiSearchParam)
        )
        return wfi ? (
          <StepPlaceholder
            title={wfi?.workflowItemName}
            workflowItem={wfi}
            withBackground
          />
        ) : (
          <StepPlaceholder
            title={'keinStatus'}
            workflowItem={wfi}
            withBackground
          />
        )
      }
    }
  }

  return (
    <div className="mx-auto max-w-[1600px]">
      <div className="flex gap-12">
        <div
          id="navigator-container"
          className="flex-[0_0_200px] 2xl:flex-[0_0_300px]"
          data-testid="navigator-container"
        >
          <h3 className="mb-10 text-xl" data-testid="navigator-title">
            {t('title.navigator')}
          </h3>
          {workflowItems && <NavigatorTw workflowItems={workflowItems} />}
        </div>
        <div className="flex flex-[1_1_auto] pr-6">{getStepByWfi()}</div>
      </div>
    </div>
  )
}
