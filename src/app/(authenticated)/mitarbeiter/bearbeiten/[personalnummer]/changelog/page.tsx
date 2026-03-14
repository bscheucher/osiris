'use client'

import { CheckCircleIcon } from '@heroicons/react/24/solid'
import dayjs from 'dayjs'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { twMerge } from 'tailwind-merge'

import LoaderTw, { LoaderSize } from '@/components/atoms/loader-tw'
import {
  FieldChange,
  FieldChangeItem,
  getTranslatedTitleWithFallback,
} from '@/components/molecules/field-changes'
import useAsyncEffect from '@/hooks/use-async-effect'
import { executeGET } from '@/lib/utils/gateway-utils'
import { showErrorMessage } from '@/lib/utils/toast-utils'

interface ChangeLogActivity {
  id: string
  type: 'create' | 'stammdaten' | 'vertragsdaten'
  changedBy: string
  changedOn: string
  comment?: string
  fieldChanges?: FieldChange[]
}

const Page = () => {
  const t = useTranslations('mitarbeiter.bearbeiten.changelog')
  const tMitarbeiter = useTranslations('mitarbeiter')
  const tGeneral = useTranslations('common')

  const { personalnummer } = useParams<{ personalnummer: string }>()
  const [isLoading, setIsLoading] = useState(true)
  const [changeLog, setChangelog] = useState<ChangeLogActivity[] | null>(null)

  useAsyncEffect(async () => {
    if (personalnummer) {
      try {
        const { data } = await executeGET<{ maChangeLog: ChangeLogActivity[] }>(
          `/change-log/mitarbeiter?personalnummer=${personalnummer}`
        )

        if (data?.maChangeLog) {
          setChangelog(data.maChangeLog)
        }
      } catch (e) {
        showErrorMessage(e)
      } finally {
        setIsLoading(false)
      }
    }
  }, [])

  if (!changeLog || isLoading) {
    return (
      <div className="flex min-h-48 items-center justify-center">
        <LoaderTw size={LoaderSize.XLarge} />
      </div>
    )
  }

  if (!changeLog.length) {
    return (
      <div className="flex min-h-48 items-center justify-center">
        <p>{tGeneral('label.noEntries')}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <ul role="list" className="space-y-6">
        {changeLog.map((changelogEntry, changelogEntryIdx) => (
          <li key={changelogEntryIdx} className="relative flex gap-x-4">
            <div
              className={twMerge(
                changelogEntryIdx === changeLog.length - 1
                  ? 'h-6'
                  : '-bottom-6',
                'absolute top-0 left-0 flex w-6 justify-center'
              )}
            >
              <div className="w-px bg-gray-200" />
            </div>

            <div className="relative flex size-6 flex-none items-center justify-center bg-white">
              {changelogEntry.type === 'create' ? (
                <CheckCircleIcon
                  aria-hidden="true"
                  className="size-6 text-green-600"
                />
              ) : (
                <div className="size-1.5 rounded-full bg-gray-100 ring-1 ring-gray-300" />
              )}
            </div>

            <div className="flex-auto text-sm/6 text-gray-500">
              <span className="font-semibold text-gray-700">
                {changelogEntry.changedBy}
              </span>{' '}
              {changelogEntry.type === 'create' && (
                <span>{t('label.maCreated')}</span>
              )}
              {changelogEntry.type === 'stammdaten' && (
                <span>{t('label.stammdatenBearbeitet')}</span>
              )}
              {changelogEntry.type === 'vertragsdaten' && (
                <span>{t('label.vertragsdatenBearbeitet')}</span>
              )}
              {!!changelogEntry.fieldChanges?.length && (
                <ul className="my-2 list-disc pl-6">
                  {changelogEntry.fieldChanges?.map((change) => (
                    <FieldChangeItem
                      key={change.fieldName}
                      change={change}
                      title={getTranslatedTitleWithFallback(
                        tMitarbeiter,
                        `erfassen.${changelogEntry.type}.label`,
                        change.fieldName
                      )}
                    />
                  ))}
                </ul>
              )}
            </div>
            <time
              dateTime={changelogEntry.changedOn}
              className="flex-none text-sm/6 text-gray-500"
            >
              {dayjs(changelogEntry.changedOn).format('DD.MM.YYYY, hh:MM')}
            </time>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Page
