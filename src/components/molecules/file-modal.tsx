/* eslint-disable @next/next/no-img-element */
'use client'

import { DocumentChartBarIcon } from '@heroicons/react/24/outline'
import { useTranslations } from 'next-intl'
import React, { useState } from 'react'

import ButtonTw from '@/components/atoms/button-tw'
import LoaderTw, { LoaderSize } from '@/components/atoms/loader-tw'
import { DefaultModal } from '@/components/organisms/default-modal'
import PDFViewer from '@/components/organisms/pdf-viewer'
import useAsyncEffect from '@/hooks/use-async-effect'
import { fetchGatewayRaw } from '@/lib/utils/gateway-utils'
import {
  downloadFileFromUrl,
  getFileUrlFromStream,
} from '@/lib/utils/object-utils'
import { isImageFileType } from '@/lib/utils/personalakt-utils'
import { showError } from '@/lib/utils/toast-utils'

interface Props {
  title: string
  downloadUrl: string
  mimeType: string
  showModal: boolean
  closeModal: () => void
}

export default function FileModal({
  title,
  downloadUrl,
  mimeType,
  showModal,
  closeModal,
}: Props) {
  const t = useTranslations('personalakt.fileModal')
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>(title)
  const [detectedMimeType, setDetectedMimeType] = useState<string>(
    mimeType || ''
  )
  const [isLoading, setIsLoading] = useState(true)

  useAsyncEffect(async () => {
    if (showModal) {
      try {
        const response = await fetchGatewayRaw(downloadUrl)
        const result = await getFileUrlFromStream(response)

        if (result) {
          const [url, fileName, detectedType] = result

          setFileUrl(url)
          setFileName(fileName)
          setDetectedMimeType(detectedType)
        }
      } catch (e) {
        showError(t('error.laden'))
      } finally {
        setIsLoading(false)
      }
    } else {
      setFileUrl(null)
      setDetectedMimeType('')
      setFileName('')
      setIsLoading(true)
    }
  }, [showModal])

  const handleDownload = async () => {
    setIsLoading(true)

    const response = await fetchGatewayRaw(downloadUrl)
    const result = await getFileUrlFromStream(response)
    if (result) {
      const [url, fileName] = result
      downloadFileFromUrl(url, fileName)
    }

    setIsLoading(false)
  }

  // Use detected MIME type if available, otherwise fall back to the original prop
  const activeMimeType = detectedMimeType || mimeType

  return (
    <DefaultModal
      showModal={showModal}
      closeModal={closeModal}
      testId="personalakt-file-modal"
    >
      <div className="relative flex h-[80vh] flex-col gap-6">
        <h3 className="text-xl font-semibold text-gray-800">{`${t('title')} - ${fileName || title}`}</h3>
        {fileUrl ? (
          <>
            {activeMimeType === 'application/pdf' ? (
              <PDFViewer
                url={fileUrl}
                height="100%"
                zoom="page-fit"
                className="flex overflow-hidden rounded-lg border border-gray-200"
              />
            ) : isImageFileType(activeMimeType) ? (
              <div className="relative flex flex-1 flex-col items-center justify-start overflow-hidden">
                <div className="relative flex overflow-hidden rounded-lg border border-gray-200 shadow">
                  <img
                    src={fileUrl}
                    alt={title}
                    className="relative max-h-full"
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-auto flex-col justify-center gap-4">
                <div className="flex flex-col items-center justify-center gap-4">
                  <span className="font-normal text-gray-700">{title}</span>
                  <DocumentChartBarIcon className="h-12 w-12 text-gray-300" />
                </div>
              </div>
            )}
            <ButtonTw
              onClick={handleDownload}
              size="large"
              className="w-full justify-end"
              isLoading={isLoading}
              testId="file-modal-download"
            >
              {t('button.download')}
            </ButtonTw>
          </>
        ) : (
          <div className="flex w-full flex-auto items-center justify-center">
            <LoaderTw size={LoaderSize.XLarge} />
          </div>
        )}
      </div>
    </DefaultModal>
  )
}
