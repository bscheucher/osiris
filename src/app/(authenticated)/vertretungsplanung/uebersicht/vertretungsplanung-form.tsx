import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { useSearchParams } from 'next/navigation'
import React, { useRef, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import CalendarColumnInput from './calendar-column-input-tw'
import MetaData from './meta-data'
import ButtonTw, { ButtonSize } from '@/components/atoms/button-tw'
import { TabsContainerTw, TabsItemTw } from '@/components/atoms/tabs-tw'
import InfoSectionTw from '@/components/molecules/info-section-tw'
import { VertretungsPlan } from '@/lib/utils/vertretungsplannung-utils'

export type FormStructure = {
  [tabName: string]: {
    [selectionByDate: string]: number
  }
}

type VertretungsplanungFormProps = VertretungsPlan

const VertretungsplanungForm = ({
  vertretungsplanungTable,
  vertretungsplanungMetaData,
}: VertretungsplanungFormProps) => {
  const searchParams = useSearchParams()
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentSeminarTab, setCurrentSeminarTab] = useState(0)

  const form = useForm<FormStructure>({
    defaultValues: vertretungsplanungTable.reduce(
      (acc, table) => ({
        ...acc,
        [table.seminarTitle]: table.weekData.reduce(
          (dayAcc, day) => ({
            ...dayAcc,
            [day.date]: day.selection,
          }),
          {} as FormStructure[string]
        ),
      }),
      {} as FormStructure
    ),
  })

  const scrollBy = (left: number) => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left, behavior: 'smooth' })
    }
  }

  return (
    <>
      <div className="relative grid grid-cols-12 gap-x-12 gap-y-4 border-b border-gray-200 py-8 pb-0">
        <div className="col-span-8">
          <MetaData
            abwesendVon={searchParams.get('von') || ''}
            abwesendBis={searchParams.get('bis') || ''}
            mitarbeiterLabel={`${vertretungsplanungMetaData.vorname} ${vertretungsplanungMetaData.nachname}`}
          />
        </div>
        <div className="col-span-4 flex justify-end">
          <div className="flex items-start justify-end gap-2">
            <ButtonTw
              secondary
              className="px-6 py-4 text-gray-400"
              size={ButtonSize.XLarge}
              onClick={() => scrollBy(-640)}
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </ButtonTw>
            <ButtonTw
              secondary
              className="px-6 py-4 text-gray-400"
              size={ButtonSize.XLarge}
              onClick={() => scrollBy(640)}
            >
              <ChevronRightIcon className="h-4 w-4" />
            </ButtonTw>
          </div>
        </div>
        {!!vertretungsplanungTable.length && (
          <div className="col-span-12 flex gap-4">
            <TabsContainerTw>
              {vertretungsplanungTable.map((table, index) => (
                <TabsItemTw
                  key={table.seminarId}
                  name={table.seminarTitle}
                  current={currentSeminarTab === index}
                  onClick={() => setCurrentSeminarTab(index)}
                />
              ))}
            </TabsContainerTw>
          </div>
        )}
      </div>
      {!vertretungsplanungTable.length && (
        <InfoSectionTw
          className="mt-8"
          description={`Für diese Auswahl sind keine Vertreter verfügbar`}
        />
      )}
      <FormProvider {...form}>
        <div
          key={currentSeminarTab}
          className="flex h-full max-h-[calc(100vh-27rem)] snap-x snap-proximity divide-x divide-gray-200 overflow-x-auto py-8"
          ref={containerRef}
        >
          {vertretungsplanungTable[currentSeminarTab]?.weekData.map(
            (dayData) => (
              <CalendarColumnInput
                key={`${currentSeminarTab}-${dayData.date}`}
                dayData={dayData}
                tabName={
                  vertretungsplanungTable[currentSeminarTab].seminarTitle
                }
                selectionByDate={dayData.date}
              />
            )
          )}
        </div>
      </FormProvider>
    </>
  )
}

export default VertretungsplanungForm
