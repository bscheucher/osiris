'use client'

import { DocumentChartBarIcon } from '@heroicons/react/20/solid'
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import { MOXIS_DELAY_TIMEOUT, VereinbarungEntry } from '../vereinbarungen-utils'
import ButtonTw, { ButtonSize } from '@/components/atoms/button-tw'
import DatepickerTw from '@/components/atoms/datepicker-tw'
import HorizontalRow from '@/components/atoms/hr-tw'
import InputTextTw from '@/components/atoms/input-text-tw'
import LoaderTw, { LoaderSize } from '@/components/atoms/loader-tw'
import MitarbeiterSearchTw from '@/components/molecules/mitarbeiter-search-tw'
import { DefaultModal } from '@/components/organisms/default-modal'
import DynamicFormFields, {
  mapValuesToFormFields,
  ReportFormField,
} from '@/components/organisms/dynamic-form-fields'
import PDFViewer from '@/components/organisms/pdf-viewer'
import useAsyncEffect from '@/hooks/use-async-effect'
import { MitarbeiterResult } from '@/lib/interfaces/mitarbeiter'
import { Workflow } from '@/lib/interfaces/workflow'
import { waitFor } from '@/lib/utils/api-utils'
import {
  executeGET,
  executePOST,
  fetchGatewayRaw,
} from '@/lib/utils/gateway-utils'
import {
  downloadFileFromUrl,
  getFileNameFromResponse,
} from '@/lib/utils/object-utils'
import { showError, showErrorMessage, showInfo } from '@/lib/utils/toast-utils'

