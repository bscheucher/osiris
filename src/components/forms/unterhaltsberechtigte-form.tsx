import { PlusIcon } from '@heroicons/react/20/solid'
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline'
import dayjs from 'dayjs'
import { useTranslations } from 'next-intl'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import HorizontalRow from '../atoms/hr-tw'
import ButtonTw, { ButtonSize } from '@/components/atoms/button-tw'
import DatepickerTw from '@/components/atoms/datepicker-tw'
import InputSelectTw from '@/components/atoms/input-select-tw'
import InputTextTw from '@/components/atoms/input-text-tw'
import LoaderTw, { LoaderSize } from '@/components/atoms/loader-tw'
import {
  TableCellTw,
  TableHeaderTw,
  TableTw,
} from '@/components/molecules/table-tw'
import { DefaultModal } from '@/components/organisms/default-modal'
import useAsyncEffect from '@/hooks/use-async-effect'
import { UnterhaltsberechtigteEntry } from '@/lib/interfaces/mitarbeiter'
import { getAgeAsString } from '@/lib/utils/date-utils'
import { convertToKeyLabelOptions } from '@/lib/utils/form-utils'
import {
  executeDELETE,
  executeGET,
  executePOST,
} from '@/lib/utils/gateway-utils'
import { addLeadingZeros } from '@/lib/utils/number-utils'
import { showErrorMessage, showSuccess } from '@/lib/utils/toast-utils'
import useMasterdataStore from '@/stores/form-store'

interface ModalProps {
  personalnummer: string
  showModal: boolean
  unterhaltsberechtigt: UnterhaltsberechtigteEntry | null
  isOnboarding?: boolean

  closeModal: () => void
  setUnterhaltsberechtigteList: React.Dispatch<
    React.SetStateAction<UnterhaltsberechtigteEntry[]>
  >
}

const INITIAL_STATE = {
  uvorname: '',
  unachname: '',
  usvnr: '',
  ugeburtsdatum: '',
  uverwandtschaft: '',
}

const addLeadingZeroToEntry = (entry: UnterhaltsberechtigteEntry) => ({
  ...entry,
  usvnr: addLeadingZeros(entry.usvnr),
})

const UnterhaltsberechtigteModal = ({
  personalnummer,
  unterhaltsberechtigt,
  showModal,
  isOnboarding,
  closeModal,
  setUnterhaltsberechtigteList,
}: ModalProps) => {
  const t = useTranslations(
    'mitarbeiter.erfassen.vertragsdaten.unterhaltsberechtigte'
  )
  const [isLoading, setIsLoading] = useState(false)
  const { masterdataMA: masterdata } = useMasterdataStore()

  const { register, handleSubmit, setError, reset, control } =
    useForm<UnterhaltsberechtigteEntry>()

  useEffect(() => {
    if (unterhaltsberechtigt) {
      reset(addLeadingZeroToEntry(unterhaltsberechtigt))
    } else {
      reset(INITIAL_STATE)
    }
  }, [reset, unterhaltsberechtigt])

  const formHandler = async (
    newUnterhaltsberechtigt: UnterhaltsberechtigteEntry
  ) => {
    setIsLoading(true)
    const unterhaltsberechtigtWithPersonalnummer = {
      ...newUnterhaltsberechtigt,
      personalnummer,
    }

    try {
      const response = await executePOST<{
        unterhaltsberechtigte: UnterhaltsberechtigteEntry[]
        unterhaltsberechtigt: UnterhaltsberechtigteEntry[]
      }>(
        `/mitarbeiter/vertragsdaten/unterhaltsberechtigte${isOnboarding ? '?isOnboarding=true' : ''}`,
        unterhaltsberechtigtWithPersonalnummer
      )

      const unterhaltsberechtigt = response.data?.unterhaltsberechtigt[0]

      if (
        unterhaltsberechtigt?.errors?.length &&
        unterhaltsberechtigt?.errorsMap
      ) {
        Object.entries(unterhaltsberechtigt.errorsMap).forEach(
          ([fieldName, errorMessage]) => {
            setError(fieldName as keyof UnterhaltsberechtigteEntry, {
              type: 'server',
              message: errorMessage,
            })
          }
        )
      } else {
        showSuccess(t('message.save.success'))
        if (response.data?.unterhaltsberechtigte) {
          setUnterhaltsberechtigteList(response.data?.unterhaltsberechtigte)
        }
        closeModal()
        reset(INITIAL_STATE)
      }
    } catch (e) {
      showErrorMessage(e)
    }

    setIsLoading(false)
  }

  return (
    <DefaultModal
      showModal={showModal}
      modalSize="2xl"
      closeModal={closeModal}
      testId="unterhaltsberechtigte-form-modal"
    >
      <form onSubmit={handleSubmit(formHandler)}>
        <div className="space-y-6">
          <div className="mb-6 flex content-center items-center justify-between">
            <h3
              className="text-2xl leading-7 font-semibold text-gray-900"
              data-testid="unterhaltsberechtigt-form-headline"
            >
              {t('label.unterhaltsberechtigteHinzufuegen')}
            </h3>
          </div>
          <div>
            <div className="grid grid-cols-12 gap-x-8 gap-y-6">
              <div className="col-span-12 lg:col-span-6">
                <InputTextTw
                  label={t('label.uvorname')}
                  placeholder={t('placeholder.uvorname')}
                  control={control}
                  required
                  {...register('uvorname')}
                />
              </div>
              <div className="col-span-12 lg:col-span-6">
                <InputTextTw
                  label={t('label.unachname')}
                  placeholder={t('placeholder.unachname')}
                  control={control}
                  required
                  {...register('unachname')}
                />
              </div>
              <div className="col-span-12 lg:col-span-6">
                <InputTextTw
                  label={t('label.usvnr')}
                  placeholder={t('placeholder.usvnr')}
                  control={control}
                  required
                  type="number"
                  {...register('usvnr')}
                />
              </div>
              <div className="col-span-12 lg:col-span-6">
                <DatepickerTw
                  label={t('label.ugeburtsdatum')}
                  placeholder={t('placeholder.ugeburtsdatum')}
                  control={control}
                  required
                  {...register('ugeburtsdatum')}
                />
              </div>
              <div className="col-span-12 lg:col-span-6">
                <InputSelectTw
                  label={t('label.uverwandtschaft')}
                  options={convertToKeyLabelOptions(
                    masterdata?.verwandtschaftList
                  )}
                  placeholder={t('placeholder.uverwandtschaft')}
                  control={control}
                  required
                  {...register('uverwandtschaft')}
                />
              </div>
            </div>
          </div>
          <HorizontalRow />

          <div className="col-span-12 flex justify-between">
            <ButtonTw
              type="button"
              className="h-full"
              size={ButtonSize.Large}
              secondary
              disabled={isLoading}
              isLoading={isLoading}
              onClick={() => closeModal()}
              testId="unterhaltsberechtigt-abort-button"
            >
              {t('label.abort')}
            </ButtonTw>
            <ButtonTw
              type="submit"
              className="h-full"
              size={ButtonSize.Large}
              disabled={isLoading}
              isLoading={isLoading}
              testId="unterhaltsberechtigt-save-button"
            >
              {t('label.submit')}
            </ButtonTw>
          </div>
        </div>
      </form>
    </DefaultModal>
  )
}

