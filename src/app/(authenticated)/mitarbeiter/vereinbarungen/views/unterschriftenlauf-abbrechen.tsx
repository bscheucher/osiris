'use client'

import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { MOXIS_DELAY_TIMEOUT } from '../vereinbarungen-utils'
import ButtonTw, { ButtonSize } from '@/components/atoms/button-tw'
import { Workflow } from '@/lib/interfaces/workflow'
import { waitFor } from '@/lib/utils/api-utils'
import { executeGET, executePOST } from '@/lib/utils/gateway-utils'

export default function UnterschriftenlaufAbbrechen({
  vereinbarungId,
  updateWorkflowGroup,
}: {
  vereinbarungId: string
  updateWorkflowGroup: (workflowgroup?: Workflow[]) => void
}) {
  const t = useTranslations('mitarbeiterVereinbarungen.detail')
  const { id } = useParams<{ id: string }>()
  const [isLoading, setIsLoading] = useState(false)

  const onAbort = async () => {
    setIsLoading(true)

    await executePOST<{ workflowgroup: Workflow[] }>(
      `/mitarbeiter/cancelMoxisSigningRequest?personalnummer=${id}`
    )

    // the API doesn't provide proper WFI updates
    // this is a hack
    await waitFor(MOXIS_DELAY_TIMEOUT)

    const { data } = await executeGET<{ workflowgroup: Workflow[] }>(
      `/vereinbarung/getWorkflowgroup?vereinbarungId=${vereinbarungId}`
    )

    updateWorkflowGroup(data?.workflowgroup)

    setIsLoading(false)
  }

  return (
    <div className="flex flex-col">
      <h2 className="mb-8 text-2xl font-semibold tracking-tight text-gray-900">
        {t('label.unterschriftenlaufAbbrechen')}
      </h2>
      <ButtonTw
        onClick={onAbort}
        className="w-full"
        size={ButtonSize.Large}
        isLoading={isLoading}
      >
        {t('label.unterschriftenlaufAbbrechen')}
      </ButtonTw>
    </div>
  )
}
