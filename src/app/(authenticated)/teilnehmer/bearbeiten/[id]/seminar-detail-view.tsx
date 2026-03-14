import { PlusIcon } from '@heroicons/react/20/solid'
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline'
import dayjs from 'dayjs'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'

import SeminarPruefungEditForm from './pruefung-edit-form'
import ButtonTw, { ButtonSize } from '@/components/atoms/button-tw'
import DatepickerTw from '@/components/atoms/datepicker-tw'
import HorizontalRow from '@/components/atoms/hr-tw'
import InputSelectTw from '@/components/atoms/input-select-tw'
import InputTextTw from '@/components/atoms/input-text-tw'
import LoaderTw, { LoaderSize } from '@/components/atoms/loader-tw'
import TextareaTw from '@/components/atoms/textarea-tw'
import {
  TableCellTw,
  TableHeaderTw,
  TableTw,
} from '@/components/molecules/table-tw'
import { DefaultModal } from '@/components/organisms/default-modal'
import useAsyncEffect from '@/hooks/use-async-effect'
import { useFormEffect, useFormEffectOverrides } from '@/hooks/use-form-effect'
import { SeminarEntry, SeminarPruefung } from '@/lib/interfaces/teilnehmer'
import {
  convertArrayToKeyLabelOptions,
  setErrorsFromErrorsMap,
} from '@/lib/utils/form-utils'
import {
  ErrorsResponse,
  executeDELETE,
  executeGET,
  executePOST,
} from '@/lib/utils/gateway-utils'
import useMasterdataStore from '@/stores/form-store'

const SHOW_COMPLEX_FIELDS =
  process.env.NEXT_PUBLIC_STAGE === 'dev' ||
  process.env.NEXT_PUBLIC_STAGE === 'qa'

const formatDateInput = (date?: string | null) =>
  date ? dayjs(date).format('DD.MM.YYYY') : null

