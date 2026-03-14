'use client'

import { ArrowDownTrayIcon } from '@heroicons/react/20/solid'
import { DocumentChartBarIcon } from '@heroicons/react/24/outline'
import { useTranslations } from 'next-intl'
import React, { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import DynamicReportForm from '@/app/(authenticated)/reports/dynamic-report-form'
import ButtonTw, { ButtonSize } from '@/components/atoms/button-tw'
import ComboSelectTw from '@/components/atoms/combo-select-tw'
import InputSelectTw from '@/components/atoms/input-select-tw'
import LoaderTw, { LoaderSize } from '@/components/atoms/loader-tw'
import {
  FormValues,
  mapValuesToFormFields,
  ReportDescription,
  ReportFormField,
} from '@/components/organisms/dynamic-form-fields'
import PDFViewer from '@/components/organisms/pdf-viewer'
import useAsyncEffect from '@/hooks/use-async-effect'
import {
  convertEnumToKeyValueArray,
  convertToKeyLabelOptions,
} from '@/lib/utils/form-utils'
import { executeGET, fetchGatewayRaw } from '@/lib/utils/gateway-utils'
import {
  downloadFileFromUrl,
  getFileNameFromResponse,
} from '@/lib/utils/object-utils'
import { showError } from '@/lib/utils/toast-utils'

enum ReportFormats {
  PDF = 'PDF',
  XLS = 'XLS',
  XLSX = 'XLSX',
  CSV = 'CSV',
}

export default function Page() {
  const t = useTranslations('reports')
  const { register, control } = useForm<any>({
    defaultValues: {
      selectedFormat: ReportFormats.PDF,
    },
  })

  const [isLoading, setIsLoading] = useState(true)
  const [isReportParamsLoading, setIsReportParamsLoading] = useState(false)
  const [isPdfLoading, setIsPdfLoading] = useState(false)
  const [selectedReportName, setSelectedReportName] = useState('')
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [reportList, setReportList] = useState<{ id: string; name: string }[]>(
    []
  )
  const [reportFormDefinitions, setReportFormDefinitions] = useState<
    ReportFormField[]
  >([])
  const selectedReportValue = useWatch({ control, name: 'selectedReport' })
  const selectedFormatValue = useWatch({ control, name: 'selectedFormat' })
  const isPDFSelected = selectedFormatValue === ReportFormats.PDF

  useEffect(() => {
    setFileUrl(null)
    setFileName(null)
  }, [selectedFormatValue])

  useAsyncEffect(async () => {
    try {
      const { data } = await executeGET<{ report: ReportDescription[] }>(
        '/jasper/reports?reportType=manual'
      )

      if (data?.report && data.report.length) {
        const options = data.report.map(({ reportName }) => ({
          id: reportName,
          name: reportName,
        }))
        setReportList(options)
      }
    } catch (error) {
      showError(t('error.laden'))
    }
    setIsLoading(false)
  }, [])

  useAsyncEffect(async () => {
    if (selectedReportValue) {
      setIsReportParamsLoading(true)
      try {
        const { data } = await executeGET<{
          reportParameters: ReportFormField[]
        }>(`/jasper/report/parameters?reportName=${selectedReportValue}`)

        if (data?.reportParameters) {
          setReportFormDefinitions(data.reportParameters)
        }
      } catch (error) {
        showError(t('error.laden'))
      } finally {
        setIsReportParamsLoading(false)
      }
    } else {
      setReportFormDefinitions([])
    }
  }, [selectedReportValue])

  const downloadHandler = async () => {
    if (fileUrl && fileName) {
      await downloadFileFromUrl(fileUrl, fileName)
    }
  }

  const onSubmit = async (formValues: { parameters: FormValues[] }) => {
    setFileUrl(null)
    setFileName(null)
    setIsPdfLoading(true)
    const reportName =
      reportList.find((entry) => entry.id === selectedReportValue)?.name || ''

    if (!reportName || !selectedFormatValue) {
      return
    }

    // update report name on submit event
    setSelectedReportName(reportName)

    try {
      const reportParameters = mapValuesToFormFields(
        reportFormDefinitions,
        formValues.parameters
      )
      const body = JSON.stringify({
        reportName,
        outputFormat: selectedFormatValue,
        reportParameters,
      })
      // Fetch PDF data
      const response = await fetchGatewayRaw('/jasper/generate/report', {
        method: 'POST',
        body,
      })

      if (!response.ok) {
        throw new Error(`Failed to load ${selectedFormatValue}-File`)
      }

      // Create a blob URL from the PDF data
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      setFileUrl(url)

      // get file name from response
      const fileName = getFileNameFromResponse(response)
      setFileName(fileName)
    } catch (e) {
      showError(t('error.laden'))
    } finally {
      setIsPdfLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-4xl xl:max-w-5xl 2xl:max-w-7xl">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="block text-3xl font-semibold tracking-tight text-gray-900">
          {t('labels.reports')}
        </h1>
      </div>
      <div className="relative bg-white p-8 shadow sm:rounded-lg">
        {isLoading ? (
          <div className="flex h-[760px] items-center justify-center">
            <LoaderTw size={LoaderSize.XLarge} />
          </div>
        ) : (
          <div className="relative grid grid-cols-12 gap-x-12 gap-y-6">
            <div className="col-span-4 space-y-6">
              <h2 className="block text-xl leading-10">
                {t('labels.createReport')}
              </h2>
            </div>
            <div className="col-span-8 space-y-6">
              <div className="flex justify-between gap-4">
                <h2 className="block text-xl leading-10">
                  {t('labels.vorschau')}
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
                      {t('labels.reportHerunterladen')}
                    </ButtonTw>
                  </div>
                )}
              </div>
            </div>
            <div className="col-span-4 space-y-6">
              <div>
                <ComboSelectTw
                  label={t('labels.selectedReport')}
                  options={convertToKeyLabelOptions(reportList)}
                  placeholder={t('placeholder.selectedReport')}
                  control={control}
                  disabled={isLoading || isReportParamsLoading}
                  testId="selectedReport"
                  {...register('selectedReport')}
                />
              </div>
              {isReportParamsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoaderTw size={LoaderSize.Large} />
                </div>
              ) : (
                <>
                  <div>
                    <InputSelectTw
                      label={t('labels.selectedFormat')}
                      options={convertEnumToKeyValueArray(ReportFormats)}
                      control={control}
                      disabled={isLoading}
                      testId="selectedFormat"
                      {...register('selectedFormat')}
                    />
                  </div>
                  {reportFormDefinitions && !!reportFormDefinitions.length && (
                    <DynamicReportForm
                      formDefinition={reportFormDefinitions}
                      onSubmit={onSubmit}
                    />
                  )}
                </>
              )}
            </div>
            <div className="col-span-8 space-y-6">
              <div className="relative h-full min-h-[800px] overflow-hidden rounded-lg border border-gray-100">
                {isPDFSelected && fileUrl ? (
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
        )}
      </div>
    </div>
  )
}
