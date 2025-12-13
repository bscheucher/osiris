'use client'

import { PlusIcon } from '@heroicons/react/24/outline'
import dayjs from 'dayjs'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

import LeistungEditForm from './leistung-edit-form'
import LeistungenErfassenCalendar from './leistungen-erfassen-calendar'
import {
  APPOINTMENT_METADATA,
  APPOINTMENT_METADATA_ALT,
  DEFAULT_APPOINTMENTS,
  DEFAULT_APPOINTMENTS_ALT,
  Leistung,
  LeistungMetadata,
} from './leistungserfassung-utils'
import ButtonTw from '@/components/atoms/button-tw'
import { LayoutWrapper } from '@/components/molecules/layout-wrapper'
import { DefaultModal } from '@/components/organisms/default-modal'
import useAsyncEffect from '@/hooks/use-async-effect'

export default function Page() {
  const t = useTranslations('leistungenErfassen')
  const router = useRouter()
  const searchParams = useSearchParams()
  const startDateParam = searchParams.get('startDate') || ''
  const [isLoading, setIsLoading] = useState(true)
  const [showEditForm, setShowEditForm] = useState(false)
  const [selectedLeistung, setSelectedLeistung] = useState<Leistung | null>(
    null
  )
  const [appointments, setAppointments] = useState<Leistung[]>([])
  const [metadata, setMetadata] = useState<LeistungMetadata | null>(null)

  useEffect(() => {
    if (!startDateParam) {
      const startOfWeek = dayjs().startOf('week').format('YYYY-MM-DD')
      router.push(`?startDate=${startOfWeek}`)
    }
  }, [router, startDateParam])

  useAsyncEffect(async () => {
    setIsLoading(true)

    const startOfWeek = dayjs().startOf('week').format('YYYY-MM-DD')
    // TODO: replace with backend endpoint
    await new Promise((resolve) => setTimeout(resolve, 1000))
    const { data } = {
      data: {
        appointmentMetaData:
          startDateParam === startOfWeek
            ? APPOINTMENT_METADATA
            : APPOINTMENT_METADATA_ALT,
        appointmentList:
          startDateParam === startOfWeek
            ? DEFAULT_APPOINTMENTS
            : DEFAULT_APPOINTMENTS_ALT,
      },
    }

    setAppointments(data.appointmentList)
    setMetadata(data.appointmentMetaData)

    setIsLoading(false)
  }, [startDateParam])

  const resetModal = () => {
    setShowEditForm(false)
    // wait for animation to finish
    setTimeout(() => {
      setSelectedLeistung(null)
    }, 300)
  }

  return (
    <LayoutWrapper
      className="max-w-8xl"
      containerClassName="p-0"
      title={t('label.pageTitle')}
      button={
        <ButtonTw
          onClick={() => setShowEditForm(true)}
          className="flex h-12 items-center gap-1"
        >
          <PlusIcon className="h-6 w-6" />
          {t('label.leistungErfassen')}
        </ButtonTw>
      }
    >
      <LeistungenErfassenCalendar
        metadata={metadata}
        appointments={appointments}
        startDate={startDateParam}
        setSelectedLeistung={setSelectedLeistung}
        setShowEditForm={setShowEditForm}
        isLoading={isLoading}
      />
      <DefaultModal
        showModal={showEditForm}
        modalSize="3xl"
        closeModal={resetModal}
      >
        <LeistungEditForm
          leistungEntry={selectedLeistung}
          setAppointments={setAppointments}
          closeForm={resetModal}
        />
      </DefaultModal>
    </LayoutWrapper>
  )
}
