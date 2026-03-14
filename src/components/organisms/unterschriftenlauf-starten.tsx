'use client'

import { DocumentChartBarIcon } from '@heroicons/react/24/outline'
import { useTranslations } from 'next-intl'
import React, { useState } from 'react'

import StepPlaceholder from './step-placeholder'
import ButtonTw from '@/components/atoms/button-tw'
import HorizontalRow from '@/components/atoms/hr-tw'
import LoaderTw, { LoaderSize } from '@/components/atoms/loader-tw'
import InfoSectionTw from '@/components/molecules/info-section-tw'
import PDFViewer from '@/components/organisms/pdf-viewer'
import useAsyncEffect from '@/hooks/use-async-effect'
import {
  FileUploadType,
  STEP_NAME,
  STEP_STATUS,
} from '@/lib/constants/mitarbeiter-constants'
import { Workflow } from '@/lib/interfaces/workflow'
import { executePOST, fetchGatewayRaw } from '@/lib/utils/gateway-utils'
import { getWorkflowItemByName } from '@/lib/utils/mitarbeiter/workflow-utils'
import {
  showError,
  showErrorMessage,
  showSuccess,
} from '@/lib/utils/toast-utils'
import useOnboardingStore from '@/stores/onboarding-store'

interface Props {
  personalnummer: string
}

const UnterschriftenlaufStarten = ({ personalnummer }: Props) => {
  const t = useTranslations('mitarbeiter.erfassen')
  const [isLoading, setIsLoading] = useState(false)
  const { workflowItems, setWorkflowItemsFromWorkflow } = useOnboardingStore()
  const [isPdfLoading, setIsPdfLoading] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)

  const workflowItem = getWorkflowItemByName(
    workflowItems,
    STEP_NAME.UNTERSCHRIFTENLAUF_STARTEN
  )

  const isInProgress =
    workflowItem?.workflowItemStatus === STEP_STATUS.INPROGRESS

  const onClickHandler = async () => {
    setIsLoading(true)

    try {
      const response = await executePOST<{
        moxis: any
        workflowgroup: Workflow[]
      }>(
        `/mitarbeiter/sendMoxisSigningRequest?personalnummer=${personalnummer}`
      )
      if (response.data?.workflowgroup) {
        setWorkflowItemsFromWorkflow(response.data.workflowgroup)
      }
      showSuccess(t('unterschriftenlaufStarten.success'))
    } catch (e) {
      showErrorMessage(e)
    } finally {
      setIsLoading(false)
    }
  }

  useAsyncEffect(async () => {
    if (!isInProgress) {
      return
    }

    setIsPdfLoading(true)

    try {
      // Fetch file with content type application/octet-stream
      const response = await fetchGatewayRaw(
        `/file/download?type=${FileUploadType.DIENSTVERTRAG}&identifier=${personalnummer}`
      )
      if (!response || !response.ok) {
        throw new Error('Failed to load File')
      }

      // Create a blob URL with application type pdf from the file data
      const blob = await response.blob()
      const pdfBlob = new Blob([blob], { type: 'application/pdf' })
      const url = URL.createObjectURL(pdfBlob)
      setPdfUrl(url)
    } catch (e) {
      showError(t('unterschriftenlaufStarten.error.laden'))
    } finally {
      setIsPdfLoading(false)
    }
  }, [])

  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-3xl font-semibold tracking-tight text-gray-900">
          {t('title.unterschriftenlaufStarten')}
        </h2>
      </div>
      {isInProgress ? (
        <div className="relative min-h-[450px] max-w-3xl rounded-lg bg-white p-8 shadow">
          <h3 className="mb-4 text-xl leading-7 font-semibold text-gray-900">
            {t('unterschriftenlaufStarten.vorschau')}
          </h3>
          <div className="flex flex-col space-y-8">
            <div className="relative h-[800px] max-h-[calc(100vh-430px)] min-h-72 overflow-hidden rounded-lg border border-gray-100">
              {pdfUrl ? (
                <PDFViewer
                  url={pdfUrl}
                  height="100%"
                  zoom="page-fit"
                  className="relative"
                  testId="Unterschriftenlauf starten-PdfViewer"
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
            <div className="mb-8">
              <InfoSectionTw
                description={t('unterschriftenlaufStarten.info')}
                testId="unterschriftenlaufStarten-infoText"
              />
            </div>
            <HorizontalRow />
            <ButtonTw
              onClick={onClickHandler}
              isLoading={isLoading}
              size="xlarge"
              testId="unterschriftenlaufStarten-button"
            >
              {t('unterschriftenlaufStarten.start')}
            </ButtonTw>
          </div>
        </div>
      ) : (
        <StepPlaceholder workflowItem={workflowItem} withBackground />
      )}
    </div>
  )
}

export default UnterschriftenlaufStarten
