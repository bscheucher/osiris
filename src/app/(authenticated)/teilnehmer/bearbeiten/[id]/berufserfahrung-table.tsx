import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useTranslations } from 'next-intl'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'

import BerufSelectTw from '@/components/atoms/beruf-select-tw'
import ButtonTw, { ButtonSize } from '@/components/atoms/button-tw'
import HorizontalRow from '@/components/atoms/hr-tw'
import InputTextTw from '@/components/atoms/input-text-tw'
import InputToggleTw from '@/components/atoms/input-toggle-tw'
import {
  TableCellTw,
  TableHeaderTw,
  TableTw,
} from '@/components/molecules/table-tw'
import { DefaultModal } from '@/components/organisms/default-modal'
import useAsyncEffect from '@/hooks/use-async-effect'
import {
  Teilnehmer,
  TeilnehmerBerufserfahrung,
} from '@/lib/interfaces/teilnehmer'
import { setErrorsFromErrorsMap } from '@/lib/utils/form-utils'
import {
  ErrorsResponse,
  executeDELETE,
  executeGET,
  executePOST,
} from '@/lib/utils/gateway-utils'

const DEFAULT_VALUES = {
  beruf: [],
  dauer: 0,
  einheit: false,
}

interface BerufserfahrungFormValues {
  dauer: number
  beruf: string[]
  isMonth?: boolean
}

