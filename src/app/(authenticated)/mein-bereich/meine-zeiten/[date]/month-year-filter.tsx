'use client'

import dayjs from 'dayjs'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import InputSelectTw from '@/components/atoms/input-select-tw'
import { generateYearOptions, MONTH_OPTIONS } from '@/lib/utils/date-utils'

const yearOptions = generateYearOptions(2025, dayjs().year())

export interface MonthYearFilterInputs {
  month?: string
  year?: string
}

const MonthYearFilter: React.FC<{ isLoading: boolean }> = ({ isLoading }) => {
  const { date: currentDate } = useParams<{ date: string }>()
  const router = useRouter()

  const initialYear = currentDate ? currentDate.split('-')[0] : ''
  const initialMonth = currentDate ? currentDate.split('-')[1] : ''

  const { register, control, setValue } = useForm<MonthYearFilterInputs>({
    defaultValues: {
      year: initialYear,
      month: initialMonth,
    },
  })

  const { month, year } = useWatch({ control })

  useEffect(() => {
    if (currentDate) {
      const [year, month] = currentDate.split('-')
      setValue('year', year)
      setValue('month', month)
    }
  }, [currentDate, setValue])

  useEffect(() => {
    if (month && year) {
      const dateString = `${year}-${month}`

      if (dateString !== currentDate) {
        router.push(`/mein-bereich/meine-zeiten/${dateString}`)
      }
    }
  }, [month, year, router, currentDate])

  return (
    <form>
      <div className="flex gap-2">
        <div>
          <InputSelectTw
            control={control}
            disabled={isLoading}
            options={yearOptions}
            {...register('year')}
            testId="year"
          />
        </div>
        <div>
          <InputSelectTw
            control={control}
            disabled={isLoading}
            options={MONTH_OPTIONS}
            {...register('month')}
            testId="month"
          />
        </div>
      </div>
    </form>
  )
}

export default MonthYearFilter
