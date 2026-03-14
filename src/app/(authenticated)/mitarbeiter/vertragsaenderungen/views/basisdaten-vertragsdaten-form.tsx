'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useRef } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import { VertragsaenderungEntry } from '../vertragsaenderungen-utils'
import ButtonTw, { ButtonSize } from '@/components/atoms/button-tw'
import DatepickerTw from '@/components/atoms/datepicker-tw'
import HorizontalRow from '@/components/atoms/hr-tw'
import LoaderTw, { LoaderSize } from '@/components/atoms/loader-tw'
import TextareaTw from '@/components/atoms/textarea-tw'
import MitarbeiterVertragsdatenEditForm, {
  FormValues,
} from '@/components/forms/mitarbeiter-vertragsdaten-edit-form'
import { VertragsdatenEntry } from '@/lib/interfaces/mitarbeiter'
import { WorkflowItem } from '@/lib/interfaces/workflow'
import { setErrorsFromErrorsMap } from '@/lib/utils/form-utils'

export default function BasisDatenVertragsdatenForm({
  personalnummer,
  vertragsDaten,
  vertragsAenderung,
  isLoading,
  onSubmitHandler,
}: {
  setWorkflowItems?: React.Dispatch<React.SetStateAction<WorkflowItem[]>>
  personalnummer?: string
  vertragsDaten?: VertragsdatenEntry | null
  vertragsAenderung?: VertragsaenderungEntry | null
  isLoading?: boolean
  onSubmitHandler?: (payload: {
    vertragsdatenDto: Partial<VertragsdatenEntry>
    vertragsaenderungDto: Partial<VertragsaenderungEntry>
  }) => void
}) {
  const t = useTranslations('mitarbeiterVertragsaenderungen.detail')

  // Create a ref to access the child form's submit function
  const childFormRef = useRef<{
    submitForm: () => Promise<void>
    getFormValues: () => FormValues
  }>(null)

  const { register, getValues, reset, setError, control } = useForm<
    Partial<VertragsaenderungEntry>
  >({
    defaultValues: {
      gueltigAb: '',
      interneAnmerkung: '',
      offizielleBemerkung: '',
      personalnummer: personalnummer || '',
    },
  })
  const basisDatenPersonalnummer = useWatch({ control, name: 'personalnummer' })
  const combinedPersonalnummer = personalnummer || basisDatenPersonalnummer

  useEffect(() => {
    if (vertragsAenderung) {
      reset(vertragsAenderung)

      // Set new errors from backend
      if (vertragsAenderung.errorsMap) {
        setErrorsFromErrorsMap(vertragsAenderung.errorsMap, setError)
      }
    }
  }, [reset, setError, vertragsAenderung])

  if (isLoading || !vertragsDaten || !combinedPersonalnummer) {
    return (
      <div className="z-50 flex h-[450px] w-full items-center justify-center">
        <LoaderTw size={LoaderSize.XLarge} />
      </div>
    )
  }

  // Combined submission handler that triggers both forms
  const onFormSave = async () => {
    const vertragsaenderungDto = {
      // add default values
      emailRecipients: [],
      ...getValues(),
    }
    const vertragsdatenDto = childFormRef.current?.getFormValues()

    if (onSubmitHandler && vertragsaenderungDto && vertragsdatenDto) {
      onSubmitHandler({
        vertragsaenderungDto,
        vertragsdatenDto,
      })
    }
  }

  return (
    <div className="flex flex-col gap-x-8 gap-y-8">
      <h3 className="text-2xl font-semibold tracking-tight text-gray-900">
        {t('labels.basisAngaben')}
      </h3>
      <div>
        <form>
          <input type="hidden" {...register('personalnummer')} />
          <div className="mb-4 grid grid-cols-12 gap-x-8 gap-y-8">
            <div className="col-span-12">
              <DatepickerTw
                label={t('labels.gueltigAb')}
                placeholder={t('placeholder.gueltigAb')}
                control={control}
                testId="gueltigAb"
                {...register('gueltigAb')}
              />
            </div>
            <div className="col-span-6">
              <TextareaTw
                className="w-full"
                label={t('labels.interneAnmerkung')}
                placeholder={t('placeholder.interneAnmerkung')}
                rows={5}
                control={control}
                testId="interneAnmerkung"
                {...register('interneAnmerkung')}
              />
            </div>
            <div className="col-span-6">
              <TextareaTw
                className="w-full"
                label={t('labels.offizielleBemerkung')}
                placeholder={t('placeholder.offizielleBemerkung')}
                rows={5}
                control={control}
                {...register('offizielleBemerkung')}
              />
            </div>
          </div>
        </form>
      </div>
      <HorizontalRow />
      <div className="relative min-h-[760px]">
        <MitarbeiterVertragsdatenEditForm
          personalnummer={combinedPersonalnummer}
          vertragsDaten={vertragsDaten}
          ref={childFormRef}
          hideSubmitButtons
        />
      </div>
      <HorizontalRow />
      <div className="flex gap-4">
        <ButtonTw
          type="button"
          className="h-full w-full"
          isLoading={isLoading}
          size={ButtonSize.Large}
          secondary
          testId="cancel"
        >
          {t('labels.abbrechen')}
        </ButtonTw>
        <ButtonTw
          type="button"
          className="h-full w-full"
          isLoading={isLoading}
          size={ButtonSize.Large}
          onClick={onFormSave}
          secondary
          testId="save"
        >
          {t('labels.speichern')}
        </ButtonTw>
        <ButtonTw
          type="button"
          className="h-full w-full"
          isLoading={isLoading}
          size={ButtonSize.Large}
          // TODO: use different endpoint and action once available
          onClick={onFormSave}
          testId="create-document"
        >
          {t('labels.dokumentErstellen')}
        </ButtonTw>
      </div>
    </div>
  )
}
