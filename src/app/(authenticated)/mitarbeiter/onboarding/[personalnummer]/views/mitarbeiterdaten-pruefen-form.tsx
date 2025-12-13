'use client'

import { ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import { yupResolver } from '@hookform/resolvers/yup'
import { useTranslations } from 'next-intl'
import React, { SyntheticEvent, useEffect, useMemo, useState } from 'react'
import { Resolver, SubmitHandler, useForm } from 'react-hook-form'
import * as yup from 'yup'

import ButtonTw from '@/components/atoms/button-tw'
import HorizontalRow from '@/components/atoms/hr-tw'
import InputTextTw from '@/components/atoms/input-text-tw'
import InputToggleTw from '@/components/atoms/input-toggle-tw'
import { useFormEffect, useFormEffectOverrides } from '@/hooks/use-form-effect'
import { WORKFLOW_NAME } from '@/lib/constants/mitarbeiter-constants'
import { ROLE } from '@/lib/constants/role-constants'
import { isWorkflowCompleted } from '@/lib/utils/mitarbeiter/workflow-utils'
import useOnboardingStore from '@/stores/onboarding-store'
import useUserStore from '@/stores/user-store'

export interface MitarbeiterdatenPruefenFormValues {
  personalnummer: string
  bankcard: boolean
  bankcardReason: string
  ecard: boolean
  ecardReason: string
  arbeitsgenehmigungDok: boolean
  arbeitsgenehmigungDokReason: string
  gehaltEinstufung: boolean
  gehaltEinstufungReason: string
  hasArbeitsgenehmigung: boolean
  needsArbeitsgenehmigung: boolean
}

interface Props {
  submitHandler: (
    mitarbeiterPruefenData: MitarbeiterdatenPruefenFormValues
  ) => void
  mitarbeiterPruefenData: MitarbeiterdatenPruefenFormValues
  handleDownload: (event: SyntheticEvent, name: string) => void
  isReadOnly?: boolean
}

export const createSchema = (t: (key: string) => string) =>
  yup.object({
    personalnummer: yup.string().nullable(),
    bankcard: yup.boolean(),
    bankcardReason: yup.string().when('bankcard', {
      is: false,
      then: () => yup.string().required(t('required.bankcardReason')),
      otherwise: () => yup.string().nullable(),
    }),
    ecard: yup.boolean(),
    ecardReason: yup.string().when('ecard', {
      is: false,
      then: () => yup.string().required(t('required.ecardReason')),
      otherwise: () => yup.string().nullable(),
    }),
    arbeitsgenehmigungDok: yup.boolean(),
    arbeitsgenehmigungDokReason: yup
      .string()
      .when(['arbeitsgenehmigungDok', 'needsArbeitsgenehmigung'], {
        is: (
          arbeitsgenehmigungDok: boolean,
          needsArbeitsgenehmigung: boolean
        ) => !arbeitsgenehmigungDok && needsArbeitsgenehmigung,
        then: () =>
          yup.string().required(t('required.arbeitsgenehmigungDokReason')),
        otherwise: () => yup.string().nullable(),
      }),
    gehaltEinstufung: yup.boolean(),
    gehaltEinstufungReason: yup.string().when('gehaltEinstufung', {
      is: false,
      then: () => yup.string().required(t('required.gehaltEinstufungReason')),
      otherwise: () => yup.string().nullable(),
    }),
    hasArbeitsgenehmigung: yup.boolean().nullable(),
    needsArbeitsgenehmigung: yup.boolean().nullable(),
  })

export default function MitarbeiterdatenPruefenForm({
  submitHandler,
  mitarbeiterPruefenData,
  handleDownload,
  isReadOnly,
}: Props) {
  const t = useTranslations('mitarbeiter.erfassen.lvAcceptance')
  const schema = useMemo(() => createSchema(t), [t])
  const [isSaveDisabled, setIsSaveDisabled] = useState(false)
  const { hasSomeRole } = useUserStore()
  const canEdit = hasSomeRole(ROLE.MA_UEBERPRUEFEN)
  const { workflowItems, workflows } = useOnboardingStore()
  const { handleSubmit, reset, setValue, clearErrors, watch, control } =
    useForm<MitarbeiterdatenPruefenFormValues>({
      resolver: yupResolver(
        schema
      ) as Resolver<MitarbeiterdatenPruefenFormValues>,
      defaultValues: mitarbeiterPruefenData,
    })
  const { needsArbeitsgenehmigung, arbeitsgenehmigungDok } =
    mitarbeiterPruefenData

  const [getOverride, setOverride] = useFormEffectOverrides()

  useFormEffect<MitarbeiterdatenPruefenFormValues>(
    {
      bankcard: (value) => {
        setOverride('bankcardReason', {
          required: !value,
          disabled: value,
        })
        if (value) {
          setValue('bankcardReason', '')
          clearErrors('bankcardReason')
        }
      },
      ecard: (value) => {
        setOverride('ecardReason', {
          required: !value,
          disabled: value,
        })
        if (value) {
          setValue('ecardReason', '')
          clearErrors('ecardReason')
        }
      },
      arbeitsgenehmigungDok: (value) => {
        setOverride('arbeitsgenehmigungDokReason', {
          required: !value,
          disabled: value,
        })
        if (value) {
          setValue('arbeitsgenehmigungDokReason', '')
          clearErrors('arbeitsgenehmigungDokReason')
        }
      },
      gehaltEinstufung: (value) => {
        setOverride('gehaltEinstufungReason', {
          required: !value,
          disabled: value,
        })
        if (value) {
          setValue('gehaltEinstufungReason', '')
          clearErrors('gehaltEinstufungReason')
        }
      },
    },
    watch,
    setValue
  )

  useEffect(() => {
    setIsSaveDisabled(
      !isWorkflowCompleted(workflows ?? [], WORKFLOW_NAME.COLLECT_DATA_FOR_MA)
    )
  }, [workflowItems, workflows])

  const formHandler: SubmitHandler<MitarbeiterdatenPruefenFormValues> = async (
    props
  ) => {
    submitHandler(props)
    reset(props)
  }

  return (
    <form onSubmit={handleSubmit(formHandler)}>
      <div className="space-y-8">
        <div className="grid grid-cols-12 gap-x-8 gap-y-4">
          <div className="col-span-12">
            <h3 className="text-xl leading-7 font-semibold text-gray-900">
              {t('section.debitkarte')}
            </h3>
          </div>
          <div className="col-span-12 xl:col-span-6">
            <ButtonTw
              size="large"
              className="bg-ibis-emerald flex h-full items-center gap-1 ring-emerald-600 hover:bg-emerald-500"
              onClick={(event) => handleDownload(event, 'bankcard')}
              testId="bankcard-download-button"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              {t('download.debitkarte')}
            </ButtonTw>
          </div>
          <div className="col-span-12 xl:col-span-6">
            <InputToggleTw
              label={t('label.akzeptiert')}
              control={control}
              leftLabel={t('checkbox.prefix')}
              rightLabel={t('checkbox.suffix')}
              disabled={isReadOnly}
              name="bankcard"
            />
          </div>
          <div className="col-span-12">
            <InputTextTw
              label={t('label.bemerkung')}
              control={control}
              disabled={isReadOnly}
              name="bankcardReason"
              {...getOverride('bankcardReason')}
            />
          </div>
        </div>
        <HorizontalRow />

        <div className="grid grid-cols-12 gap-x-8 gap-y-4">
          <div className="col-span-12">
            <h3 className="text-xl leading-7 font-semibold text-gray-900">
              {t('section.ecard')}
            </h3>
          </div>
          <div className="col-span-12 xl:col-span-6">
            <ButtonTw
              size="large"
              className="bg-ibis-emerald flex h-full items-center gap-1 ring-emerald-600 hover:bg-emerald-500"
              onClick={(event) => handleDownload(event, 'ecard')}
              testId="ecard-download-button"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              {t('download.ecard')}
            </ButtonTw>
          </div>
          <div className="col-span-12 xl:col-span-6">
            <InputToggleTw
              label={t('label.akzeptiert')}
              control={control}
              leftLabel={t('checkbox.prefix')}
              rightLabel={t('checkbox.suffix')}
              disabled={isReadOnly}
              name="ecard"
            />
          </div>
          <div className="col-span-12">
            <InputTextTw
              label={t('label.bemerkung')}
              control={control}
              name="ecardReason"
              disabled={isReadOnly}
              {...getOverride('ecardReason')}
            />
          </div>
        </div>
        <HorizontalRow />
        <div className="grid grid-cols-12 gap-x-8 gap-y-4">
          <div className="col-span-12">
            <h3 className="text-xl leading-7 font-semibold text-gray-900">
              {t('section.arbeitsgenehmigung')}
            </h3>
          </div>
          {needsArbeitsgenehmigung ? (
            <>
              <div className="col-span-12 xl:col-span-6">
                <ButtonTw
                  size="large"
                  className="bg-ibis-emerald flex h-full items-center gap-1 ring-emerald-600 hover:bg-emerald-500"
                  onClick={(event) =>
                    handleDownload(event, 'arbeitsgenehmigungDok')
                  }
                  testId="arbeitsgenehmigungDok-download-button"
                >
                  <ArrowDownTrayIcon className="h-4 w-4" />
                  {t('download.arbeitsgenehmigungDok')}
                </ButtonTw>
              </div>
              <div className="col-span-12 xl:col-span-6">
                <InputToggleTw
                  label={t('label.akzeptiert')}
                  control={control}
                  leftLabel={t('checkbox.prefix')}
                  rightLabel={t('checkbox.suffix')}
                  disabled={isReadOnly}
                  name="arbeitsgenehmigungDok"
                />
              </div>
              <div className="col-span-12">
                <InputTextTw
                  label={t('label.bemerkung')}
                  control={control}
                  disabled={arbeitsgenehmigungDok || isReadOnly}
                  name="arbeitsgenehmigungDokReason"
                  {...getOverride('arbeitsgenehmigungDokReason')}
                />
              </div>
            </>
          ) : (
            <div className="col-span-12">
              <p data-testid="arbeitsgenehmigungDok-not-required">
                {t('notRequired')}
              </p>
            </div>
          )}
        </div>
        <HorizontalRow />
        <div className="grid grid-cols-12 gap-x-8 gap-y-4">
          <div className="col-span-12">
            <h3 className="text-xl leading-7 font-semibold text-gray-900">
              {t('section.gehaltEinstufung')}
            </h3>
          </div>
          <div className="col-span-12 xl:col-span-6">
            <InputToggleTw
              label={t('label.akzeptiert')}
              control={control}
              leftLabel={t('checkbox.prefix')}
              rightLabel={t('checkbox.suffix')}
              disabled={isReadOnly}
              name="gehaltEinstufung"
            />
          </div>
          <div className="col-span-12">
            <InputTextTw
              label={t('label.bemerkung')}
              control={control}
              name="gehaltEinstufungReason"
              disabled={isReadOnly}
              {...getOverride('gehaltEinstufungReason')}
            />
          </div>
        </div>
        <HorizontalRow />
        <div className="flex items-center justify-end gap-x-6">
          <ButtonTw
            type="submit"
            size="xlarge"
            testId={'ma-pruefen-submit-button'}
            disabled={!canEdit || isSaveDisabled || isReadOnly}
          >
            {t('button.speichern')}
          </ButtonTw>
        </div>
      </div>
    </form>
  )
}