export default function VereinbarungBearbeitenForm({
  vereinbarungId,
  updateWorkflowGroup,
  isSigned,
}: {
  vereinbarungId: string
  updateWorkflowGroup: (workflowgroup?: Workflow[]) => void
  isSigned: boolean
}) {
  const t = useTranslations('mitarbeiterVereinbarungen.detail')

  // State management
  const [vereinbarung, setVereinbarung] = useState<VereinbarungEntry | null>(
    null
  )
  const [isLoading, setIsLoading] = useState(true)
  const [isPdfLoading, setIsPdfLoading] = useState(false)
  const [showOverrideModal, setShowOverrideModal] = useState(false)
  const [selectedReportName, setSelectedReportName] = useState('')
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [vereinbarungFormDefinition, setVereinbarungFormDefinition] = useState<
    ReportFormField[]
  >([])

  // Form setup
  const { register, control, getValues, reset } = useForm<any>()
  const formValues = useWatch({ control })

  const selectedMitarbeiterValue = formValues?.selectedMitarbeiter
  const selectedVereinbarungValue = formValues?.selectedVereinbarung
  const gueltigAb = formValues?.gueltigAb
  const gueltigBis = formValues?.gueltigBis

  /**
   * Load initial data
   */
  useAsyncEffect(async () => {
    try {
      const { data } = await executeGET<{
        vereinbarungen: VereinbarungEntry[]
        workflowgroup: Workflow[]
      }>(`/vereinbarung/fetch/${vereinbarungId}`)

      // Handle workflow items
      updateWorkflowGroup(data?.workflowgroup)

      // Handle vereinbarung data
      if (data?.vereinbarungen?.length) {
        const currentVereinbarung = data.vereinbarungen[0]
        setVereinbarung(currentVereinbarung)

        // Reset form with current data
        reset({
          selectedVereinbarung: currentVereinbarung.vereinbarungName,
          selectedMitarbeiter: currentVereinbarung.personalnummer,
          ...currentVereinbarung,
        })

        // Fetch form definition
        await fetchFormDefinition(currentVereinbarung.vereinbarungName)
      }
    } catch (error) {
      showErrorMessage(error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Fetch form definition for the given report name
   */
  const fetchFormDefinition = async (reportName: string) => {
    try {
      const { data } = await executeGET<{
        reportParameters: ReportFormField[]
      }>(`/jasper/report/parameters?reportName=${reportName}`)

      if (data?.reportParameters) {
        setVereinbarungFormDefinition(data.reportParameters)
      }
    } catch (error) {
      showErrorMessage(error)
    }
  }

  /**
   * Download the generated PDF
   */
  const downloadHandler = async () => {
    if (fileUrl && fileName) {
      await downloadFileFromUrl(fileUrl, fileName)
    }
  }

  /**
   * Prepare the POST body for API calls
   */
  const getPostBody = () => {
    const formValues = getValues()
    const parameters = mapValuesToFormFields(
      vereinbarungFormDefinition,
      formValues.parameters
    )

    return {
      ...formValues,
      vereinbarungName: selectedVereinbarungValue,
      outputFormat: 'PDF',
      parameters,
      personalnummer: selectedMitarbeiterValue,
      gueltigAb,
      gueltigBis,
    }
  }

  /**
   * Generate a PDF preview
   */
  const onGenerateReport = async () => {
    setFileUrl(null)
    setFileName(null)
    setIsPdfLoading(true)
    setSelectedReportName(selectedVereinbarungValue)

    try {
      const body = getPostBody()

      const response = await fetchGatewayRaw('/vereinbarung/generatePreview', {
        method: 'POST',
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        throw new Error(`Failed to load ${selectedVereinbarungValue}-File`)
      }

      // Create blob URL from PDF data
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      setFileUrl(url)

      // Get filename from response
      const fileName = getFileNameFromResponse(response)
      setFileName(fileName)
    } catch (error) {
      showError(t('error.laden'))
    } finally {
      setIsPdfLoading(false)
    }
  }

  /**
   * Save the form
   */
  const onSave = async () => {
    setIsLoading(true)

    try {
      const body = getPostBody()
      const { data } = await executePOST<{ workflowgroup: Workflow[] }>(
        `/vereinbarung/edit`,
        body
      )

      updateWorkflowGroup(data?.workflowgroup)
    } catch (error) {
      showErrorMessage(error)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Start the signing request process
   */
  const onSignRequest = async () => {
    if (isSigned) {
      setShowOverrideModal(true)
    } else {
      startSignRequest()
    }
  }

  const startSignRequest = async () => {
    setIsLoading(true)

    try {
      // Save the form first
      const body = getPostBody()
      await executePOST<{ workflowgroup: Workflow[] }>(
        `/vereinbarung/edit`,
        body
      )

      // Generate the file
      await fetchGatewayRaw('/vereinbarung/generateFile', {
        method: 'POST',
        body: JSON.stringify(body),
      })

      // Send signing request
      if (vereinbarungId) {
        await executePOST<{ workflowgroup: Workflow[] }>(
          `/mitarbeiter/sendVereinbarungSigningRequest?vereinbarungId=${vereinbarungId}`
        )

        // the API doesn't provide proper WFI updates
        // this is a hack
        await waitFor(MOXIS_DELAY_TIMEOUT)

        const { data } = await executeGET<{ workflowgroup: Workflow[] }>(
          `/vereinbarung/getWorkflowgroup?vereinbarungId=${vereinbarungId}`
        )

        updateWorkflowGroup(data?.workflowgroup)
      }

      showInfo(t('label.unterschriftenlaufGestartet'))
    } catch (error) {
      showErrorMessage(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-auto flex-col gap-8">
      <div className="relative grid flex-auto grid-cols-12 gap-x-12 gap-y-6">
        {/* Form section title */}
        <div className="col-span-6 space-y-6">
          <h2 className="block text-xl">{t('label.createVereinbarung')}</h2>
        </div>

        {/* Preview section title */}
        <div className="col-span-6 space-y-6">
          <div className="flex justify-between gap-4">
            <h2 className="block text-xl leading-10">
              {t('label.vorschau')}
              {selectedReportName ? ` — ${selectedReportName}` : ''}
            </h2>
            {fileUrl && (
              <div>
                <ButtonTw
                  type="button"
                  className="flex justify-center gap-2"
                  size={ButtonSize.Large}
                  testId="report-download-button"
                  onClick={downloadHandler}
                >
                  <ArrowDownTrayIcon className="size-5" />
                  {t('label.herunterladen')}
                </ButtonTw>
              </div>
            )}
          </div>
        </div>

        {/* Form section */}
        <form className="col-span-6 flex flex-col space-y-6">
          <MitarbeiterSearchTw
            selectedEntry={
              vereinbarung
                ? ({
                    name: `${vereinbarung.vorname} ${vereinbarung.nachname}`,
                    personalnummer: vereinbarung.personalnummer,
                  } as MitarbeiterResult)
                : undefined
            }
            label={t('label.mitarbeiter')}
            placeholder={t('placeholder.mitarbeiter')}
            control={control}
            disabled
            {...register('selectedMitarbeiter')}
          />
          <InputTextTw
            label={t('label.selectedVereinbarung')}
            placeholder={t('placeholder.selectedVereinbarung')}
            control={control}
            disabled
            {...register('selectedVereinbarung')}
          />
          <div className="flex gap-4">
            <div className="flex-auto">
              <DatepickerTw
                label={t('label.gueltigAb')}
                placeholder={t('placeholder.gueltigAb')}
                control={control}
                name="gueltigAb"
              />
            </div>
            <div className="flex-auto">
              <DatepickerTw
                label={t('label.gueltigBis')}
                placeholder={t('placeholder.gueltigBis')}
                control={control}
                name="gueltigBis"
              />
            </div>
          </div>

          {/* Dynamic form fields */}
          {vereinbarungFormDefinition &&
            vereinbarungFormDefinition.length > 0 && (
              <div>
                <div className="mb-8 space-y-6">
                  <div className="mb-6 flex content-center items-center justify-between">
                    <h3 className="text-xl text-gray-900">
                      {t('label.reportSettings')}
                    </h3>
                  </div>

                  <div>
                    <div className="flex flex-col gap-x-8 gap-y-6">
                      <DynamicFormFields
                        control={control}
                        isLoading={isLoading}
                        formDefinition={vereinbarungFormDefinition}
                        register={register}
                      />
                    </div>
                  </div>
                </div>

                <ButtonTw
                  type="button"
                  onClick={onGenerateReport}
                  className="flex w-full justify-center"
                  size={ButtonSize.Large}
                  disabled={isLoading}
                  isLoading={isLoading}
                  testId="report-generate-button"
                >
                  {t('label.reportErzeugen')}
                </ButtonTw>
              </div>
            )}
        </form>

        {/* PDF Preview */}
        <div className="col-span-6 space-y-6">
          <div className="relative h-full min-h-[800px] overflow-hidden rounded-lg border border-gray-100">
            {fileUrl ? (
              <PDFViewer
                url={fileUrl}
                height="100%"
                zoom="page-fit"
                className="relative"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-50">
                <div className="p-4">
                  {isPdfLoading ? (
                    <LoaderTw size={LoaderSize.XLarge} />
                  ) : (
                    <DocumentChartBarIcon className="h-12 w-12 text-gray-300" />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <HorizontalRow />

      {/* Action buttons */}
      <div className="flex gap-4">
        <ButtonTw
          href="/mitarbeiter/vereinbarungen"
          type="button"
          className="h-full w-full"
          isLoading={isLoading}
          size={ButtonSize.Large}
          secondary
        >
          {t('label.abbrechen')}
        </ButtonTw>
        <ButtonTw
          onClick={onSave}
          type="button"
          className="h-full w-full"
          isLoading={isLoading}
          size={ButtonSize.Large}
        >
          {t('label.speichern')}
        </ButtonTw>
        <ButtonTw
          onClick={onSignRequest}
          type="button"
          className="h-full w-full"
          isLoading={isLoading}
          size={ButtonSize.Large}
        >
          {t('label.dokumentZurUnterschrift')}
        </ButtonTw>
      </div>
      <DefaultModal
        showModal={showOverrideModal}
        closeModal={() => void setShowOverrideModal(false)}
        modalSize="2xl"
      >
        <h3 className="mb-4 text-xl font-bold">
          {t('label.overrideModalTitle')}
        </h3>
        <p>{t('label.overrideModalDescription')}</p>
        <div className="mt-6 flex justify-between gap-6 border-t border-gray-200 pt-6">
          <ButtonTw
            onClick={() => void setShowOverrideModal(false)}
            type="button"
            className="flex-auto"
            secondary
          >
            {t('label.abbrechen')}
          </ButtonTw>
          <ButtonTw
            onClick={() => {
              setShowOverrideModal(false)
              startSignRequest()
            }}
            type="button"
            className="flex-auto"
          >
            {t('label.speichern')}
          </ButtonTw>
        </div>
      </DefaultModal>
    </div>
  )
}
