import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useTranslations } from 'next-intl'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'

import ButtonTw, { ButtonSize } from '@/components/atoms/button-tw'
import HorizontalRow from '@/components/atoms/hr-tw'
import InputTextTw from '@/components/atoms/input-text-tw'
import {
  TableCellTw,
  TableHeaderTw,
  TableTw,
} from '@/components/molecules/table-tw'
import { DefaultModal } from '@/components/organisms/default-modal'
import useAsyncEffect from '@/hooks/use-async-effect'
import { Teilnehmer, TeilnehmerZertifikat } from '@/lib/interfaces/teilnehmer'
import {
  executeDELETE,
  executeGET,
  executePOST,
} from '@/lib/utils/gateway-utils'

const ZertifikateTable: React.FC<{
  participant: Teilnehmer
  isReadOnly?: boolean
}> = ({ isReadOnly, participant }) => {
  const t = useTranslations('teilnehmer.bearbeiten')
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [zertifikate, setZertifikate] = useState<TeilnehmerZertifikat[]>([])
  const [selectedZertifikat, setSelectedZertifikat] =
    useState<TeilnehmerZertifikat | null>(null)

  const { clearErrors, register, reset, control, getValues } = useForm<
    Omit<TeilnehmerZertifikat, 'id'>
  >({
    defaultValues: {
      bezeichnung: '',
    },
  })

  useAsyncEffect(async () => {
    try {
      const { data } = await executeGET<{
        teilnehmerZertifikat: TeilnehmerZertifikat[]
      }>(`/teilnehmer/${participant.id}/zertifikate`)

      if (data?.teilnehmerZertifikat) {
        setZertifikate(data.teilnehmerZertifikat)
      }
    } catch (error) {
      console.error('Error fetching zertifikate:', error)
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
      addZertifikat(data)
    }
  }

  const addZertifikat = async (
    zertifikat: Omit<TeilnehmerZertifikat, 'id'>
  ) => {
    clearErrors()

    setIsLoading(true)

    try {
      const { data } = await executePOST<{
        teilnehmerZertifikat: TeilnehmerZertifikat[]
      }>(`/teilnehmer/edit/${participant.id}/zertifikat`, zertifikat)

      const currentTeilnehmerZertifikat = data?.teilnehmerZertifikat[0]

      if (currentTeilnehmerZertifikat) {
        setZertifikate([...zertifikate, currentTeilnehmerZertifikat])
        reset()
      }
    } catch (error) {
      console.error('Error adding zertifikat:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const onDeleteZertifikat = async (zertifikat: TeilnehmerZertifikat) => {
    try {
      const { success } = await executeDELETE<{
        teilnehmerZertifikat: TeilnehmerZertifikat[]
      }>(`/teilnehmer/delete/zertifikat/${zertifikat.id}`)

      if (success) {
        const updatedZertifikate = zertifikate?.filter(
          (item) => item.id !== zertifikat.id
        )
        setZertifikate(updatedZertifikate || [])
      }
    } catch (error) {
      console.error('Error deleting zertifikat:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-12 gap-x-4 gap-y-6">
      <div className="col-span-12">
        <h3 className="text-base leading-7 font-semibold text-gray-900">
          {t('label.zertifikate')}
        </h3>
      </div>
      {zertifikate.length > 0 && (
        <>
          <div className="col-span-12">
            <TableTw className="flex-auto">
              <thead className="bg-gray-50">
                <tr>
                  <TableHeaderTw>{t(`label.bezeichnung`)}</TableHeaderTw>
                  <TableHeaderTw>{` `}</TableHeaderTw>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {zertifikate.map((entry, index) => (
                  <tr key={index}>
                    <TableCellTw testId="zertifikat-td-bezeichnung">
                      {entry.bezeichnung}
                    </TableCellTw>
                    <TableCellTw className="text-right">
                      <ButtonTw
                        className="bg-red-600 ring-red-700 hover:bg-red-500"
                        testId="zertifikat-delete-button"
                        disabled={isReadOnly || isLoading}
                        onClick={() => {
                          setSelectedZertifikat(entry)
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
            <InputTextTw
              label={t('label.bezeichnung')}
              placeholder={t('placeholder.bezeichnung')}
              testId="zertifikat-bezeichnung"
              control={control}
              disabled={isLoading}
              {...register('bezeichnung')}
            />
          </div>
          <div className="col-span-12">
            <ButtonTw
              type="submit"
              className="flex w-full items-center justify-center gap-2"
              size={ButtonSize.Large}
              isLoading={isLoading}
              testId="zertifikat-add-button"
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
                  {t('label.deleteZertifikat')}
                </h3>
              </div>
              <div>
                <p>{t('label.deleteZertifikatDescription')}</p>
              </div>
              <HorizontalRow />

              <div className="col-span-12 flex justify-between">
                <ButtonTw
                  className="h-full"
                  size={ButtonSize.Large}
                  secondary
                  testId="zertifikat-delete-cancel-button"
                  onClick={() => setShowDeleteModal(false)}
                >
                  {t('label.cancel')}
                </ButtonTw>
                <ButtonTw
                  className="h-full bg-red-600 ring-red-700 hover:bg-red-500"
                  size={ButtonSize.Large}
                  onClick={() => {
                    setShowDeleteModal(false)
                    if (selectedZertifikat) {
                      onDeleteZertifikat(selectedZertifikat)
                      setSelectedZertifikat(null)
                    }
                  }}
                  testId="zertifikat-delete-confirm-button"
                >
                  {t('label.deleteZertifikatSubmit')}
                </ButtonTw>
              </div>
            </div>
          </DefaultModal>
        </>
      )}
      <HorizontalRow className="col-span-12 border-gray-900/10 xl:hidden" />
    </div>
  )
}

export default ZertifikateTable
