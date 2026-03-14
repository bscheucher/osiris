import { PlusIcon, StarIcon } from '@heroicons/react/20/solid'
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useTranslations } from 'next-intl'
import { MouseEventHandler, useState } from 'react'
import { twMerge } from 'tailwind-merge'

import ButtonTw, { ButtonSize } from '@/components/atoms/button-tw'
import { SelectCore } from '@/components/atoms/input-select-tw'
import { InputTextCore } from '@/components/atoms/input-text-tw'
import { DashboardResponse } from '@/lib/interfaces/dashboardsData'
import { convertArrayToKeyLabelOptions } from '@/lib/utils/form-utils'

type DashboardToolbarProps = {
  isEditMode: boolean
  isLoading: boolean
  toggleEditMode: MouseEventHandler<HTMLButtonElement>
  handleFavouriteDashboard: MouseEventHandler<HTMLButtonElement>
  saveDashboard: () => void
  cancelEdit: MouseEventHandler<HTMLButtonElement>
  createDashboard: MouseEventHandler<HTMLButtonElement>
  deleteDashboard: MouseEventHandler<HTMLButtonElement>
  dashboardNames: string[]

  onDashboardSelect: (selectedName: string) => void
  selectedDashboardName: string
  selectedDashboardId: number
  dashboardsData: DashboardResponse
  editableDashboardName: string

  setEditableDashboardName: (name: string) => void
}

export default function DashboardToolbar({
  isEditMode,
  toggleEditMode,
  handleFavouriteDashboard,
  saveDashboard,
  isLoading,
  cancelEdit,
  createDashboard,
  deleteDashboard,
  dashboardNames,
  onDashboardSelect,
  selectedDashboardName,
  selectedDashboardId,
  dashboardsData,
  editableDashboardName,
  setEditableDashboardName,
}: DashboardToolbarProps) {
  const [nameError, setNameError] = useState('')
  const isFavouriteDashboard =
    selectedDashboardId === dashboardsData?.favouriteDashboard
  const t = useTranslations('dashboard.toolbar')

  return (
    <div
      className="z-20 ml-[7px] flex h-14 items-center justify-start"
      role="toolbar"
    >
      {isEditMode ? (
        <>
          <div className="flex h-10 flex-auto items-center gap-4">
            <InputTextCore
              placeholder={t('input.platzhalter')}
              className="w-80"
              value={editableDashboardName}
              onChange={(e) => {
                let newValue = e.target.value
                if (newValue.length > 30) {
                  setNameError(t('input.message.error'))
                  newValue = newValue.substring(0, 30)
                } else {
                  setNameError('')
                }
                setEditableDashboardName(newValue)
              }}
            />
            <div className="flex gap-4">
              <ButtonTw secondary onClick={cancelEdit} size={ButtonSize.Large}>
                {t('cancel')}
              </ButtonTw>
              <ButtonTw onClick={saveDashboard} size={ButtonSize.Large}>
                {t('save')}
              </ButtonTw>
            </div>
          </div>
          {nameError && (
            <p className="text-right text-sm text-red-500">{nameError}</p>
          )}
        </>
      ) : dashboardNames.length > 0 ? (
        <div className="flex items-center gap-4">
          <SelectCore
            options={convertArrayToKeyLabelOptions(dashboardNames)}
            onChange={(e) => void onDashboardSelect(e.target.value)}
            value={selectedDashboardName}
          />
          <ButtonTw
            testId="favourite-button"
            onClick={handleFavouriteDashboard}
            disabled={isFavouriteDashboard}
            className="bg-gray-200 text-white ring-gray-300 hover:bg-gray-300 disabled:bg-white disabled:ring-gray-200 disabled:hover:bg-white"
            size={ButtonSize.Medium}
          >
            <StarIcon
              className={twMerge(
                'flex h-6 w-6',
                isFavouriteDashboard ? 'text-ibis-yellow' : ''
              )}
            />
          </ButtonTw>
          <ButtonTw
            className="bg-emerald-500 text-white ring-emerald-500 hover:bg-emerald-600"
            testId="edit-button"
            onClick={toggleEditMode}
            size={ButtonSize.Medium}
          >
            <PencilSquareIcon className="flex h-6 w-6" />
          </ButtonTw>
          <ButtonTw
            className="text-white"
            testId="create-button"
            onClick={createDashboard}
            size={ButtonSize.Medium}
          >
            <PlusIcon className="flex h-6 w-6" />
          </ButtonTw>
          <ButtonTw
            className="bg-red-500 text-white ring-red-600 hover:bg-red-600"
            testId="delete-button"
            onClick={deleteDashboard}
            size={ButtonSize.Medium}
          >
            <TrashIcon className="flex h-6 w-6" />
          </ButtonTw>
        </div>
      ) : (
        !isLoading && (
          <ButtonTw
            testId="create-button"
            className="flex h-12 items-center gap-1 pl-4"
            onClick={createDashboard}
          >
            {t('button.erstellen')}
            <PlusIcon className="h-6 w-6" />
          </ButtonTw>
        )
      )}
    </div>
  )
}
