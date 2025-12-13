import { Radio } from '@headlessui/react'
import { RadioGroup } from '@headlessui/react'
import { Label } from '@headlessui/react'
import { Field } from '@headlessui/react'
import { CheckCircleIcon } from '@heroicons/react/20/solid'
import dayjs from 'dayjs'
import React from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { twMerge } from 'tailwind-merge'

import { FormStructure } from './vertretungsplanung-form'
import BadgeTw, { BadgeColor } from '@/components/atoms/badge-tw'
import InfoSectionTw from '@/components/molecules/info-section-tw'
import { WeekDataItem } from '@/lib/utils/vertretungsplannung-utils'

const emptyDay = {
  id: -1,
  name: 'Keine Auswahl',
  email: '',
  phone: '',
  punkte: 0,
  availability: [],
  hasExperience: false,
}

type CalendarColumnInputProps = {
  tabName: string
  selectionByDate: string
  dayData: WeekDataItem
}

const CalendarColumnInput = ({
  tabName,
  selectionByDate,
  dayData,
}: CalendarColumnInputProps) => {
  const { control } = useFormContext<FormStructure>()

  return (
    <Field as="div" className="mt-9 h-full flex-[0_0_320px] px-6">
      <Label
        as="span"
        className="mb-2 text-sm"
        // data-testid={`${testId || date}-label`}
      >
        <span className="-mt-9 mb-3 flex justify-center font-semibold">
          {dayjs(dayData.date, 'YYYY-MM-DD', 'de')
            .locale('de')
            .format('dd, DD.MM.YY')}
        </span>
      </Label>

      {!dayData.list || !dayData.list.length ? (
        <InfoSectionTw
          description={`Für diesen Tag sind keine anderen Trainer verfügbar`}
        />
      ) : (
        <Controller
          control={control}
          name={`${tabName}.${selectionByDate}`}
          render={({ field }) => (
            <RadioGroup
              value={
                dayData.list.find((day) => day.id === field.value) || emptyDay
              }
              by="id"
              onChange={(value) => {
                field.onChange(value.id)
              }}
              className="flex h-full flex-col gap-y-6"
            >
              {dayData.list.map((day) => (
                <Radio
                  key={day.id}
                  value={day}
                  className={twMerge(
                    `group data-[focus]:border-ibis-blue data-[focus]:ring-ibis-blue relative flex cursor-pointer flex-col rounded-lg border border-gray-300 bg-white p-4 shadow-sm focus:outline-none data-[focus]:ring-2`
                  )}
                >
                  <div className="mb-2 flex justify-between gap-1">
                    <span className="text-normal block font-medium text-gray-900">
                      {day.name}
                    </span>
                    <CheckCircleIcon
                      aria-hidden="true"
                      className="text-ibis-blue size-5 group-[&:not([data-checked])]:invisible"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap content-start gap-2">
                      {day.hasExperience && (
                        <BadgeTw color={BadgeColor.Purple}>
                          Vorerfahrung
                        </BadgeTw>
                      )}
                      {day.availability.map((item: string) =>
                        item === 'online' ? (
                          <BadgeTw key={item} color={BadgeColor.Green}>
                            Online
                          </BadgeTw>
                        ) : (
                          <BadgeTw key={item} color={BadgeColor.Yellow}>
                            Präsenz
                          </BadgeTw>
                        )
                      )}
                    </div>
                    <div>
                      <div className="flex gap-2">
                        <span className="text-sm/6 font-semibold text-gray-900">
                          Punkte:
                        </span>
                        <span className="text-sm/6 text-gray-700">
                          {day.punkte}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-sm/6 font-semibold text-gray-900">
                          Email:
                        </span>
                        <span className="text-sm/6 text-gray-700">
                          {day.email}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-sm/6 font-semibold text-gray-900">
                          Tel.:
                        </span>
                        <span className="text-sm/6 text-gray-700">
                          {day.phone}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span
                    aria-hidden="true"
                    className="group-data-[checked]:border-ibis-blue pointer-events-none absolute -inset-px rounded-lg border-2 border-transparent group-data-[focus]:border"
                  />
                </Radio>
              ))}
            </RadioGroup>
          )}
        />
      )}
    </Field>
  )
}

export default CalendarColumnInput
