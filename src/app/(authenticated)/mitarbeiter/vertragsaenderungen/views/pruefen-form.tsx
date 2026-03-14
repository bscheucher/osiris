'use client'

import { DocumentChartBarIcon } from '@heroicons/react/20/solid'
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { VertragsaenderungEntry } from '../vertragsaenderungen-utils'
import ButtonTw, { ButtonSize } from '@/components/atoms/button-tw'
import DatepickerTw from '@/components/atoms/datepicker-tw'
import HorizontalRow from '@/components/atoms/hr-tw'
import LoaderTw, { LoaderSize } from '@/components/atoms/loader-tw'
import LoaderWithOverlay from '@/components/atoms/loader-with-overlay'
import TextareaTw from '@/components/atoms/textarea-tw'
import {
  FieldChange,
  FieldChangeItem,
  getTranslatedTitleWithFallback,
} from '@/components/molecules/field-changes'
import PDFViewer from '@/components/organisms/pdf-viewer'
import useAsyncEffect from '@/hooks/use-async-effect'
import { Workflow, WorkflowItem } from '@/lib/interfaces/workflow'
import { parseEmailAddresses } from '@/lib/utils/form-utils'
import { executeGET, executePOST } from '@/lib/utils/gateway-utils'
import {
  getSortedWorkflowItems,
  getWorkflowItemsFromWorkflow,
} from '@/lib/utils/mitarbeiter/workflow-utils'
import { showError, showErrorMessage } from '@/lib/utils/toast-utils'

export enum PruefenAction {
  accept = 'ACCEPT',
  decline = 'DECLINE',
  save = 'SAVE',
}

export enum PruefenUserType {
  creatorPruefung = 'CREATOR_PRUEFUNG',
  people = 'PEOPLE',
  lhr = 'LHR',
  genehmigender = 'GENEHMIGENDER',
}

type FormValues = {
  teilnehmerId: number
  austrittsDatum: string
  interneAnmerkung: string
  offizielleBemerkung: string
  emailRecipients: string
  gueltigAb: string
}

interface Props {
  setWorkflowItems: React.Dispatch<React.SetStateAction<WorkflowItem[]>>
  vertragsdatenAenderungId: string
  isReadOnly?: boolean
  userType: PruefenUserType
  saveCallback?: (action: PruefenAction) => void
}