interface FormProps {
  personalnummer: string
  isReadOnly: boolean
  isOnboarding?: boolean
}

const UnterhaltsberechtigteForm = ({
  personalnummer,
  isReadOnly,
  isOnboarding,
}: FormProps) => {
  const t = useTranslations(
    'mitarbeiter.erfassen.vertragsdaten.unterhaltsberechtigte'
  )
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const [unterhaltsberechtigteList, setUnterhaltsberechtigteList] = useState<
    UnterhaltsberechtigteEntry[]
  >([])
  const [selectedUnterhaltsberechtigt, setSelectedUnterhaltsberechtigt] =
    useState<UnterhaltsberechtigteEntry | null>(null)

  useAsyncEffect(async () => {
    try {
      const { data } = await executeGET<{
        unterhaltsberechtigte: UnterhaltsberechtigteEntry[]
      }>(
        `/mitarbeiter/vertragsdaten/unterhaltsberechtigte/${personalnummer}${isOnboarding ? '?isOnboarding=true' : ''}`
      )

      if (data?.unterhaltsberechtigte) {
        setUnterhaltsberechtigteList(data?.unterhaltsberechtigte)
      }
    } catch (e) {
      showErrorMessage(e)
    }
    setIsLoading(false)
  }, [])

  const handleDeleteUnterhaltsberechtigt = async (
    entry: UnterhaltsberechtigteEntry
  ) => {
    try {
      if (entry.id) {
        await executeDELETE<{
          unterhaltsberechtigte: UnterhaltsberechtigteEntry[]
        }>(
          `/mitarbeiter/vertragsdaten/unterhaltsberechtigte/delete/${entry.id}`
        )

        showSuccess(t('message.delete.success'))
        setUnterhaltsberechtigteList((list) =>
          list.filter((item) => item.id !== entry.id)
        )
      }
    } catch (e) {
      showErrorMessage(e)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditUnterhaltsberechtigt = async (
    entry: UnterhaltsberechtigteEntry
  ) => {
    setSelectedUnterhaltsberechtigt(entry)
    setShowModal(true)
  }

  return (
    <>
      <div className="mb-6 flex content-center items-center justify-between">
        <h3 className="text-2xl leading-7 font-semibold text-gray-900">
          {t('title')}
        </h3>
        <ButtonTw
          className="flex h-12 items-center gap-1"
          onClick={() => setShowModal(true)}
          testId="unterhaltsberechtigt-create-button"
          disabled={isReadOnly}
        >
          <PlusIcon className="h-6 w-6" />
          {t('create')}
        </ButtonTw>
      </div>
      <div className="grid grid-cols-12 gap-x-8 gap-y-6">
        <div className="col-span-12 mb-8">
          {isLoading ? (
            <div className="flex h-[250px] items-center justify-center">
              <LoaderTw size={LoaderSize.XLarge} />
            </div>
          ) : unterhaltsberechtigteList.length ? (
            <TableTw className="flex-auto">
              <thead className="bg-gray-50">
                <tr>
                  <TableHeaderTw>{t(`table.uvorname`)}</TableHeaderTw>
                  <TableHeaderTw>{t(`table.unachname`)}</TableHeaderTw>
                  <TableHeaderTw>{t(`table.usvnr`)}</TableHeaderTw>
                  <TableHeaderTw>{t(`table.ugeburtsdatum`)}</TableHeaderTw>
                  <TableHeaderTw>{t(`table.alter`)}</TableHeaderTw>
                  <TableHeaderTw>{t(`table.uverwandtschaft`)}</TableHeaderTw>
                  <TableHeaderTw className="text-right whitespace-nowrap">
                    {t(`table.bearbeitenLoeschen`)}
                  </TableHeaderTw>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {unterhaltsberechtigteList.map((entry) => (
                  <tr key={entry.id}>
                    <TableCellTw>{entry.uvorname}</TableCellTw>
                    <TableCellTw>{entry.unachname}</TableCellTw>
                    <TableCellTw>{addLeadingZeros(entry.usvnr)}</TableCellTw>
                    <TableCellTw>
                      {dayjs(entry.ugeburtsdatum).format('DD.MM.YYYY')}
                    </TableCellTw>
                    <TableCellTw>
                      {getAgeAsString(entry.ugeburtsdatum)}
                    </TableCellTw>
                    <TableCellTw>{entry.uverwandtschaft}</TableCellTw>
                    <TableCellTw>
                      <span className="flex justify-end gap-3">
                        <ButtonTw
                          onClick={() => handleEditUnterhaltsberechtigt(entry)}
                          testId="unterhaltsberechtigt-edit-button"
                          disabled={isReadOnly}
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                        </ButtonTw>
                        <ButtonTw
                          className="bg-red-600 ring-red-700 hover:bg-red-500"
                          onClick={() => {
                            setShowDeleteModal(true)
                            setSelectedUnterhaltsberechtigt(entry)
                          }}
                          testId="unterhaltsberechtigt-delete-button"
                          disabled={isReadOnly}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </ButtonTw>
                      </span>
                    </TableCellTw>
                  </tr>
                ))}
              </tbody>
            </TableTw>
          ) : (
            <p>{t('table.noResults')}</p>
          )}
        </div>
      </div>
      <UnterhaltsberechtigteModal
        personalnummer={personalnummer}
        showModal={showModal}
        closeModal={() => {
          setShowModal(false)
          setSelectedUnterhaltsberechtigt(null)
        }}
        isOnboarding={isOnboarding}
        unterhaltsberechtigt={selectedUnterhaltsberechtigt}
        setUnterhaltsberechtigteList={setUnterhaltsberechtigteList}
      />
      <DefaultModal
        showModal={showDeleteModal}
        closeModal={() => {
          setShowDeleteModal(false)
          setSelectedUnterhaltsberechtigt(null)
        }}
      >
        <div className="space-y-6">
          <div className="mb-6 flex content-center items-center justify-between">
            <h3 className="text-2xl leading-7 font-semibold text-gray-900">
              {t('label.deleteTitle')}
            </h3>
          </div>
          <div>
            <p>{t('label.deleteDescription')}</p>
          </div>
          <HorizontalRow />

          <div className="col-span-12 flex justify-between">
            <ButtonTw
              className="h-full"
              size={ButtonSize.Large}
              secondary
              disabled={isLoading}
              isLoading={isLoading}
              onClick={() => {
                setShowDeleteModal(false)
                setSelectedUnterhaltsberechtigt(null)
              }}
              testId="unterhaltsberechtigt-delete-abort-button"
            >
              {t('label.abort')}
            </ButtonTw>
            <ButtonTw
              onClick={() => {
                if (selectedUnterhaltsberechtigt) {
                  handleDeleteUnterhaltsberechtigt(selectedUnterhaltsberechtigt)
                }
                setShowDeleteModal(false)
                setSelectedUnterhaltsberechtigt(null)
              }}
              className="h-full bg-red-600 ring-red-700 hover:bg-red-500"
              size={ButtonSize.Large}
              disabled={isLoading}
              isLoading={isLoading}
              testId="unterhaltsberechtigt-delete-confirm-button"
            >
              {t('label.delete')}
            </ButtonTw>
          </div>
        </div>
      </DefaultModal>
    </>
  )
}

export default UnterhaltsberechtigteForm
