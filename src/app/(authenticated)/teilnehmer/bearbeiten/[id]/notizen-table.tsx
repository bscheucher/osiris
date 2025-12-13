import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import dayjs from 'dayjs'
import { useTranslations } from 'next-intl'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'

import ButtonTw, { ButtonSize } from '@/components/atoms/button-tw'
import HorizontalRow from '@/components/atoms/hr-tw'
import InputSelectTw from '@/components/atoms/input-select-tw'
import InputTextTw from '@/components/atoms/input-text-tw'
import {
  TableCellTw,
  TableHeaderTw,
  TableTw,
} from '@/components/molecules/table-tw'
import { DefaultModal } from '@/components/organisms/default-modal'
import useAsyncEffect from '@/hooks/use-async-effect'
import { Teilnehmer, TeilnehmerNotiz } from '@/lib/interfaces/teilnehmer'
import { convertArrayToKeyLabelOptions } from '@/lib/utils/form-utils'
import {
  executeDELETE,
  executeGET,
  executePOST,
} from '@/lib/utils/gateway-utils'
import useMasterdataStore from '@/stores/form-store'

const NotizenTable: React.FC<{
  participant: Teilnehmer
  isReadOnly?: boolean
}> = ({ isReadOnly, participant }) => {
  const t = useTranslations('teilnehmer.bearbeiten')
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [notizen, setNotizen] = useState<TeilnehmerNotiz[]>([])
  const { masterdataTN: masterdata } = useMasterdataStore()

  const [selectedNotiz, setSelectedNotiz] = useState<TeilnehmerNotiz | null>(
    null
  )

  const { clearErrors, register, reset, control, getValues, setError } =
    useForm<Omit<TeilnehmerNotiz, 'id'>>({
      defaultValues: {
        notiz: '',
        type: 'Intern',
        kategorie: 'Sonstige',
      },
    })

  useAsyncEffect(async () => {
    try {
      const { data } = await executeGET<{ teilnehmerNotiz: TeilnehmerNotiz[] }>(
        `/teilnehmer/${participant.id}/notizen`
      )

      if (data?.teilnehmerNotiz) {
        setNotizen(data.teilnehmerNotiz)
      }
    } catch (error) {
      console.error('Error fetching notizen:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const onSubmit = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): void => {
    e.preventDefault()
    e.stopPropagation()
    const data = getValues()
    if (data) {
      addNotiz(data)
    }
  }

  const addNotiz = async (notiz: Omit<TeilnehmerNotiz, 'id'>) => {
    clearErrors()

    setIsLoading(true)

    try {
      const { data } = await executePOST<{
        teilnehmerNotiz: TeilnehmerNotiz[]
      }>(`/teilnehmer/edit/${participant.id}/notiz`, notiz)

      const currentTeilnehmerNotiz = data?.teilnehmerNotiz[0]

      if (currentTeilnehmerNotiz) {
        setNotizen([...notizen, currentTeilnehmerNotiz])
        reset()
      }
    } catch (error) {
      console.error('Error adding notiz:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const onDeleteNotiz = async (notiz: TeilnehmerNotiz) => {
    try {
      const { success } = await executeDELETE<{
        teilnehmerNotiz: TeilnehmerNotiz[]
      }>(`/teilnehmer/delete/notiz/${notiz.id}`)

      if (success) {
        const updatedNotizen = notizen?.filter((item) => item.id !== notiz.id)
        setNotizen(updatedNotizen || [])
      }
    } catch (error) {
      console.error('Error fetching notizen:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-12 gap-x-4 gap-y-8">
      <div className="col-span-12">
        <h3 className="text-base leading-7 font-semibold text-gray-900">
          {t('label.kursverlauf')}
        </h3>
      </div>
      {notizen.length > 0 && (
        <>
          <div className="col-span-12">
            <TableTw className="flex-auto">
              <thead className="bg-gray-50">
                <tr>
                  <TableHeaderTw>{t(`label.notiz`)}</TableHeaderTw>
                  <TableHeaderTw>{t(`label.typ`)}</TableHeaderTw>
                  <TableHeaderTw>{t(`label.kategorie`)}</TableHeaderTw>
                  <TableHeaderTw>{t(`label.createdOn`)}</TableHeaderTw>
                  <TableHeaderTw>{t(`label.createdBy`)}</TableHeaderTw>
                  <TableHeaderTw>{` `}</TableHeaderTw>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {notizen.map((entry, index) => (
                  <tr key={index}>
                    <TableCellTw testId="notiz-td-notiz">
                      {entry.notiz}
                    </TableCellTw>
                    <TableCellTw testId="notiz-td-type">
                      {entry.type}
                    </TableCellTw>
                    <TableCellTw testId="notiz-td-kategorie">
                      {entry.kategorie}
                    </TableCellTw>
                    <TableCellTw testId="notiz-td-createdOn">
                      {entry.createdOn &&
                        dayjs(entry.createdOn).format('DD.MM.YYYY')}
                    </TableCellTw>
                    <TableCellTw testId="notiz-td-createdBy">
                      {entry.createdBy}
                    </TableCellTw>
                    <TableCellTw className="text-right">
                      <ButtonTw
                        className="bg-red-600 ring-red-700 hover:bg-red-500"
                        testId="notiz-delete-button"
                        disabled={isReadOnly}
                        onClick={() => {
                          setSelectedNotiz(entry)
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
          <div className="col-span-6">
            <InputTextTw
              label={t('label.notiz')}
              placeholder={t('placeholder.notiz')}
              control={control}
              disabled={isLoading}
              maxLength={3000}
              testId="notiz-input"
              {...register('notiz')}
            />
          </div>
          <div className="col-span-2">
            <InputSelectTw
              label={t('label.typ')}
              control={control}
              disabled={isLoading}
              options={convertArrayToKeyLabelOptions(
                masterdata?.teilnehmerNotizenTypeList || []
              )}
              required
              testId="notiz-type"
              {...register('type')}
            />
          </div>
          <div className="col-span-2">
            <InputSelectTw
              label={t('label.kategorie')}
              control={control}
              disabled={isLoading}
              options={convertArrayToKeyLabelOptions(
                masterdata?.teilnehmerNotizenKategorieList || []
              )}
              required
              testId="notiz-kategorie"
              {...register('kategorie')}
            />
          </div>
          <div className="col-span-2 flex items-end">
            <ButtonTw
              type="submit"
              className="flex w-full items-center justify-center gap-2"
              size={ButtonSize.Large}
              isLoading={isLoading}
              onClick={onSubmit}
              testId="notiz-add-button"
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
                  {t('label.deleteNotiz')}
                </h3>
              </div>
              <div>
                <p>{t('label.deleteNotizDescription')}</p>
              </div>
              <HorizontalRow />
              <div className="col-span-12 flex justify-between">
                <ButtonTw
                  className="h-full"
                  size={ButtonSize.Large}
                  secondary
                  testId="notiz-delete-cancel-button"
                  onClick={() => setShowDeleteModal(false)}
                >
                  {t('label.cancel')}
                </ButtonTw>
                <ButtonTw
                  className="h-full bg-red-600 ring-red-700 hover:bg-red-500"
                  size={ButtonSize.Large}
                  onClick={() => {
                    setShowDeleteModal(false)
                    if (onDeleteNotiz && selectedNotiz) {
                      onDeleteNotiz(selectedNotiz)
                      setSelectedNotiz(null)
                    }
                  }}
                  testId="notiz-delete-confirm-button"
                >
                  {t('label.deleteNotizSubmit')}
                </ButtonTw>
              </div>
            </div>
          </DefaultModal>
        </>
      )}
      <HorizontalRow className="col-span-12" />
    </div>
  )
}

export default NotizenTable
