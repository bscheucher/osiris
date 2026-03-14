'use client'

import { LinkIcon, PlusIcon } from '@heroicons/react/20/solid'
import dayjs from 'dayjs'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { twMerge } from 'tailwind-merge'

import { BlockingAwareLink } from '@/components/atoms/blocking-aware-link'
import ButtonTw from '@/components/atoms/button-tw'
import LoaderTw, { LoaderSize } from '@/components/atoms/loader-tw'
import {
  FieldChangeItem,
  getTranslatedTitleWithFallback,
} from '@/components/molecules/field-changes'
import useAsyncEffect from '@/hooks/use-async-effect'
import { ROLE } from '@/lib/constants/role-constants'
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
  const t = useTranslations('mitarbeiter.bearbeiten.zusatz')
  const tMitarbeiter = useTranslations('mitarbeiter')
  const tGeneral = useTranslations('common')
  const { hasSomeRole } = useUserStore()

  const { personalnummer } = useParams<{ personalnummer: string }>()
  const [isLoading, setIsLoading] = useState(true)
  const [zusatzLog, setZusatzLog] = useState<ZusatzActivity[] | null>(null)

  useAsyncEffect(async () => {
    if (personalnummer) {
      try {
        const { data } = await executeGET<{
          vertragsenderungenChangeLog: ZusatzActivity[]
        }>(`/change-log/vertragsaenderungen?personalnummer=${personalnummer}`)

        if (data?.vertragsenderungenChangeLog) {
          setZusatzLog(data.vertragsenderungenChangeLog)
        }
      } catch (e) {
        showErrorMessage(e)
      } finally {
        setIsLoading(false)
      }
    }
  }, [])

  if (!zusatzLog || isLoading) {
    return (
      <div className="flex min-h-48 items-center justify-center">
        <LoaderTw size={LoaderSize.XLarge} />
      </div>
    )
  }

  return (
    <>
      {hasSomeRole(ROLE.MA_VERTRAGSAENDERUNG_STARTEN) && (
        <div className="mb-8 flex">
          <ButtonTw
            href={`/mitarbeiter/vertragsaenderungen/anlegen/${personalnummer}`}
            className="flex h-12 items-center gap-1"
          >
            <PlusIcon className="h-6 w-6" />
            {t('label.neuerZusatz')}
          </ButtonTw>
        </div>
      )}
      {!zusatzLog.length ? (
        <div className="flex min-h-48 items-center justify-center">
          <p>{tGeneral('label.noEntries')}</p>
        </div>
      ) : (
        <ul role="list" className="space-y-6">
          {zusatzLog.map((zusatzEntry, zusatzEntryIndex) => (
            <li key={zusatzEntry.id} className="relative flex gap-x-4">
              <div
                className={twMerge(
                  zusatzEntryIndex === zusatzLog.length - 1
                    ? 'h-6'
                    : '-bottom-6',
                  'absolute top-0 left-0 flex w-6 justify-center'
                )}
              >
                <div className="w-px bg-gray-200" />
              </div>

              <div className="relative flex size-6 flex-none items-center justify-center bg-white">
                <div className="size-1.5 rounded-full bg-gray-100 ring-1 ring-gray-300" />
              </div>
              <div className="flex flex-auto flex-col gap-2 text-sm/6 text-gray-500">
                <div className="flex flex-auto gap-4">
                  <span className="text-lg text-gray-900">
                    {t('label.zusatzVom')}
                    <time dateTime={zusatzEntry.createdAt} className="ml-1">
                      {dayjs(zusatzEntry.createdAt).format('DD.MM.YYYY, HH:MM')}
                    </time>
                  </span>
                  <BlockingAwareLink
                    href={`/mitarbeiter/vertragsaenderungen/${zusatzEntry.id}?wfi=43`}
                    className="text-ibis-blue hover:text-ibis-blue-dark flex items-center gap-2 hover:underline"
                  >
                    <LinkIcon className="size-5" />
                    {t('label.bearbeiten')}
                  </BlockingAwareLink>
                </div>
                <div className="flex gap-2 pl-4">
                  <div className="font-semibold">{t('label.gueltigAb')}</div>
                  <time dateTime={zusatzEntry.gueltigAb}>
                    {dayjs(zusatzEntry.gueltigAb).format('DD.MM.YYYY, HH:MM')}
                  </time>
                </div>
                {/* <div className="flex gap-2 pl-4">
                  <div className="font-semibold">
                    {t('label.linkZumDokument')}
                  </div>
                  <Link
                    href={'#'}
                    className="flex items-center gap-2 text-ibis-blue hover:text-ibis-blue-dark hover:underline"
                  >
                    <ArrowTopRightOnSquareIcon className="size-5" />
                    {t('label.vorschauOeffnen')}
                  </Link>
                </div> */}
                {zusatzEntry.comment && (
                  <div className="flex gap-2 pl-4">
                    <div className="font-semibold">{t('label.bemerkung')}</div>
                    <p className="text-md/7 text-gray-500">
                      &quot;{zusatzEntry.comment}&quot;
                    </p>
                  </div>
                )}
                {!!zusatzEntry.fieldChanges?.length && (
                  <div className="block pl-4">
                    <div className="font-semibold">
                      {t('label.aenderungen')}
                    </div>
                    <ul className="my-2 list-disc pl-6">
                      {zusatzEntry.fieldChanges?.map((change) => (
                        <FieldChangeItem
                          key={change.fieldName}
                          change={change}
                          title={getTranslatedTitleWithFallback(
                            tMitarbeiter,
                            `erfassen.vertragsdaten.label`,
                            change.fieldName
                          )}
                        />
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

export default Page
