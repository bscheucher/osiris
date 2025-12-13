import { UserMinusIcon } from '@heroicons/react/24/outline'
import { useTranslations } from 'next-intl'
import React, { useEffect, useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'

import AusbildungTable from './ausbildung-table'
import BerufserfahrungTable from './berufserfahrung-table'
import KompetenzprofilUploadForm from './kompetenzprofil-upload-form'
import NotizenTable from './notizen-table'
import SeminarTable from './seminar-table'
import SprachkenntnisseTable from './sprachkenntnisse-table'
import TeilnehmerStammdatenSection from './teilnehmer-stammdaten-section'
import TeilnehmerVertragsdatenSection from './teilnehmer-vertragsdaten-section'
import ZertifikateTable from './zertifikate-table'
import BerufSelectTw from '@/components/atoms/beruf-select-tw'
import ButtonTw from '@/components/atoms/button-tw'
import ComboSelectTw from '@/components/atoms/combo-select-tw'
import DatepickerTw from '@/components/atoms/datepicker-tw/index'
import HorizontalRow from '@/components/atoms/hr-tw'
import InputSelectTw from '@/components/atoms/input-select-tw'
import InputTextTw from '@/components/atoms/input-text-tw'
import TextareaTw from '@/components/atoms/textarea-tw'
import { ConfirmModal } from '@/components/organisms/confirm-modal'
import { useCustomIsDirty } from '@/hooks/use-custom-is-dirty'
import { ROLE } from '@/lib/constants/role-constants'
import { SeminarEntry, Teilnehmer } from '@/lib/interfaces/teilnehmer'
import {
  convertToKeyLabelOptions,
  setErrorsFromErrorsMap,
} from '@/lib/utils/form-utils'
import { executePOST, toQueryString } from '@/lib/utils/gateway-utils'
import { showErrorMessage, showSuccess } from '@/lib/utils/toast-utils'
import useMasterdataStore from '@/stores/form-store'
import useUserStore from '@/stores/user-store'

const SHOW_COMPLEX_FIELDS =
  process.env.NEXT_PUBLIC_STAGE === 'dev' ||
  process.env.NEXT_PUBLIC_STAGE === 'qa'

export type TeilnehmerFormValues = Omit<Teilnehmer, 'id'>

const TeilnehmerEditForm = ({
  participant,
  seminarData,
  teilnehmerId,
  isReadOnly,
  setParticipant,
  setSeminarData,
}: {
  participant: Teilnehmer
  seminarData: SeminarEntry[]
  teilnehmerId?: number | null
  isReadOnly: boolean
  setParticipant?: React.Dispatch<React.SetStateAction<Teilnehmer | null>>
  setSeminarData?: React.Dispatch<React.SetStateAction<SeminarEntry[]>>
}) => {
  const t = useTranslations('teilnehmer.bearbeiten')
  const { hasSomeRole } = useUserStore()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    reset,
    clearErrors,
    watch,
    control,
  } = useForm<TeilnehmerFormValues>({
    defaultValues: participant,
  })
  const { masterdataTN: masterdata } = useMasterdataStore()
  const isDirty = useCustomIsDirty(participant, watch)

  useEffect(() => {
    if (participant) {
      // Clear any existing errors first
      clearErrors()

      reset(participant)

      // Set new errors from backend
      if (participant?.errorsMap || participant.stammdaten.errorsMap) {
        const completeErrorsMap = { ...participant?.errorsMap }
        if (participant.stammdaten && participant.stammdaten.errorsMap) {
          Object.entries(participant.stammdaten.errorsMap).forEach(
            ([key, value]) => {
              completeErrorsMap[`stammdaten.${key}`] = value
            }
          )
        }
        // faulty backend errorMap doesn't match fields and causes silent error
        setErrorsFromErrorsMap(completeErrorsMap, setError)
      }
    }
  }, [clearErrors, participant, reset, setError])

  const onSubmit: SubmitHandler<TeilnehmerFormValues> = async (
    teilnehmerFormData
  ) => {
    setIsLoading(true)

    try {
      const { data } = await executePOST<{ teilnehmerSeminars: any[] }>(
        `/teilnehmer/edit/${teilnehmerId}`,
        {
          teilnehmerDto: teilnehmerFormData,
        }
      )

      if (data?.teilnehmerSeminars[0]) {
        const { seminarDtos, teilnehmerDto } = data.teilnehmerSeminars[0]

        if (setParticipant && teilnehmerDto) {
          setParticipant(teilnehmerDto)
        }

        if (setSeminarData && seminarDtos) {
          setSeminarData(seminarDtos)
        }

        showSuccess(t('success.gespeichert'))
      }
    } catch (e) {
      showErrorMessage(e)
    } finally {
      setIsLoading(false)
    }
  }

  // This can be passed to other components
  const submitForm = handleSubmit((data) => {
    onSubmit(data)
  })

  return (
    <>
      <div className="space-y-8">
        <form>
          <div className="mb-8 space-y-10">
            <div className="border-b border-gray-900/10 pb-12">
              <div className="mb-6 flex items-center justify-between gap-x-6">
                <h3 className="text-xl leading-7 font-semibold text-gray-900">
                  {t('section.persoenlicheDaten')}
                </h3>
                <ButtonTw
                  type="submit"
                  disabled={isLoading || isReadOnly}
                  size="xlarge"
                  isLoading={isLoading}
                  onClick={submitForm}
                  testId="tn-save"
                >
                  {t('button.speichern')}
                </ButtonTw>
              </div>

              <div className="grid grid-cols-12 gap-x-8 gap-y-4">
                <div className="col-span-6 2xl:col-span-3">
                  <InputSelectTw
                    label={t('label.anrede')}
                    options={convertToKeyLabelOptions(masterdata?.anredeList)}
                    placeholder={t('placeholder.anrede')}
                    disabled={isReadOnly}
                    control={control}
                    {...register('anrede')}
                  />
                </div>
                <div className="col-span-6 2xl:col-span-3">
                  <InputSelectTw
                    label={t('label.titel')}
                    options={convertToKeyLabelOptions(masterdata?.titelList)}
                    placeholder={t('placeholder.titel')}
                    disabled={isReadOnly}
                    control={control}
                    {...register('titel')}
                  />
                </div>
                <div className="col-span-6 2xl:col-span-3">
                  <InputSelectTw
                    label={t('label.titel2')}
                    options={convertToKeyLabelOptions(masterdata?.titelList)}
                    placeholder={t('placeholder.titel2')}
                    disabled={isReadOnly}
                    control={control}
                    {...register('titel2')}
                  />
                </div>
                <div className="col-span-6 2xl:col-span-3">
                  <InputTextTw
                    label={t('label.vorname')}
                    placeholder={t('placeholder.vorname')}
                    control={control}
                    disabled={isReadOnly}
                    required
                    {...register('vorname')}
                  />
                </div>
                <div className="col-span-6 2xl:col-span-3">
                  <InputTextTw
                    label={t('label.nachname')}
                    placeholder={t('placeholder.nachname')}
                    control={control}
                    disabled={isReadOnly}
                    required
                    {...register('nachname')}
                  />
                </div>
                <div className="col-span-6 2xl:col-span-3">
                  <InputTextTw
                    type="number"
                    label={t('label.svnr')}
                    placeholder={t('placeholder.svnr')}
                    maxLength={10}
                    control={control}
                    disabled={isReadOnly}
                    required
                    {...register('svNummer')}
                  />
                </div>
                <div className="col-span-6 2xl:col-span-3">
                  <InputSelectTw
                    label={t('label.geschlecht')}
                    options={convertToKeyLabelOptions(
                      masterdata?.geschlechtList
                    )}
                    placeholder={t('placeholder.geschlecht')}
                    disabled={isReadOnly}
                    control={control}
                    required
                    {...register('geschlecht')}
                  />
                </div>
                <div className="col-span-6 2xl:col-span-3">
                  <DatepickerTw
                    label={t('label.geburtsdatum')}
                    placeholder={t('placeholder.geburtsdatum')}
                    disabled={isReadOnly}
                    control={control}
                    required
                    {...register('geburtsdatum')}
                  />
                </div>
                <div className="col-span-6 2xl:col-span-3">
                  <ComboSelectTw
                    label={t('label.staatsbuergerschaft')}
                    options={convertToKeyLabelOptions(
                      masterdata?.staatsbuergerschaftList
                    )}
                    placeholder={t('placeholder.staatsbuergerschaft')}
                    disabled={isReadOnly}
                    control={control}
                    required
                    {...register('nation')}
                  />
                </div>
                <div className="col-span-6 2xl:col-span-3">
                  <ComboSelectTw
                    label={t('label.ursprungsland')}
                    options={convertToKeyLabelOptions(
                      masterdata?.staatsbuergerschaftList
                    )}
                    placeholder={t('placeholder.ursprungsland')}
                    disabled={isReadOnly}
                    control={control}
                    {...register('ursprungsland')}
                  />
                </div>
                <div className="col-span-6 2xl:col-span-3">
                  <InputTextTw
                    label={t('label.geburtsort')}
                    placeholder={t('placeholder.geburtsort')}
                    disabled={isReadOnly}
                    control={control}
                    {...register('geburtsort')}
                  />
                </div>
                <div className="col-span-6 2xl:col-span-3">
                  <ComboSelectTw
                    label={t('label.muttersprache')}
                    options={convertToKeyLabelOptions(
                      masterdata?.mutterspracheList
                    )}
                    placeholder={t('placeholder.muttersprache')}
                    control={control}
                    disabled={isReadOnly}
                    name="muttersprache"
                  />
                </div>
              </div>
            </div>
            <div className="border-b border-gray-900/10 pb-12">
              <h3 className="mb-5 text-xl leading-7 font-semibold text-gray-900">
                {t('section.kontaktdaten')}
              </h3>
              <div className="grid grid-cols-12 gap-x-8 gap-y-4">
                <div className="col-span-6 xl:col-span-4">
                  <InputTextTw
                    label={t('label.strasse')}
                    placeholder={t('placeholder.strasse')}
                    disabled={isReadOnly}
                    control={control}
                    required
                    {...register('strasse')}
                  />
                </div>
                <div className="col-span-6 xl:col-span-4">
                  <InputTextTw
                    type="number"
                    label={t('label.plz')}
                    placeholder={t('placeholder.plz')}
                    disabled={isReadOnly}
                    control={control}
                    required
                    {...register('plz')}
                  />
                </div>
                <div className="col-span-6 xl:col-span-4">
                  <InputTextTw
                    label={t('label.ort')}
                    placeholder={t('placeholder.ort')}
                    disabled={isReadOnly}
                    control={control}
                    required
                    {...register('ort')}
                  />
                </div>
                <div className="col-span-6 xl:col-span-4">
                  <InputTextTw
                    label={t('label.land')}
                    control={control}
                    value="Österreich"
                    disabled
                    {...register('land')}
                  />
                </div>
                <div className="col-span-6 xl:col-span-4">
                  <InputTextTw
                    label={t('label.telefonPrivat')}
                    placeholder={t('placeholder.telefonPrivat')}
                    disabled={isReadOnly}
                    control={control}
                    required
                    {...register('telefon')}
                  />
                </div>
                <div className="col-span-6 xl:col-span-4">
                  <InputTextTw
                    label={t('label.email')}
                    placeholder={t('placeholder.email')}
                    disabled={isReadOnly}
                    control={control}
                    {...register('email')}
                  />
                </div>
              </div>
            </div>
            {SHOW_COMPLEX_FIELDS && (
              <div className="border-b border-gray-900/10 pb-12">
                <h3 className="mb-5 text-xl leading-7 font-semibold text-gray-900">
                  {t('section.vermittlungsdaten')}
                </h3>
                <div className="grid grid-cols-12 gap-x-8 gap-y-4">
                  <div className="col-span-6">
                    <InputTextTw
                      label={t('label.ziel')}
                      placeholder={t('placeholder.ziel')}
                      disabled={isReadOnly}
                      control={control}
                      {...register('ziel')}
                    />
                  </div>
                  <div className="col-span-6">
                    <DatepickerTw
                      label={t('label.vermittelbarAb')}
                      placeholder={t('placeholder.vermittelbarAb')}
                      disabled={isReadOnly}
                      control={control}
                      {...register('vermittelbarAb')}
                    />
                  </div>
                  <div className="col-span-12 xl:col-span-6">
                    <TextareaTw
                      label={t('label.vermittlungsnotiz')}
                      placeholder={t('placeholder.vermittlungsnotiz')}
                      disabled={isReadOnly}
                      control={control}
                      {...register('vermittlungsnotiz')}
                    />
                  </div>
                  <div className="col-span-12 xl:col-span-6">
                    <BerufSelectTw
                      label={t('label.wunschberufe')}
                      disabled={isReadOnly}
                      control={control}
                      {...register('wunschberufe')}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          {SHOW_COMPLEX_FIELDS &&
            participant.stammdaten &&
            participant.stammdaten.id && (
              <div className="mb-12 grid grid-cols-12">
                <div className="col-span-12 space-y-8">
                  <TeilnehmerStammdatenSection
                    control={control}
                    register={register}
                    participant={participant}
                    isReadOnly={isReadOnly}
                  />
                  <HorizontalRow />
                </div>
              </div>
            )}
          {SHOW_COMPLEX_FIELDS &&
            participant.vertragsdaten &&
            participant.vertragsdaten.id && (
              <div className="mb-12 grid grid-cols-12">
                <div className="col-span-12 space-y-8">
                  <TeilnehmerVertragsdatenSection
                    control={control}
                    register={register}
                  />
                  <HorizontalRow />
                </div>
              </div>
            )}
        </form>
        <div className="grid grid-cols-12 gap-x-8 gap-y-8">
          <div className="col-span-12">
            <SeminarTable
              seminars={seminarData}
              setSeminarData={setSeminarData}
            />
          </div>
          {SHOW_COMPLEX_FIELDS && (
            <>
              <div className="col-span-12">
                <NotizenTable participant={participant} />
              </div>
              <div className="col-span-12 xl:col-span-6">
                <AusbildungTable participant={participant} />
              </div>
              <div className="col-span-12 xl:col-span-6">
                <BerufserfahrungTable
                  participant={participant}
                  setParticipant={setParticipant}
                />
              </div>
              <div className="col-span-12 xl:col-span-6">
                <ZertifikateTable participant={participant} />
              </div>
              <div className="col-span-12 xl:col-span-6">
                <SprachkenntnisseTable
                  participant={participant}
                  setParticipant={setParticipant}
                />
              </div>
              <HorizontalRow className="col-span-12 hidden border-gray-900/10 xl:block" />
            </>
          )}

          <div className="col-span-12">
            {teilnehmerId &&
              participant &&
              setParticipant &&
              hasSomeRole(ROLE.TN_UPLOAD_PROFIL) && (
                <KompetenzprofilUploadForm
                  isReadOnly={isReadOnly}
                  teilnehmerId={teilnehmerId}
                  participant={participant}
                  setParticipant={setParticipant}
                />
              )}
          </div>
        </div>
        <HorizontalRow className="col-span-12" />

        <div className="mt-6 flex flex-row-reverse items-center justify-between gap-x-6">
          <ButtonTw
            type="submit"
            disabled={isLoading || isReadOnly}
            size="xlarge"
            isLoading={isLoading}
            onClick={submitForm}
            testId="tn-save"
          >
            {t('button.speichern')}
          </ButtonTw>
          {participant && participant.personalnummer && (
            <ButtonTw
              href={`/teilnehmer/austritte/anlegen${toQueryString({ teilnehmerId: participant.id, vorname: participant.vorname, nachname: participant.nachname, svNummer: participant.svNummer })}`}
              disabled={isLoading || isReadOnly}
              size="xlarge"
              isLoading={isLoading}
              className="gap-3"
              secondary
              testId="tn-abmelden"
            >
              <UserMinusIcon className="size-5" />
              {t('button.abmelden')}
            </ButtonTw>
          )}
        </div>
      </div>
      <ConfirmModal
        condition={isDirty}
        title={t('verlassen.modal.title')}
        text={t('verlassen.modal.text')}
        confirmLabel={t('verlassen.modal.confirm')}
        cancelLabel={t('verlassen.modal.cancel')}
      />
    </>
  )
}

export default TeilnehmerEditForm