const SeminarDetailView: React.FC<{
  isReadOnly?: boolean
  selectedSeminar: SeminarEntry | null
  setSelectedSeminar: (seminar: SeminarEntry | null) => void
  setSeminarData?: React.Dispatch<React.SetStateAction<SeminarEntry[]>>
}> = ({ isReadOnly, setSelectedSeminar, selectedSeminar, setSeminarData }) => {
  const { id } = useParams<{ id: string }>()
  const teilnehmerId = parseInt(id as string)
  const [isLoading, setIsLoading] = useState(true)
  const { masterdataTN: masterdata } = useMasterdataStore()

  const defaultValues = {
    ...selectedSeminar,
    eintritt: formatDateInput(selectedSeminar?.eintritt),
    kursDatumVon: formatDateInput(selectedSeminar?.kursDatumVon),
    kursDatumBis: formatDateInput(selectedSeminar?.kursDatumBis),
  }

  const t = useTranslations('teilnehmer.bearbeiten')
  const {
    register,
    handleSubmit,
    setError,
    reset,
    control,
    clearErrors,
    watch,
    setValue,
  } = useForm<SeminarEntry>({ defaultValues })
  const [showForm, setShowForm] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedPruefungEntry, setSelectedPruefungEntry] =
    useState<SeminarPruefung | null>(null)

  const [seminarPruefungen, setSeminarPruefungen] = useState<SeminarPruefung[]>(
    []
  )

  const [getOverride, setOverride] = useFormEffectOverrides()

  useFormEffect<SeminarEntry>(
    {
      gesamtbeurteilungErgebnis: (value) => {
        setOverride('gesamtbeurteilungTyp', { required: value })
      },
    },
    watch,
    setValue
  )

  const deletePruefung = async (pruefungId: number) => {
    const { success } = await executeDELETE<{
      seminarPruefung: SeminarPruefung[]
    }>(`/teilnehmer/delete/pruefung/${pruefungId}`)

    if (success) {
      const updatedPruefungen = seminarPruefungen?.filter(
        (item) => item.id !== pruefungId
      )
      setSeminarPruefungen(updatedPruefungen || [])
    }
  }

  useAsyncEffect(async () => {
    if (selectedSeminar) {
      const { data } = await executeGET<{ seminarPruefung: SeminarPruefung[] }>(
        `/teilnehmer/${teilnehmerId}/seminar/${selectedSeminar.id}/pruefungen`
      )

      if (data?.seminarPruefung) {
        setSeminarPruefungen(data.seminarPruefung)
      }

      setIsLoading(false)
    }
  }, [selectedSeminar])

  const handleClosePruefungEditModal = () => {
    setShowForm(false)
    setSelectedPruefungEntry(null)
  }

  const handleClosePruefungDeleteModal = () => {
    setShowDeleteModal(false)
    setSelectedPruefungEntry(null)
  }

  const handleDeletePruefung = async () => {
    if (selectedPruefungEntry?.id) {
      await deletePruefung(selectedPruefungEntry.id)
      setSelectedPruefungEntry(null)
      setShowDeleteModal(false)
    }
  }

  const onSubmit = async (formValues: SeminarEntry) => {
    setIsLoading(true)

    const { data } = await executePOST<{
      seminar: Array<SeminarEntry & ErrorsResponse>
    }>(`/teilnehmer/edit/${teilnehmerId}/seminar`, {
      teilnehmerId,
      ...formValues,
    })

    const currentSeminar = data?.seminar[0]

    if (currentSeminar) {
      clearErrors()

      reset(currentSeminar)

      if (currentSeminar.errors?.length && currentSeminar.errorsMap) {
        setErrorsFromErrorsMap(currentSeminar.errorsMap, setError)
      } else {
        // Update seminar entry in parent component
        if (setSeminarData) {
          setSeminarData((prevSeminars) =>
            prevSeminars.map((seminar) =>
              seminar.id === currentSeminar.id ? currentSeminar : seminar
            )
          )
        }
      }
    }

    setIsLoading(false)
  }

  return (
    <>
      <div className="grid grid-cols-12 gap-x-8 gap-y-6">
        <div className="col-span-12">
          <h2 className="mb-6 text-2xl leading-7 font-semibold text-gray-900">
            {t('label.seminarDetails')}
          </h2>
        </div>
      </div>
      {isLoading ? (
        <div className="col-span-12 flex h-[760px] items-center justify-center">
          <LoaderTw size={LoaderSize.XLarge} />
        </div>
      ) : (
        <div className="flex flex-col gap-y-6">
          {SHOW_COMPLEX_FIELDS && (
            <div className="grid grid-cols-12 gap-x-8 gap-y-6">
              <div className="col-span-12">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-xl leading-7 font-semibold text-gray-900">
                    {t('label.pruefungen')}
                  </h3>
                  <ButtonTw
                    className="flex h-12 items-center gap-1"
                    onClick={() => setShowForm(true)}
                    testId="unterhaltsberechtigt-create-button"
                  >
                    <PlusIcon className="size-6" />
                    {t('label.pruefungHinzufuegen')}
                  </ButtonTw>
                </div>
                {seminarPruefungen.length ? (
                  <TableTw className="flex-auto">
                    <thead className="bg-gray-50">
                      <tr>
                        <TableHeaderTw>
                          {t(`pruefungTable.bezeichnung`)}
                        </TableHeaderTw>
                        <TableHeaderTw>
                          {t(`pruefungTable.artDerPruefung`)}
                        </TableHeaderTw>
                        <TableHeaderTw>
                          {t(`pruefungTable.gegenstand`)}
                        </TableHeaderTw>
                        <TableHeaderTw>
                          {t(`pruefungTable.niveau`)}
                        </TableHeaderTw>
                        <TableHeaderTw>
                          {t(`pruefungTable.institut`)}
                        </TableHeaderTw>
                        <TableHeaderTw>
                          {t(`pruefungTable.pruefungsantritt`)}
                        </TableHeaderTw>
                        <TableHeaderTw>
                          {t(`pruefungTable.ergebnis`)}
                        </TableHeaderTw>
                        <TableHeaderTw>
                          {t(`pruefungTable.ergebnisInProzent`)}
                        </TableHeaderTw>
                        <TableHeaderTw>
                          {t(`pruefungTable.pruefungAm`)}
                        </TableHeaderTw>
                        <TableHeaderTw>{``}</TableHeaderTw>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {seminarPruefungen.map((entry) => (
                        <tr key={entry.id}>
                          <TableCellTw testId="pruefung-td-bezeichnung">
                            {entry.bezeichnung}
                          </TableCellTw>
                          <TableCellTw testId="pruefung-td-pruefungArt">
                            {entry.pruefungArt}
                          </TableCellTw>
                          <TableCellTw testId="pruefung-td-gegenstand">
                            {entry.gegenstand}
                          </TableCellTw>
                          <TableCellTw testId="pruefung-td-niveau">
                            {entry.niveau}
                          </TableCellTw>
                          <TableCellTw testId="pruefung-td-institut">
                            {entry.institut}
                          </TableCellTw>
                          <TableCellTw testId="pruefung-td-antritt">
                            {entry.antritt === 'false' ||
                            entry.antritt === false
                              ? t('label.antrittNein')
                              : entry.antritt === 'true' ||
                                  entry.antritt === true
                                ? t('label.antrittJa')
                                : t('label.ungewiss')}
                          </TableCellTw>
                          <TableCellTw testId="pruefung-td-ergebnis">
                            {entry.ergebnis}
                          </TableCellTw>
                          <TableCellTw testId="pruefung-td-ergebnisInProzent">
                            {entry.ergebnisInProzent}
                          </TableCellTw>
                          <TableCellTw testId="pruefung-td-pruefungAm">
                            {entry.pruefungAm &&
                              dayjs(entry.pruefungAm).format('DD.MM.YYYY')}
                          </TableCellTw>
                          <TableCellTw>
                            <span className="flex justify-end gap-3">
                              <ButtonTw
                                testId="pruefung-entry-edit-button"
                                disabled={isReadOnly}
                                onClick={() => {
                                  setShowForm(true)
                                  setSelectedPruefungEntry(entry)
                                }}
                              >
                                <PencilSquareIcon className="size-4" />
                              </ButtonTw>
                              <ButtonTw
                                className="bg-red-600 ring-red-700 hover:bg-red-500"
                                testId="pruefung-entry-delete-button"
                                disabled={isReadOnly}
                                onClick={() => {
                                  setShowDeleteModal(true)
                                  setSelectedPruefungEntry(entry)
                                }}
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
                  <p>{t('pruefungTable.noResults')}</p>
                )}
              </div>
              <HorizontalRow className="col-span-12 mt-2 border-gray-900/10" />
            </div>
          )}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-12 gap-x-8 gap-y-6"
          >
            <div className="col-span-12">
              <h3 className="text-xl leading-7 font-semibold text-gray-900">
                {t('label.seminarDaten')}
              </h3>
            </div>
            {/* Infofields */}
            <div className="col-span-6 lg:col-span-2">
              <InputTextTw
                label={t('label.projektId')}
                control={control}
                disabled
                {...register('projektId')}
              />
            </div>
            <div className="col-span-6 lg:col-span-4">
              <InputTextTw
                label={t('label.projektbezeichnung')}
                control={control}
                disabled
                {...register('projektName')}
              />
            </div>
            <div className="col-span-6 lg:col-span-2">
              <InputTextTw
                label={t('label.seminarId')}
                control={control}
                disabled
                {...register('seminarNumber')}
              />
            </div>
            <div className="col-span-6 lg:col-span-4">
              <InputTextTw
                label={t('label.seminarBezeichnung')}
                control={control}
                disabled
                {...register('seminarBezeichnung')}
              />
            </div>
            <div className="col-span-6 lg:col-span-4">
              <InputTextTw
                label={t('label.eintritt')}
                control={control}
                disabled
                {...register('eintritt')}
              />
            </div>
            <div className="col-span-6 lg:col-span-4">
              <InputTextTw
                label={t('label.kursVon')}
                control={control}
                disabled
                {...register('kursDatumVon')}
              />
            </div>
            <div className="col-span-6 lg:col-span-4">
              <InputTextTw
                label={t('label.kursBis')}
                control={control}
                disabled
                {...register('kursDatumBis')}
              />
            </div>
            <div className="col-span-6 lg:col-span-4">
              <InputTextTw
                label={t('label.schieneUhrzeit')}
                control={control}
                disabled
                {...register('schieneUhrzeit')}
              />
            </div>
            <div className="col-span-6 lg:col-span-4">
              <InputTextTw
                label={t('label.kostentraeger')}
                control={control}
                disabled
                {...register('kostentraeger')}
              />
            </div>
            <div className="col-span-6 lg:col-span-4">
              <InputTextTw
                label={t('label.standort')}
                control={control}
                disabled
                {...register('standort')}
              />
            </div>
            <div className="col-span-6 lg:col-span-4">
              <InputTextTw
                label={t('label.rgs')}
                control={control}
                disabled
                {...register('rgs')}
              />
            </div>
            <div className="col-span-6 lg:col-span-4">
              <InputTextTw
                label={t('label.betreuer')}
                control={control}
                disabled
                {...register('betreuer')}
              />
            </div>
            <div className="col-span-6 lg:col-span-4">
              <InputTextTw
                label={t('label.buchungsstatus')}
                control={control}
                disabled
                {...register('buchungsstatus')}
              />
            </div>
            <div className="col-span-6 lg:col-span-4">
              <InputTextTw
                label={t('label.seminarSchliesszeiten')}
                control={control}
                disabled
                {...register('seminarSchliesszeiten')}
              />
            </div>
            <HorizontalRow className="col-span-12 mt-2 border-gray-900/10" />
            {SHOW_COMPLEX_FIELDS && (
              <>
                {/* // Editable fields */}
                <div className="col-span-12 lg:col-span-2">
                  <DatepickerTw
                    label={t('label.austritt')}
                    placeholder={t('placeholder.austritt')}
                    control={control}
                    {...register('austritt')}
                  />
                </div>
                <div className="col-span-12 lg:col-span-2">
                  <InputSelectTw
                    label={t('label.austrittsgrund')}
                    placeholder={t('placeholder.austrittsgrund')}
                    options={convertArrayToKeyLabelOptions(
                      masterdata?.seminarAustrittsgrundList
                    )}
                    control={control}
                    {...register('austrittsgrund')}
                  />
                </div>
                <div className="col-span-12 lg:col-span-2">
                  <DatepickerTw
                    label={t('label.begehrenBis')}
                    placeholder={t('placeholder.begehrenBis')}
                    control={control}
                    {...register('begehrenBis')}
                  />
                </div>
                <div className="col-span-12 lg:col-span-6">
                  <InputTextTw
                    label={t('label.zusaetzlicheUnterstuetzung')}
                    placeholder={t('placeholder.zusaetzlicheUnterstuetzung')}
                    control={control}
                    {...register('zusaetzlicheUnterstuetzung')}
                  />
                </div>
                <div className="col-span-12 lg:col-span-2">
                  <DatepickerTw
                    label={t('label.fruehwarnung')}
                    placeholder={t('placeholder.fruehwarnung')}
                    control={control}
                    {...register('fruehwarnung')}
                  />
                </div>
                <div className="col-span-12 lg:col-span-4">
                  <InputTextTw
                    label={t('label.anmerkungEmpfehlung')}
                    placeholder={t('placeholder.anmerkungEmpfehlung')}
                    control={control}
                    {...register('anmerkung')}
                  />
                </div>
                <div className="col-span-12 lg:col-span-6">
                  <TextareaTw
                    label={t('label.lernfortschritt')}
                    placeholder={t('placeholder.lernfortschritt')}
                    control={control}
                    {...register('lernfortschritt')}
                  />
                </div>
                <HorizontalRow className="col-span-12 mt-2 border-gray-900/10" />

                <div className="col-span-12">
                  <h3 className="text-xl leading-7 font-semibold text-gray-900">
                    {t('label.gesamtbeurteilung')}
                  </h3>
                </div>

                <div className="col-span-12 lg:col-span-6">
                  <InputSelectTw
                    label={t('label.gesamtbeurteilungTyp')}
                    placeholder={t('placeholder.gesamtbeurteilungTyp')}
                    control={control}
                    options={convertArrayToKeyLabelOptions(
                      masterdata?.seminarPruefungGegenstandList
                    )}
                    {...register('gesamtbeurteilungTyp')}
                    {...getOverride('gesamtbeurteilungTyp')}
                  />
                </div>
                <div className="col-span-12 lg:col-span-6">
                  <InputSelectTw
                    label={t('label.gesamtbeurteilungErgebnis')}
                    placeholder={t('placeholder.gesamtbeurteilungErgebnis')}
                    control={control}
                    options={convertArrayToKeyLabelOptions(
                      masterdata?.seminarPruefungErgebnisList
                    )}
                    {...register('gesamtbeurteilungErgebnis')}
                  />
                </div>
                <HorizontalRow className="col-span-12 mt-2 border-gray-900/10" />
              </>
            )}

            <div className="col-span-12">
              <h3 className="text-xl leading-7 font-semibold text-gray-900">
                {t('label.trainer')}
              </h3>
            </div>
            <div className="col-span-12">
              {selectedSeminar?.trainer?.length ? (
                <TableTw className="flex-auto">
                  <thead className="bg-gray-50">
                    <tr>
                      <TableHeaderTw className="whitespace-nowrap">
                        {t('trainerTable.name')}
                      </TableHeaderTw>
                      <TableHeaderTw className="whitespace-nowrap">
                        {t('trainerTable.email')}
                      </TableHeaderTw>
                      <TableHeaderTw className="whitespace-nowrap">
                        {t('trainerTable.funktion')}
                      </TableHeaderTw>
                      <TableHeaderTw className="whitespace-nowrap">
                        {t('trainerTable.bezugsdauer')}
                      </TableHeaderTw>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedSeminar?.trainer?.map((trainer, index) => (
                      <tr key={index}>
                        <TableCellTw>{trainer.name}</TableCellTw>
                        <TableCellTw>{trainer.email}</TableCellTw>
                        <TableCellTw>{trainer.funktion}</TableCellTw>
                        <TableCellTw>
                          {trainer.bezugsdauerStart &&
                            trainer.bezugsdauerEnde &&
                            `${dayjs(trainer.bezugsdauerStart).format('DD.MM.YYYY')} - ${dayjs(trainer.bezugsdauerEnde).format('DD.MM.YYYY')}`}
                        </TableCellTw>
                      </tr>
                    ))}
                  </tbody>
                </TableTw>
              ) : (
                <p>{t('trainerTable.noResults')}</p>
              )}
            </div>
            <HorizontalRow className="col-span-12 mt-2 border-gray-900/10" />

            <div className="col-span-12 flex justify-between">
              <ButtonTw
                className="h-full"
                size={ButtonSize.Large}
                secondary
                testId="seminar-detail-cancel"
                onClick={() => setSelectedSeminar(null)}
              >
                {t('label.cancel')}
              </ButtonTw>
              <ButtonTw
                type="submit"
                className="h-full"
                size={ButtonSize.Large}
                testId="seminar-detail-save"
              >
                {t('label.save')}
              </ButtonTw>
            </div>
          </form>
        </div>
      )}
      <DefaultModal
        showModal={showForm}
        closeModal={handleClosePruefungEditModal}
      >
        <SeminarPruefungEditForm
          seminarPruefungEntry={selectedPruefungEntry}
          teilnehmerId={teilnehmerId}
          seminarId={selectedSeminar?.id}
          setSeminarPruefungen={setSeminarPruefungen}
          closeForm={handleClosePruefungEditModal}
        />
      </DefaultModal>
      <DefaultModal
        showModal={showDeleteModal}
        closeModal={handleClosePruefungDeleteModal}
      >
        <div className="space-y-6">
          <div className="mb-6 flex content-center items-center justify-between">
            <h3 className="text-2xl leading-7 font-semibold text-gray-900">
              {t('label.deletePruefung')}
            </h3>
          </div>
          <div>
            <p>{t('label.deletePruefungDescription')}</p>
          </div>
          <HorizontalRow />

          <div className="col-span-12 flex justify-between">
            <ButtonTw
              className="h-full"
              size={ButtonSize.Large}
              secondary
              testId="pruefung-delete-cancel-button"
              onClick={handleClosePruefungDeleteModal}
            >
              {t('label.cancel')}
            </ButtonTw>
            <ButtonTw
              className="h-full bg-red-600 ring-red-700 hover:bg-red-500"
              size={ButtonSize.Large}
              onClick={handleDeletePruefung}
              testId="pruefung-delete-confirm-button"
            >
              {t('label.deletePruefungSubmit')}
            </ButtonTw>
          </div>
        </div>
      </DefaultModal>
    </>
  )
}

export default SeminarDetailView
