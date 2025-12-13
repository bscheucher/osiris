'use client'

import { Listbox } from '@headlessui/react'
import {
  Label,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { TableCellsIcon } from '@heroicons/react/24/outline'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { RiFileExcel2Fill } from 'react-icons/ri'
import { useTranslations } from 'use-intl'

import LoaderTw from '@/components/atoms/loader-tw'
import { getSearchParamsObject } from '@/lib/utils/form-utils'
import { toQueryString } from '@/lib/utils/gateway-utils'
import { executeGET } from '@/lib/utils/gateway-utils'
import { downloadFileFromStream } from '@/lib/utils/object-utils'
import { showErrorMessage } from '@/lib/utils/toast-utils'

const outputFormats = ['csv', 'xlsx'] as const
type OutputFormat = (typeof outputFormats)[number]

type ExportProps = Record<string, never>

export const TeilnehmerExportButton = (_: ExportProps) => {
  const t = useTranslations('teilnehmer.verwalten.export')

  const searchParams = useSearchParams()
  const { searchParamsObject, hasSearchParams } =
    getSearchParamsObject(searchParams)

  const [outputFormat, setOutputFormat] = useState<OutputFormat>('csv')
  const [isExporting, setIsExporting] = useState(false)

  const exportTeilnehmer = async () => {
    if (hasSearchParams) {
      setIsExporting(true)
      try {
        const { response } = await executeGET<Blob>(
          `/export/getPruefungExport${toQueryString({
            sortDirection: 'ASC',
            ...searchParamsObject,
            page: 0,
            size: 9999,
            outputFormat,
          })}`
        )

        downloadFileFromStream(response)
      } catch (error) {
        showErrorMessage(error)
      } finally {
        setIsExporting(false)
      }
    }
  }

  return (
    <div className="flex justify-end gap-2">
      <Listbox value={outputFormat} onChange={setOutputFormat}>
        <Label className="sr-only">{t('export')}</Label>
        <div className="relative">
          <div className="divide-ibis-blue-dark inline-flex h-12 divide-x rounded-md outline-none">
            <button
              className="bg-ibis-blue inline-flex items-center gap-x-3 rounded-l-md px-3 py-2 text-white"
              onClick={exportTeilnehmer}
              disabled={isExporting}
            >
              <p className="text-sm font-semibold">{t('export')}</p>
              {outputFormat === 'csv' ? (
                <TableCellsIcon aria-hidden="true" className="size-5" />
              ) : (
                <RiFileExcel2Fill aria-hidden="true" className="size-5" />
              )}
            </button>

            <ListboxButton
              className="bg-ibis-blue hover:bg-ibis-blue-dark focus-visible:outline-ibis-blue-light inline-flex items-center rounded-l-none rounded-r-md p-2 outline-none focus-visible:outline focus-visible:outline-2"
              disabled={isExporting}
            >
              {isExporting ? (
                <LoaderTw className="size-5" />
              ) : (
                <ChevronDownIcon
                  aria-hidden="true"
                  className="size-5 text-white forced-colors:text-[Highlight]"
                />
              )}
            </ListboxButton>
          </div>

          <ListboxOptions
            transition
            className="absolute right-0 z-10 mt-2 w-48 origin-top-right divide-y divide-gray-200 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none data-[leave]:transition data-[leave]:duration-100 data-[leave]:ease-in data-[closed]:data-[leave]:opacity-0"
          >
            {outputFormats.map((option) => (
              <ListboxOption
                key={option}
                value={option}
                className="group data-[focus]:bg-ibis-blue cursor-default p-4 text-sm text-gray-900 select-none data-[focus]:text-white"
              >
                <div className="flex flex-col">
                  <div className="flex justify-between">
                    <p className="font-normal group-data-[selected]:font-semibold">
                      {t(`button.${option}`)}
                    </p>
                    <span className="text-ibis-blue group-data-[focus]:text-white group-[&:not([data-selected])]:text-gray-400">
                      {option === 'csv' && (
                        <TableCellsIcon className="size-5" />
                      )}
                      {option === 'xlsx' && (
                        <RiFileExcel2Fill className="size-5" />
                      )}
                    </span>
                  </div>
                </div>
              </ListboxOption>
            ))}
          </ListboxOptions>
        </div>
      </Listbox>
    </div>
  )
}