const BerufserfahrungTable: React.FC<{
  participant: Teilnehmer
  isReadOnly?: boolean
  setParticipant?: React.Dispatch<React.SetStateAction<Teilnehmer | null>>
}> = ({ isReadOnly, participant }) => {
  const t = useTranslations('teilnehmer.bearbeiten')
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [berufserfahrungList, setBerufserfahrungList] = useState<
    TeilnehmerBerufserfahrung[]
  >([])
  const [selectedBerufserfahrung, setSelectedBerufserfahrung] =
    useState<TeilnehmerBerufserfahrung | null>(null)

  const { clearErrors, register, reset, control, getValues, setError } =
    useForm<BerufserfahrungFormValues>({
      defaultValues: DEFAULT_VALUES,
    })

  useAsyncEffect(async () => {
    setIsLoading(true)
    const { data } = await executeGET<{
      teilnehmerBerufserfahrung: TeilnehmerBerufserfahrung[]
    }>(`/teilnehmer/${participant.id}/berufserfahrungen`)

    if (data?.teilnehmerBerufserfahrung) {
      setBerufserfahrungList(data.teilnehmerBerufserfahrung)
    }
    setIsLoading(false)
  }, [])

  const onSubmit = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): Promise<void> => {
    e.preventDefault()
    e.stopPropagation()

    const { beruf, dauer, isMonth } = getValues()

    if (!beruf.length || !dauer) {
      return
    }

    const durationAsFloat =
      typeof dauer === 'string' ? parseFloat(dauer) : dauer

    const calulatedDuration = isMonth
      ? parseFloat((durationAsFloat / 12).toFixed(2))
      : durationAsFloat

    const currentBerufserfahrung = {
      beruf: beruf[0],
      dauer: calulatedDuration,
    }

    clearErrors()
    setIsLoading(true)

    const { data } = await executePOST<{
      teilnehmerBerufserfahrung: Array<
        TeilnehmerBerufserfahrung & ErrorsResponse
      >
    }>(
      `/teilnehmer/edit/${participant.id}/berufserfahrung`,
      currentBerufserfahrung
    )

    const currentTeilnehmerBerufserfahrung = data?.teilnehmerBerufserfahrung[0]

    if (currentTeilnehmerBerufserfahrung) {
      clearErrors()

      if (
        currentTeilnehmerBerufserfahrung.errors?.length &&
        currentTeilnehmerBerufserfahrung.errorsMap
      ) {
        setErrorsFromErrorsMap(
          currentTeilnehmerBerufserfahrung.errorsMap,
          setError
        )
      } else {
        setBerufserfahrungList((prev) => [
          ...prev,
          currentTeilnehmerBerufserfahrung,
        ])
        reset(DEFAULT_VALUES)
      }
    }

    setIsLoading(false)
  }

  const onDeleteBerufserfahrung = async (
    berufserfahrung: TeilnehmerBerufserfahrung
  ) => {
    setIsLoading(true)
    const { success } = await executeDELETE<{
      teilnehmerBerufserfahrung: TeilnehmerBerufserfahrung[]
    }>(`/teilnehmer/delete/berufserfahrung/${berufserfahrung.id}`)

    if (success) {
      const updatedBerufserfahrung = berufserfahrungList?.filter(
        (item) => item.id !== berufserfahrung.id
      )
      setBerufserfahrungList(updatedBerufserfahrung || [])
    }

    setIsLoading(false)
  }

  return (
    <div className="grid grid-cols-12 gap-x-4 gap-y-6">
      <div className="col-span-12">
        <h3 className="text-base leading-7 font-semibold text-gray-900">
          {t('label.berufserfahrung')}
        </h3>
      </div>
      {berufserfahrungList.length > 0 && (
        <>
          <div className="col-span-12">
            <TableTw className="flex-auto">
              <thead className="bg-gray-50">
                <tr>
                  <TableHeaderTw>{t(`label.beruf`)}</TableHeaderTw>
                  <TableHeaderTw>{t(`label.dauerInJahren`)}</TableHeaderTw>
                  <TableHeaderTw>{` `}</TableHeaderTw>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {berufserfahrungList.map((entry, index) => (
                  <tr key={entry.id || index}>
                    <TableCellTw testId="berufserfahrung-td-beruf">
                      {entry.beruf}
                    </TableCellTw>
                    <TableCellTw testId="berufserfahrung-td-dauer">
                      {entry.dauer}
                    </TableCellTw>
                    <TableCellTw className="text-right">
                      <ButtonTw
                        className="bg-red-600 ring-red-700 hover:bg-red-500"
                        testId="berufserfahrung-delete-button"
                        disabled={isReadOnly || isLoading}
                        onClick={() => {
                          setSelectedBerufserfahrung(entry)
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
          <div className="col-span-12">
            <BerufSelectTw
              label={t('label.beruf')}
              control={control}
              isSingleSelection
              {...register('beruf')}
            />
          </div>
          <div className="col-span-8">
            <InputTextTw
              label={t('label.dauer')}
              placeholder={t('placeholder.dauer')}
              control={control}
              type="number"
              {...register('dauer')}
            />
          </div>
          <div className="col-span-4">
            <InputToggleTw
              label={t('label.einheit')}
              control={control}
              leftLabel={t('label.jahre')}
              rightLabel={t('label.monate')}
              disabled={isReadOnly}
              name="isMonth"
            />
          </div>
          <div className="col-span-12">
            <ButtonTw
              type="submit"
              className="flex w-full items-center justify-center gap-2"
              size={ButtonSize.Large}
              isLoading={isLoading}
              testId="berufserfahrung-add-button"
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
                  {t('label.deleteBerufserfahrung')}
                </h3>
              </div>
              <div>
                <p>{t('label.deleteBerufserfahrungDescription')}</p>
              </div>
              <HorizontalRow />
              <div className="col-span-12 flex justify-between">
                <ButtonTw
                  className="h-full"
                  size={ButtonSize.Large}
                  secondary
                  testId="berufserfahrung-delete-cancel-button"
                  onClick={() => setShowDeleteModal(false)}
                >
                  {t('label.cancel')}
                </ButtonTw>
                <ButtonTw
                  className="h-full bg-red-600 ring-red-700 hover:bg-red-500"
                  size={ButtonSize.Large}
                  onClick={() => {
                    setShowDeleteModal(false)
                    if (selectedBerufserfahrung) {
                      onDeleteBerufserfahrung(selectedBerufserfahrung)
                      setSelectedBerufserfahrung(null)
                    }
                  }}
                  testId="berufserfahrung-delete-confirm-button"
                >
                  {t('label.delete')}
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

export default BerufserfahrungTable
