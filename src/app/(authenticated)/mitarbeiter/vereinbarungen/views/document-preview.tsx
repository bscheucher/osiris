'use client'

import { DocumentChartBarIcon } from '@heroicons/react/20/solid'
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { VereinbarungEntry } from '../vereinbarungen-utils'
import ButtonTw, { ButtonSize } from '@/components/atoms/button-tw'
import LoaderTw, { LoaderSize } from '@/components/atoms/loader-tw'
import PDFViewer from '@/components/organisms/pdf-viewer'
import useAsyncEffect from '@/hooks/use-async-effect'
import { Workflow } from '@/lib/interfaces/workflow'
import { executeGET, fetchGatewayRaw } from '@/lib/utils/gateway-utils'
import {
  downloadFileFromUrl,
  getFileNameFromResponse,
} from '@/lib/utils/object-utils'
import {
  findFirstByVereinbarungName,
  FolderItem,
} from '@/lib/utils/personalakt-utils'
import { showErrorMessage } from '@/lib/utils/toast-utils'

export default function DocumentPreview({
  vereinbarungId,
  updateWorkflowGroup,
}: {
  vereinbarungId: string
  updateWorkflowGroup: (workflowgroup?: Workflow[]) => void
}) {
  const t = useTranslations('mitarbeiterVereinbarungen.detail')

  const [isPdfLoading, setIsPdfLoading] = useState(true)
  const [selectedReportName, setSelectedReportName] = useState('')
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

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
        const { personalnummer, vereinbarungName } = currentVereinbarung

        if (personalnummer && vereinbarungName) {
          const { data: folderstructureData } = await executeGET<{
            folderStructure: FolderItem[]
          }>(
            `/file/folder-structure?identifier=${currentVereinbarung.personalnummer}`
          )

          if (
            folderstructureData?.folderStructure &&
            folderstructureData?.folderStructure.length
          ) {
            const document = findFirstByVereinbarungName(
              folderstructureData.folderStructure[0],
              vereinbarungName
            )

            if (document) {
              const response = await fetchGatewayRaw(
                `/file/download-filename?filename=${document.title}&directoryPath=${document.path}`
              )
              if (!response || !response.ok) {
                throw new Error('Failed to load File')
              }

              const blob = await response.blob()
              const url = window.URL.createObjectURL(blob)

              // Get filename from response
              const fileName = getFileNameFromResponse(response)
              setFileName(fileName)

              setSelectedReportName(vereinbarungName)
              setFileUrl(url)
              setIsPdfLoading(false)
            } else {
              throw new Error('Kein Dokument gefunden.')
            }
          }
        }

        //
      }
    } catch (error) {
      showErrorMessage(error)
    } finally {
      setIsPdfLoading(false)
    }
  }, [])

  /**
   * Download the generated PDF
   */
  const downloadHandler = async () => {
    if (fileUrl && fileName) {
      await downloadFileFromUrl(fileUrl, fileName)
    }
  }

  return (
    <div className="flex flex-auto flex-col gap-8">
      <div className="relative grid flex-auto grid-cols-12 gap-x-12 gap-y-6">
        {/* Preview section title */}
        <div className="col-span-12 space-y-6">
          <div className="flex justify-between gap-4">
            <h2 className="block text-xl leading-10">
              {t('label.ansicht')}{' '}
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
        {/* PDF Preview */}
        <div className="col-span-12 space-y-6">
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
    </div>
  )
}