export default function PruefenForm({
  setWorkflowItems,
  vertragsdatenAenderungId,
  userType,
  isReadOnly,
  saveCallback,
}: Props) {
  const t = useTranslations('mitarbeiterVertragsaenderungen.detail')
  const tMitarbeiter = useTranslations('mitarbeiter')

  const [isLoading, setIsLoading] = useState(true)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [isPdfLoading, setIsPdfLoading] = useState(true)
  const [vertragsDaten, setVertragsdaten] =
    useState<VertragsaenderungEntry | null>(null)
  const [vertragsaenderung, setVertragsaenderung] =
    useState<VertragsaenderungEntry | null>(null)
  const [fieldChanges, setFieldChanges] = useState<FieldChange[]>([])

  const { register, reset, control, getValues } = useForm<FormValues>()

  useAsyncEffect(async () => {
    try {
      const response = await executeGET<{
        vertragsaenderung: VertragsaenderungEntry[]
        vertragsdaten: VertragsaenderungEntry[]
        workflowgroup: Workflow[]
      }>(
        `/ma-verwalten/vertragsaenderung?vertragsaenderungId=${vertragsdatenAenderungId}`
      )

      if (response.data) {
        const {
          vertragsaenderung: [vertragsaenderung],
          vertragsdaten: [latestVertragsdaten],
          workflowgroup: latestWorkflowGroup,
        } = response.data

        if (latestVertragsdaten) {
          setVertragsdaten(latestVertragsdaten)
        }

        if (vertragsaenderung) {
          reset(vertragsaenderung)

          setVertragsaenderung(vertragsaenderung)

          if (vertragsaenderung.fieldChanges?.length) {
            setFieldChanges(vertragsaenderung.fieldChanges)
          }
        }

        if (setWorkflowItems && latestWorkflowGroup) {
          const workflowItems = getSortedWorkflowItems(
            getWorkflowItemsFromWorkflow(latestWorkflowGroup)
          )
          setWorkflowItems(workflowItems)
        }

        // Fetch PDF data
        const pdfResponse = await fetch('/api/report/pdf/ezb-2023.pdf')
        if (!pdfResponse.ok) throw new Error('Failed to load PDF')

        // Create a blob URL from the PDF data
        const blob = await pdfResponse.blob()
        const url = URL.createObjectURL(blob)
        setPdfUrl(url)
      }
    } catch (e) {
      showError(t('error.laden'))
    } finally {
      setIsPdfLoading(false)
      setIsLoading(false)
    }
  }, [])

  // Combined submission handler that triggers both forms
  const onFormSave = async (action: PruefenAction) => {
    try {
      setIsLoading(true)

      if (!vertragsDaten || !vertragsaenderung) {
        throw new Error('Vertragsdaten konnten nicht geladen werden')
      }

      let postBody = {}

      if (!isReadOnly) {
        const {
          emailRecipients,
          offizielleBemerkung,
          interneAnmerkung,
          gueltigAb,
        } = getValues()
        const combinedVertragsaenderungen = {
          ...vertragsaenderung,
          emailRecipients: parseEmailAddresses(emailRecipients),
          gueltigAb,
          offizielleBemerkung,
          interneAnmerkung,
        }

        postBody = {
          vertragsaenderungDto: combinedVertragsaenderungen,
          vertragsdatenDto: vertragsDaten,
        }
      }

      const response = await executePOST<{
        workflowgroup: Workflow[]
      }>(
        `/ma-verwalten/prufung/${vertragsaenderung.id}?action=${action}&userType=${userType}`,
        postBody
      )

      if (response.data) {
        const { workflowgroup: latestWorkflowGroup } = response.data

        if (setWorkflowItems && latestWorkflowGroup) {
          const workflowItems = getSortedWorkflowItems(
            getWorkflowItemsFromWorkflow(latestWorkflowGroup)
          )
          setWorkflowItems(workflowItems)
        }
      }

      if (saveCallback) {
        saveCallback(action)
      }
    } catch (error) {
      showErrorMessage(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <form className="3xl:col-span-1 relative col-span-2 space-y-8">
        {isLoading && <LoaderWithOverlay />}

        <h3 className="block text-xl">{t('labels.basisDaten')}</h3>
        <div className="grid grid-cols-2 gap-x-8 gap-y-8">
          <div className="col-span-2">
            <DatepickerTw
              label={t('labels.gueltigAb')}
              placeholder={t('placeholder.gueltigAb')}
              control={control}
              name={'gueltigAb'}
              disabled={isReadOnly}
            />
          </div>
          <div className="col-span-2 lg:col-span-1">
            <TextareaTw
              label={t('labels.interneAnmerkung')}
              placeholder={t('placeholder.interneAnmerkung')}
              rows={5}
              control={control}
              disabled={isReadOnly}
              {...register('interneAnmerkung')}
            />
          </div>
          <div className="col-span-2 lg:col-span-1">
            <TextareaTw
              label={t('labels.offizielleBemerkung')}
              placeholder={t('placeholder.offizielleBemerkung')}
              rows={5}
              control={control}
              disabled={isReadOnly}
              {...register('offizielleBemerkung')}
            />
          </div>
        </div>
        {!!fieldChanges?.length && (
          <>
            <HorizontalRow className="mb-6" />
            <div className="overflow-auto">
              <h3 className="mb-4 block text-xl">
                {t('labels.aenderungsauszug')}
              </h3>
              <ul className="my-2 list-disc pl-6">
                {fieldChanges?.map((change) => (
                  <FieldChangeItem
                    key={change.fieldName}
                    change={change}
                    title={getTranslatedTitleWithFallback(
                      tMitarbeiter,
                      `erfassen.vertragsdaten.label`,
                      change.fieldName
                    )}
                  />
                ))}
              </ul>
            </div>
          </>
        )}
        {userType !== PruefenUserType.creatorPruefung && (
          <>
            <HorizontalRow />
            <div className="mb-4 grid grid-cols-12 gap-x-8 gap-y-8">
              <div className="col-span-12">
                <TextareaTw
                  label={t('labels.empfaengerkreis')}
                  placeholder={t('placeholder.empfaengerkreis')}
                  rows={5}
                  control={control}
                  disabled={isReadOnly}
                  {...register('emailRecipients')}
                />
              </div>
            </div>
          </>
        )}
      </form>
      <div className="3xl:col-span-1 col-span-2 space-y-8">
        <h3 className="block text-xl">{t('labels.vorschau')}</h3>
        <div className="relative h-[calc(100%-3.75rem)] min-h-[800px] overflow-hidden rounded-lg border border-gray-100">
          {pdfUrl ? (
            <PDFViewer
              url={pdfUrl}
              height="100%"
              zoom="page-fit"
              className="relative"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-50">
              <div className="p-4">
                {isPdfLoading ? (
                  <LoaderTw size={LoaderSize.XLarge} testId="preview-loader" />
                ) : (
                  <DocumentChartBarIcon className="h-12 w-12 text-gray-300" />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="col-span-2">
        <HorizontalRow className="mb-8 block" />
        <div className="flex gap-4">
          {!isReadOnly && (
            <ButtonTw
              onClick={() => onFormSave(PruefenAction.save)}
              type="button"
              className="flex h-full w-full justify-center"
              isLoading={isLoading}
              size={ButtonSize.Large}
              testId="pruefen-save"
              secondary
            >
              {t('labels.speichern')}
            </ButtonTw>
          )}
          <ButtonTw
            onClick={() => onFormSave(PruefenAction.decline)}
            type="button"
            className="flex h-full w-full justify-center gap-2 bg-red-600 ring-red-600 hover:bg-red-500 focus-visible:outline-red-600"
            isLoading={isLoading}
            size={ButtonSize.Large}
            testId="pruefen-decline"
          >
            <XMarkIcon className="size-5" />

            {t('labels.ablehnen')}
          </ButtonTw>
          <ButtonTw
            onClick={() => onFormSave(PruefenAction.accept)}
            type="button"
            className="flex h-full w-full justify-center gap-2 bg-green-600 ring-green-600 hover:bg-green-500 focus-visible:outline-green-600"
            isLoading={isLoading}
            size={ButtonSize.Large}
            testId="pruefen-accept"
          >
            <CheckIcon className="size-5" />
            {t('labels.genehmigen')}
          </ButtonTw>
        </div>
      </div>
    </>
  )
}
