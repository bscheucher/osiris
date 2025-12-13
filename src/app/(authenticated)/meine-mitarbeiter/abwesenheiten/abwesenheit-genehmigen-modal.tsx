'use client'

import dayjs from 'dayjs'
import { useTranslations } from 'next-intl'
import React from 'react'
import { useForm } from 'react-hook-form'

import ButtonTw, { ButtonSize } from '@/components/atoms/button-tw'
import TextareaTw from '@/components/atoms/textarea-tw'
import { TableCellTw, TableTw } from '@/components/molecules/table-tw'
import { DefaultModal } from '@/components/organisms/default-modal'
import {
  AbwesenheitEntry,
  AbwesenheitType,
} from '@/lib/utils/abwesenheit-utils'

interface Props {
  abwesenheitData: AbwesenheitEntry
  showModal: boolean
  closeModal: () => void
  onSave: (data: AbwesenheitGenehmigenFormValues) => void
  isLoading: boolean
}

export type AbwesenheitGenehmigenFormValues = {
  comment: string
  isAccepted: boolean
}

const DEFAULT_FORM_STATE = {
  comment: '',
}

export default function AbwesenheitGenehmigenModal({
  abwesenheitData,
  showModal,
  closeModal,
  onSave,
  isLoading,
}: Props) {
  const t = useTranslations('abwesenheitenGenehmigen.modal')
  const { control, handleSubmit, register } =
    useForm<AbwesenheitGenehmigenFormValues>({
      defaultValues: DEFAULT_FORM_STATE,
    })

  const submitForm = (approve: boolean) => {
    handleSubmit((data: AbwesenheitGenehmigenFormValues) => {
      onSave({ ...data, isAccepted: approve })
    })()
  }

  return (
    <DefaultModal
      showModal={showModal}
      closeModal={closeModal}
      modalSize="2xl"
      testId="abwesenheitGenehmigung-modal"
    >
      <div className="flex flex-col">
        <h2 className="mb-4 block text-2xl font-semibold tracking-tight text-gray-900">
          {t('title')}
        </h2>
        <div className="mb-4 grid grid-cols-4 gap-x-8 gap-y-8 sm:grid-cols-4">
          <div className="col-span-4">
            <TableTw className="flex-auto">
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <TableCellTw>{t('startDate')}</TableCellTw>
                  <TableCellTw>{`${dayjs(abwesenheitData.startDate).format('DD.MM.YYYY')}`}</TableCellTw>
                </tr>
                <tr>
                  <TableCellTw>{t('endDate')}</TableCellTw>
                  <TableCellTw>{`${dayjs(abwesenheitData.endDate).format('DD.MM.YYYY')}`}</TableCellTw>
                </tr>
                <tr>
                  <TableCellTw>{t('typ')}</TableCellTw>
                  <TableCellTw>
                    {abwesenheitData.type === AbwesenheitType.URLAU
                      ? t('abwesenheitstyp.urlaub')
                      : t('abwesenheitstyp.zeitausgleich')}
                  </TableCellTw>
                </tr>
                {abwesenheitData.type === AbwesenheitType.URLAU && (
                  <tr>
                    <TableCellTw>{t('restanspruch')}</TableCellTw>
                    <TableCellTw>{abwesenheitData.anspruch}</TableCellTw>
                  </tr>
                )}
                <tr>
                  <TableCellTw>{t('commentMitarbeiter')}</TableCellTw>
                  <TableCellTw>{abwesenheitData.comment}</TableCellTw>
                </tr>
              </tbody>
            </TableTw>
          </div>
        </div>
        <form>
          <div className="mb-4 grid grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-4">
            <div className="sm:col-span-4">
              <TextareaTw
                className="w-full"
                label={t('commentFuehrungskraft')}
                placeholder={t('commentFuehrungskraftPlaceholder')}
                rows={10}
                control={control}
                maxLength={250}
                {...register('comment')}
              />
            </div>
          </div>
          <div className="col-span-12 flex justify-between">
            <ButtonTw
              className="h-full bg-red-600 text-white ring-red-700 hover:bg-red-500"
              size={ButtonSize.Large}
              secondary
              onClick={() => submitForm(false)}
              testId="abwesenheitGenehmigung-reject-button"
              isLoading={isLoading}
            >
              {t('button.reject')}
            </ButtonTw>
            <ButtonTw
              className="h-full"
              size={ButtonSize.Large}
              testId="abwesenheitGenehmigung-approve-button"
              onClick={() => submitForm(true)}
              isLoading={isLoading}
            >
              {t('button.approve')}
            </ButtonTw>
          </div>
        </form>
      </div>
    </DefaultModal>
  )
}
