import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useTranslations } from 'next-intl'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'

import ButtonTw, { ButtonSize } from '@/components/atoms/button-tw'
import HorizontalRow from '@/components/atoms/hr-tw'
import InputSelectTw from '@/components/atoms/input-select-tw'
import InputToggleTw from '@/components/atoms/input-toggle-tw'
import {
  TableCellTw,
  TableHeaderTw,
  TableTw,
} from '@/components/molecules/table-tw'
import { DefaultModal } from '@/components/organisms/default-modal'
import useAsyncEffect from '@/hooks/use-async-effect'
import { Teilnehmer, TeilnehmerAusbildung } from '@/lib/interfaces/teilnehmer'
import { convertArrayToKeyLabelOptions } from '@/lib/utils/form-utils'
import {
  executeDELETE,
  executeGET,
  executePOST,
} from '@/lib/utils/gateway-utils'
import useMasterdataStore from '@/stores/form-store'

// Removed hardcoded AUSBILDUNG_TYPEN in favor of masterdata

const DEFAULT_VALUES = {
  ausbildungstyp: '',
  hoechsterAbschluss: true,
  erkanntInAt: true,
}

const AusbildungTable: React.FC<{
  participant: Teilnehmer
  isReadOnly?: boolean
  setParticipant?: React.Dispatch<React.SetStateAction<Teilnehmer | null>>
}> = ({ isReadOnly, participant }) => {
  const t = useTranslations('teilnehmer.bearbeiten')
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [ausbildungen, setAusbildungen] = useState<TeilnehmerAusbildung[]>([])
  const [selectedAusbildung, setSelectedAusbildung] =
    useState<TeilnehmerAusbildung | null>(null)
  const { masterdataTN } = useMasterdataStore()

  const { clearErrors, register, reset, control, getValues } =
    useForm<TeilnehmerAusbildung>({
      defaultValues: DEFAULT_VALUES,
    })

  useAsyncEffect(async () => {
    setIsLoading(true)
    const { data } = await executeGET<{
      teilnehmerAusbildung: TeilnehmerAusbildung[]
    }>(`/teilnehmer/${participant.id}/ausbildungen`)

    if (data?.teilnehmerAusbildung) {
      setAusbildungen(data.teilnehmerAusbildung)
    }
    setIsLoading(false)
  }, [])

  const onSubmit = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): void => {
    e.preventDefault()
    e.stopPropagation()
    const data = getValues()

    if (data && data.ausbildungstyp) {
      addAusbildung(data)
    }
  }

  const addAusbildung = async (
    ausbildung: Omit<TeilnehmerAusbildung, 'id'>
  ) => {
    clearErrors()
    setIsLoading(true)

    const { data } = await executePOST<{
      teilnehmerAusbildung: TeilnehmerAusbildung[]
    }>(`/teilnehmer/edit/${participant.id}/ausbildung`, ausbildung)

    const currentTeilnehmerAusbildung = data?.teilnehmerAusbildung[0]

    if (currentTeilnehmerAusbildung) {
      setAusbildungen([...ausbildungen, currentTeilnehmerAusbildung])
      reset()
    }

    setIsLoading(false)
  }

  const onDeleteAusbildung = async (ausbildung: TeilnehmerAusbildung) => {
    setIsLoading(true)
    const { success } = await executeDELETE<{
      teilnehmerAusbildung: TeilnehmerAusbildung[]
    }>(`/teilnehmer/delete/ausbildung/${ausbildung.id}`)

    if (success) {
      const updatedAusbildungen = ausbildungen?.filter(
        (item) => item.id !== ausbildung.id
      )
      setAusbildungen(updatedAusbildungen || [])
    }
    setIsLoading(false)
  }

  return (
    <div className="grid grid-cols-12 gap-x-4 gap-y-6">
      <div className="col-span-12">
        <h3 className="text-base leading-7 font-semibold text-gray-900">
          {t('label.ausbildungen')}
        </h3>
      </div>
      {ausbildungen.length > 0 && (
        <>
          <div className="col-span-12">
            <TableTw className="flex-auto">
              <thead className="bg-gray-50">
                <tr>
                  <TableHeaderTw>{t(`label.ausbildungstyp`)}</TableHeaderTw>
                  <TableHeaderTw>{t(`label.hoechsterAbschluss`)}</TableHeaderTw>
                  <TableHeaderTw>{t(`label.erkanntInAt`)}</TableHeaderTw>
                  <TableHeaderTw>{` `}</TableHeaderTw>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {ausbildungen.map((entry, index) => (
                  <tr key={index}>
                    <TableCellTw testId="ausbildung-td-ausbildungstyp">
                      {entry.ausbildungstyp}
                    </TableCellTw>
                    <TableCellTw testId="ausbildung-td-hoechsterAbschluss">
                      {entry.hoechsterAbschluss ? 'Ja' : 'Nein'}
                    </TableCellTw>
                    <TableCellTw testId="ausbildung-td-erkanntInAt">
                      {entry.erkanntInAt ? 'Ja' : 'Nein'}
                    </TableCellTw>
                    <TableCellTw className="text-right">
                      <ButtonTw
                        className="bg-red-600 ring-red-700 hover:bg-red-500"
                        testId="ausbildung-delete-button"
                        disabled={isReadOnly || isLoading}
                        onClick={() => {
                          setSelectedAusbildung(entry)
                          setShowDeleteModal(true)
                        }}
                      >
                        <TrashIcon className="size-5" />
                      </ButtonTw>
                    </TableCellTw>
                  </tr>
                ))}
              </tbody>
            </TableTw>
          </div>
        </>
      )}
      {!isReadOnly && (
        <>
          <div className="col-span-4">
            <InputSelectTw
              label={t('label.ausbildungstyp')}
              placeholder={t('placeholder.ausbildungstyp')}
              control={control}
              options={convertArrayToKeyLabelOptions(
                masterdataTN?.teilnehmerAusbildungTypeList || []
              )}
              {...register('ausbildungstyp')}
            />
          </div>
          <div className="col-span-4">
            <InputToggleTw
              label={t('label.hoechsterAbschluss')}
              control={control}
              leftLabel={'Nein'}
              rightLabel={'Ja'}
              {...register('hoechsterAbschluss')}
            />
          </div>
          <div className="col-span-4">
            <InputToggleTw
              label={t('label.erkanntInAt')}
              control={control}
              leftLabel={'Nein'}
              rightLabel={'Ja'}
              {...register('erkanntInAt')}
            />
          </div>
          <div className="col-span-12">
            <ButtonTw
              type="submit"
              className="flex w-full items-center justify-center gap-2"
              size={ButtonSize.Large}
              isLoading={isLoading}
              testId="ausbildung-add-button"
              onClick={onSubmit}
            >
              <PlusIcon className="size-5" />
              <span className="hidden lg:inline">{t('label.hinzufuegen')}</span>
            </ButtonTw>
          </div>
          <DefaultModal
            showModal={showDeleteModal}
            closeModal={() => {
              setShowDeleteModal(false)
            }}
          >
            <div className="space-y-6">
              <div className="mb-6 flex content-center items-center justify-between">
                <h3 className="text-2xl leading-7 font-semibold text-gray-900">
                  {t('label.deleteAusbildung')}
                </h3>
              </div>
              <div>
                <p>{t('label.deleteAusbildungDescription')}</p>
              </div>
              <HorizontalRow />
              <div className="col-span-12 flex justify-between">
                <ButtonTw
                  className="h-full"
                  size={ButtonSize.Large}
                  secondary
                  testId="ausbildung-delete-cancel-button"
                  onClick={() => setShowDeleteModal(false)}
                >
                  {t('label.cancel')}
                </ButtonTw>
                <ButtonTw
                  className="h-full bg-red-600 ring-red-700 hover:bg-red-500"
                  size={ButtonSize.Large}
                  disabled={isLoading}
                  onClick={() => {
                    setShowDeleteModal(false)
                    if (selectedAusbildung) {
                      onDeleteAusbildung(selectedAusbildung)
                      setSelectedAusbildung(null)
                    }
                  }}
                  testId="ausbildung-delete-confirm-button"
                >
                  {t('label.deleteAusbildungSubmit')}
                </ButtonTw>
              </div>
            </div>
          </DefaultModal>
        </>
      )}
      <HorizontalRow className="col-span-12 xl:hidden" />
    </div>
  )
}

export default AusbildungTable
