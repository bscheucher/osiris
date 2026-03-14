import { PlusIcon } from '@heroicons/react/20/solid'
import {
  ArrowDownTrayIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import dayjs from 'dayjs'
import { useTranslations } from 'next-intl'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import HorizontalRow from '../atoms/hr-tw'
import ButtonTw, { ButtonSize } from '@/components/atoms/button-tw'
import DatepickerTw from '@/components/atoms/datepicker-tw'
import InputFileOnboardingTw from '@/components/atoms/input-file-onboarding-tw'
import InputSelectTw from '@/components/atoms/input-select-tw'
import InputTextTw from '@/components/atoms/input-text-tw'
import InputToggleTw from '@/components/atoms/input-toggle-tw'
import LoaderTw, { LoaderSize } from '@/components/atoms/loader-tw'
import {
  TableCellTw,
  TableHeaderTw,
  TableTw,
} from '@/components/molecules/table-tw'
import { DefaultModal } from '@/components/organisms/default-modal'
import useAsyncEffect from '@/hooks/use-async-effect'
import { useFormEffect, useFormEffectOverrides } from '@/hooks/use-form-effect'
import {
  FileStatus,
  FileUploadType,
} from '@/lib/constants/mitarbeiter-constants'
import { VordienstzeitEntry } from '@/lib/interfaces/mitarbeiter'
import { convertToKeyLabelOptions } from '@/lib/utils/form-utils'
import {
  executeDELETE,
  executeFileDownload,
  executeGET,
  executePOST,
  executeFileUpload,
} from '@/lib/utils/gateway-utils'
import {
  showError,
  showErrorMessage,
  showSuccess,
} from '@/lib/utils/toast-utils'
import useMasterdataStore from '@/stores/form-store'

interface ModalProps {
  personalnummer: string
  showModal: boolean
  vordienstzeit: VordienstzeitEntry | null
  isOnboarding?: boolean

  closeModal: () => void
  setVordienstzeitenList: React.Dispatch<
    React.SetStateAction<VordienstzeitEntry[]>
  >
}

const INITIAL_STATE = {
  vordienstzeitenVon: '',
  vordienstzeitenBis: '',
  vwochenstunden: '',
  vertragsart: '',
  firma: '',
  anrechenbar: false,
  nachweis: undefined,
}

const VordienstzeitenModal = ({
  personalnummer,
  vordienstzeit,
  showModal,
  isOnboarding,
  closeModal,
  setVordienstzeitenList,
}: ModalProps) => {
  const t = useTranslations(
    'mitarbeiter.erfassen.vertragsdaten.vordienstzeiten'
  )
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const { masterdataMA: masterdata } = useMasterdataStore()

  const { register, handleSubmit, setError, reset, watch, setValue, control } =
    useForm<VordienstzeitEntry>()

  const [getOverride, setOverride] = useFormEffectOverrides()

  // TODO: add re-run on vordienstzeit change like useEffect dependency []
  useFormEffect<VordienstzeitEntry>(
    {
      anrechenbar: (value) => {
        setOverride('nachweis', {
          required: !!value,
        })
      },
    },
    watch,
    setValue
  )

  useEffect(() => {
    if (vordienstzeit) {
      reset(vordienstzeit)
    } else {
      reset(INITIAL_STATE)
    }
  }, [reset, vordienstzeit])

  const formHandler = async (newVordienstzeit: VordienstzeitEntry) => {
    setIsLoading(true)

    const vordienstzeitWithPersonalnummer = {
      ...newVordienstzeit,
      nachweis: selectedFile
        ? FileStatus.NOT_VERIFIED
        : newVordienstzeit.nachweis,
      personalnummer,
    }

    try {
      const response = await executePOST<{
        vordienstzeiten: VordienstzeitEntry[]
        vordienstzeit: VordienstzeitEntry[]
      }>(
        `/mitarbeiter/vertragsdaten/vordienstzeiten${isOnboarding ? '?isOnboarding=true' : ''}`,
        vordienstzeitWithPersonalnummer
      )
      const vordienstzeiten = response.data?.vordienstzeiten
      const vordienstzeit = response.data?.vordienstzeit[0]

      let vordienstzeitList = vordienstzeiten

      if (vordienstzeit?.errors?.length && vordienstzeit.errorsMap) {
        Object.entries(vordienstzeit.errorsMap).forEach(
          ([fieldName, errorMessage]) => {
            setError(fieldName as keyof VordienstzeitEntry, {
              type: 'server',
              message: errorMessage,
            })
          }
        )

        showError(t('message.save.error'))
      } else {
        if (selectedFile && vordienstzeit?.id) {
          const response = await executeFileUpload(
            selectedFile,
            FileUploadType.VORDIENSTZEITEN_NACHWEIS,
            personalnummer,
            vordienstzeit.id.toString()
          )

          if (!response) {
            throw new Error('Upload failed')
          } else {
            setSelectedFile(null)
            vordienstzeitList = vordienstzeitList?.map((entry) =>
              entry.id === vordienstzeit.id
                ? {
                    ...entry,
                    nachweis: FileStatus.NOT_VERIFIED,
                  }
                : entry
            )
          }
        }
        if (vordienstzeitList?.length) {
          setVordienstzeitenList(vordienstzeitList)
        }
        showSuccess(t('message.save.success'))
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
      closeModal={closeModal}
      modalSize="2xl"
      testId="vordienstzeiten-form-modal"
    >
      <form onSubmit={handleSubmit(formHandler)}>
        <div className="space-y-6">
          <div className="mb-6 flex content-center items-center justify-between">
            <h3
              className="text-2xl leading-7 font-semibold text-gray-900"
              data-testid="vordienstzeiten-form-headline"
            >
              {t('label.vordienstzeitHinzufuegen')}
            </h3>
          </div>
          <div>
            <div className="grid grid-cols-12 gap-x-8 gap-y-6">
              <div className="col-span-12 xl:col-span-6">
                <DatepickerTw
                  label={t('label.vordienstzeitenVon')}
                  placeholder={t('placeholder.vordienstzeitenVon')}
                  control={control}
                  required
                  {...register('vordienstzeitenVon')}
                />
              </div>
              <div className="col-span-12 xl:col-span-6">
                <DatepickerTw
                  label={t('label.vordienstzeitenBis')}
                  placeholder={t('placeholder.vordienstzeitenBis')}
                  control={control}
                  required
                  {...register('vordienstzeitenBis')}
                />
              </div>
              <div className="col-span-12 xl:col-span-6">
                <InputTextTw
                  label={t('label.vwochenstunden')}
                  placeholder={t('placeholder.vwochenstunden')}
                  control={control}
                  required
                  type="number"
                  {...register('vwochenstunden')}
                />
              </div>
              <div className="col-span-12 xl:col-span-6">
                <InputSelectTw
                  label={t('label.vertragsart')}
                  options={convertToKeyLabelOptions(
                    masterdata?.vertragsartList
                  )}
                  placeholder={t('placeholder.vertragsart')}
                  control={control}
                  required
                  {...register('vertragsart')}
                />
              </div>
              <div className="col-span-12 xl:col-span-6">
                <InputTextTw
                  label={t('label.firma')}
                  placeholder={t('placeholder.firma')}
                  control={control}
                  required
                  {...register('firma')}
                />
              </div>
              <div className="col-span-12 xl:col-span-6">
                <InputToggleTw
                  control={control}
                  label={t('label.anrechenbar')}
                  leftLabel={t('checkbox.prefix')}
                  rightLabel={t('checkbox.suffix')}
                  {...register('anrechenbar')}
                />
              </div>
              <div className="col-span-12 xl:col-span-12">
                <InputFileOnboardingTw
                  personalnummer={personalnummer}
                  label={t('label.nachweis')}
                  control={control}
                  onFileSelect={setSelectedFile}
                  preventAutoUpload
                  hideButtons
                  {...register('nachweis')}
                  {...getOverride('nachweis')}
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
              testId="vordienstzeit-abort-button"
            >
              {t('label.abort')}
            </ButtonTw>
            <ButtonTw
              type="submit"
              className="h-full"
              size={ButtonSize.Large}
              disabled={isLoading}
              isLoading={isLoading}
              testId="vordienstzeit-save-button"
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

const VordienstzeitenForm = ({
  personalnummer,
  isReadOnly,
  isOnboarding,
}: FormProps) => {
  const t = useTranslations(
    'mitarbeiter.erfassen.vertragsdaten.vordienstzeiten'
  )
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const [vordienstzeitenList, setVordienstzeitenList] = useState<
    VordienstzeitEntry[]
  >([])
  const [selectedVordienstzeit, setSelectedVordienstzeit] =
    useState<VordienstzeitEntry | null>(null)

  useAsyncEffect(async () => {
    try {
      const response = await executeGET<{
        vordienstzeiten: VordienstzeitEntry[]
        vordienstzeit: VordienstzeitEntry[]
      }>(
        `/mitarbeiter/vertragsdaten/vordienstzeiten/${personalnummer}${isOnboarding ? '?isOnboarding=true' : ''}`
      )

      if (response.data?.vordienstzeiten) {
        setVordienstzeitenList(response.data.vordienstzeiten)
      }
    } catch (e) {
      showErrorMessage(e)
    }
    setIsLoading(false)
  }, [])

  const handleNachweisDownload = async (entry: VordienstzeitEntry) => {
    await executeFileDownload('nachweis', entry.personalnummer, entry.id)
  }

  const handleDeleteVordienstzeit = async (entry: VordienstzeitEntry) => {
    try {
      if (entry.id) {
        await executeDELETE<{
          vordienstzeiten: VordienstzeitEntry[]
          vordienstzeit: VordienstzeitEntry[]
        }>(`/mitarbeiter/vertragsdaten/vordienstzeiten/delete/${entry.id}`)

        showSuccess(t('message.delete.success'))
        setVordienstzeitenList((list) =>
          list.filter((item) => item.id !== entry.id)
        )
      }
    } catch (e) {
      showErrorMessage(e)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditVordienstzeit = async (entry: VordienstzeitEntry) => {
    setSelectedVordienstzeit(entry)
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
          testId="vordienstzeit-create-button"
          disabled={isReadOnly}
        >
          <PlusIcon className="size-6" />
          {t('create')}
        </ButtonTw>
      </div>
      <div className="grid grid-cols-12 gap-x-8 gap-y-6">
        <div className="col-span-12 mb-8">
          {isLoading ? (
            <div className="flex h-[250px] items-center justify-center">
              <LoaderTw size={LoaderSize.XLarge} />
            </div>
          ) : vordienstzeitenList.length ? (
            <TableTw className="flex-auto">
              <thead className="bg-gray-50">
                <tr>
                  <TableHeaderTw>{t(`table.vertragsart`)}</TableHeaderTw>
                  <TableHeaderTw>{t(`table.firma`)}</TableHeaderTw>
                  <TableHeaderTw>{t(`table.zeitraum`)}</TableHeaderTw>
                  <TableHeaderTw>{t(`table.wochenstunden`)}</TableHeaderTw>
                  <TableHeaderTw>{t(`table.anrechenbar`)}</TableHeaderTw>
                  <TableHeaderTw>{t(`table.facheinschlägig`)}</TableHeaderTw>
                  <TableHeaderTw>{t(`table.nachweis`)}</TableHeaderTw>
                  <TableHeaderTw className="text-right whitespace-nowrap">
                    {t(`table.bearbeitenLoeschen`)}
                  </TableHeaderTw>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {vordienstzeitenList.map((entry) => (
                  <tr key={entry.id}>
                    <TableCellTw>{entry.vertragsart}</TableCellTw>
                    <TableCellTw>{entry.firma}</TableCellTw>
                    <TableCellTw>
                      <span className="whitespace-nowrap">
                        {`${dayjs(entry.vordienstzeitenVon).format('DD.MM.YYYY')} - ${dayjs(entry.vordienstzeitenBis).format('DD.MM.YYYY')}`}
                      </span>
                    </TableCellTw>
                    <TableCellTw>{entry.vwochenstunden}</TableCellTw>
                    <TableCellTw>
                      {entry.anrechenbar
                        ? t('table.anrechenbarJa')
                        : t('table.anrechenbarNein')}
                    </TableCellTw>
                    <TableCellTw>
                      {entry.facheinschlaegig ? entry.facheinschlaegig : '-'}
                    </TableCellTw>

                    <TableCellTw>
                      {entry.nachweis === FileStatus.NOT_VERIFIED ||
                      entry.nachweis === FileStatus.VERIFIED ? (
                        <ButtonTw
                          className="bg-ibis-emerald ring-emerald-600 hover:bg-emerald-500"
                          onClick={() => handleNachweisDownload(entry)}
                          title={entry.nachweisFilename}
                          testId="vordienstzeiten-file-download-button"
                        >
                          <ArrowDownTrayIcon className="size-4" />
                        </ButtonTw>
                      ) : (
                        t('table.keinNachweis')
                      )}
                    </TableCellTw>
                    <TableCellTw>
                      <span className="flex justify-end gap-3">
                        <ButtonTw
                          onClick={() => handleEditVordienstzeit(entry)}
                          testId="vordienstzeit-edit-button"
                          disabled={isReadOnly}
                        >
                          <PencilSquareIcon className="size-4" />
                        </ButtonTw>
                        <ButtonTw
                          className="bg-red-600 ring-red-700 hover:bg-red-500"
                          testId="vordienstzeit-delete-button"
                          onClick={() => {
                            setShowDeleteModal(true)
                            setSelectedVordienstzeit(entry)
                          }}
                          disabled={isReadOnly}
                        >
                          <TrashIcon className="size-4" />
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
      <VordienstzeitenModal
        personalnummer={personalnummer}
        showModal={showModal}
        vordienstzeit={selectedVordienstzeit}
        isOnboarding={isOnboarding}
        closeModal={() => {
          setShowModal(false)
          setSelectedVordienstzeit(null)
        }}
        setVordienstzeitenList={setVordienstzeitenList}
      />
      <DefaultModal
        showModal={showDeleteModal}
        closeModal={() => {
          setShowDeleteModal(false)
          setSelectedVordienstzeit(null)
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
              testId="vordienstzeit-delete-abort-button"
              onClick={() => {
                setShowDeleteModal(false)
                setSelectedVordienstzeit(null)
              }}
            >
              {t('label.abort')}
            </ButtonTw>
            <ButtonTw
              onClick={() => {
                if (selectedVordienstzeit) {
                  handleDeleteVordienstzeit(selectedVordienstzeit)
                }
                setShowDeleteModal(false)
                setSelectedVordienstzeit(null)
              }}
              className="h-full bg-red-600 ring-red-700 hover:bg-red-500"
              size={ButtonSize.Large}
              disabled={isLoading}
              isLoading={isLoading}
              testId="vordienstzeit-delete-confirm-button"
            >
              {t('label.delete')}
            </ButtonTw>
          </div>
        </div>
      </DefaultModal>
    </>
  )
}

export default VordienstzeitenForm
