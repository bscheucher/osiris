import { ArrowLongRightIcon } from '@heroicons/react/20/solid'
import dayjs from 'dayjs'
import { useTranslations } from 'next-intl'
import React from 'react'

import { isValidDateString } from '@/lib/utils/date-utils'

export interface FieldChange {
  title?: string
  fieldName: string
  oldValue: string
  newValue: string
}

interface Props {
  changes: FieldChange[]
}

export const getTranslatedTitleWithFallback = (
  t: ReturnType<typeof useTranslations>,
  translationPrefix: string,
  fieldName: string
) =>
  t.has(`${translationPrefix}.${fieldName}`)
    ? t(`${translationPrefix}.${fieldName}`)
    : fieldName

export const FieldChangeItem = ({
  change,
  title,
}: {
  change: FieldChange
  title?: string
}) => {
  const tGeneral = useTranslations('common')

  const getDisplayValue = (value: string) => {
    switch (value) {
      case 'true':
        return tGeneral('label.ja')
      case 'false':
        return tGeneral('label.nein')
      case 'VERIFIED':
        return tGeneral('label.verified')
      case 'NOT_VERIFIED':
        return tGeneral('label.notVerified')

      default:
        // finally, check if value is a date string
        // and return it accordingly
        return isValidDateString(value, 'YYYY-MM-DD')
          ? dayjs(value).format('DD.MM.YYYY')
          : value
    }
  }
  return (
    <li key={change.fieldName} className="mb-2">
      <div className="flex items-center gap-2">
        <span>{title || change.fieldName}:</span>
        {change.oldValue && (
          <>
            <span className="bg-red-100 px-2 text-red-900">
              {getDisplayValue(change.oldValue)}
            </span>
            <ArrowLongRightIcon className="size-4" />
          </>
        )}
        <span className="bg-green-100 px-2 text-green-900">
          {getDisplayValue(change.newValue)}
        </span>
      </div>
    </li>
  )
}

const FieldChanges = ({ changes }: Props) => {
  return (
    <ul className="my-2 list-disc pl-6">
      {changes?.map((change) => (
        <FieldChangeItem key={change.fieldName} change={change} />
      ))}
    </ul>
  )
}

export default FieldChanges
