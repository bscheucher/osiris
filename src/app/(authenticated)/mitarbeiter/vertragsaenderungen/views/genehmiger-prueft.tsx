'use client'

import { useTranslations } from 'next-intl'

import PruefenForm, { PruefenAction, PruefenUserType } from './pruefen-form'
import { WorkflowItem } from '@/lib/interfaces/workflow'
import { showInfo, showSuccess } from '@/lib/utils/toast-utils'

export default function GenehmigerPrueft({
  setWorkflowItems,
  vertragsdatenAenderungId,
}: {
  setWorkflowItems: React.Dispatch<React.SetStateAction<WorkflowItem[]>>
  vertragsdatenAenderungId: string
}) {
  const t = useTranslations('mitarbeiterVertragsaenderungen.detail')

  const onSave = (action: PruefenAction) => {
    if (action === PruefenAction.save) {
      showInfo(t('labels.saveSuccess'))
    }
    if (action === PruefenAction.decline) {
      showInfo(t('labels.declineSuccess'))
    }
    if (action === PruefenAction.accept) {
      showSuccess(t('labels.acceptSuccess'))
    }
  }

  return (
    <div className="grid grid-cols-2 gap-x-8 gap-y-8">
      <h2 className="col-span-2 text-2xl font-semibold tracking-tight text-gray-900">
        {t('labels.genehmigerPrueft')}
      </h2>
      <PruefenForm
        setWorkflowItems={setWorkflowItems}
        vertragsdatenAenderungId={vertragsdatenAenderungId}
        userType={PruefenUserType.genehmigender}
        saveCallback={onSave}
        isReadOnly
      />
    </div>
  )
}
