'use client'

import { ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { useTranslations } from 'use-intl'

import ButtonTw from '@/components/atoms/button-tw'
import { TeilnehmerResult } from '@/lib/interfaces/teilnehmer'
import { getSearchParamsObject } from '@/lib/utils/form-utils'
import { fetchGatewayRaw, toQueryString } from '@/lib/utils/gateway-utils'
import { executeGET } from '@/lib/utils/gateway-utils'
import { downloadFileFromStream } from '@/lib/utils/object-utils'
import { showErrorMessage } from '@/lib/utils/toast-utils'

const PAGE_SIZE_MAX = 9999

export const TeilnehmerDownloadButton = () => {
  const t = useTranslations('teilnehmer.verwalten')
  const [isDownloadLoading, setIsDownloadLoading] = useState<boolean>(false)

  const searchParams = useSearchParams()
  const { searchParamsObject, hasSearchParams } =
    getSearchParamsObject(searchParams)

  const downloadAllTeilnehmer = async () => {
    if (hasSearchParams) {
      setIsDownloadLoading(true)
      try {
        // get all teilnehmer for filter selection
        const { data } = await executeGET<{
          teilnehmerSummary: TeilnehmerResult[]
        }>(
          `/teilnehmer/getTeilnehmerFilterSummaryDto${toQueryString({
            sortDirection: 'ASC',
            ...searchParamsObject,
            page: 0,
            size: PAGE_SIZE_MAX,
          })}`
        )

        // check if data type was returned correctly
        if (data?.teilnehmerSummary) {
          const teilnehmerIds = data.teilnehmerSummary.map(
            (teilnehmer) => teilnehmer.id
          )
          const response = await fetchGatewayRaw(`/file/downloadTeilnehmers`, {
            method: 'POST',
            body: JSON.stringify(teilnehmerIds),
          })

          await downloadFileFromStream(response)
        } else {
          throw new Error('Keine Daten gefunden')
        }
      } catch (e) {
        showErrorMessage(e)
      } finally {
        setIsDownloadLoading(false)
      }
    }
  }

  return (
    <ButtonTw
      onClick={downloadAllTeilnehmer}
      className="flex h-12 min-w-[240px] items-center justify-center gap-2"
      type="button"
      testId="download-all-button"
      isLoading={isDownloadLoading}
    >
      {t('label.downloadButton')}
      <ArrowDownTrayIcon className="size-5" />
    </ButtonTw>
  )
}
