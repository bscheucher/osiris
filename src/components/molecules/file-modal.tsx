/* eslint-disable @next/next/no-img-element */
'use client'

import {
  ArrowDownTrayIcon,
  DocumentChartBarIcon,
} from '@heroicons/react/24/outline'
import { useTranslations } from 'next-intl'
import React, { useEffect, useState } from 'react'

import TooltipTw from '@/components/atoms/tooltip-tw'
import LoaderTw, { LoaderSize } from '@/components/atoms/loader-tw'
import { DefaultModal } from '@/components/organisms/default-modal'
import PDFViewer from '@/components/organisms/pdf-viewer'
import useAsyncEffect from '@/hooks/use-async-effect'
import { fetchGatewayRaw } from '@/lib/utils/gateway-utils'
import {
  downloadFileFromUrl,
  getFileUrlFromStream,
  isGenericMimeType,
} from '@/lib/utils/object-utils'
import { isImageFileType } from '@/lib/utils/personalakt-utils'
import { showError } from '@/lib/utils/toast-utils'

const getFileNameWithExtension = (name: string, mimeType: string) => {
  if (!name.includes('.') && mimeType === 'application/pdf') {
    return `${name}.pdf`
  }
  return name
}

interface Props {
  title: string
  downloadUrl: string
  mimeType: string
  showModal: boolean
  closeModal: () => void
  testId?: string
  translationNamespace?: string
  children?: React.ReactNode
}

export default function FileModal({
  title,
  downloadUrl,
  mimeType,
  showModal,
  closeModal,
  testId = 'personalakt-file-modal',
  translationNamespace = 'personalakt.fileModal',
  children,
}: Props) {
  const t = useTranslations(translationNamespace)
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>(title)
  const [detectedMimeType, setDetectedMimeType] = useState<string>(
    mimeType || ''
  )
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    return () => {
      if (fileUrl) {
        window.URL.revokeObjectURL(fileUrl)
      }
    }
  }, [fileUrl])

  useAsyncEffect(async () => {
    if (showModal) {
      setIsLoading(true)
      try {
        const response = await fetchGatewayRaw(downloadUrl, {
          skipDefaultContentType: true,
        })

        if (!response?.ok) {
          throw new Error(
            `Failed to fetch file: ${response?.statusText || response?.status}`
          )
        }

        const result = await getFileUrlFromStream(response, mimeType)

        if (!result) {
          throw new Error(t('error.laden'))
        }

        const { url, fileName: streamFileName, detectedType } = result

        setFileUrl(url)
        if (streamFileName && streamFileName !== 'download') {
          setFileName(streamFileName)
        }
        setDetectedMimeType(detectedType)
      } catch (e) {
        showError(t('error.laden'))
      } finally {
        setIsLoading(false)
      }
    } else {
      setFileUrl(null)
      setDetectedMimeType('')
      setFileName(title)
      setIsLoading(true)
    }
  }, [showModal, downloadUrl, mimeType])

  const activeMimeType = isGenericMimeType(detectedMimeType)
    ? mimeType || detectedMimeType
    : detectedMimeType

  const handleDownload = () => {
    if (!fileUrl) return

    const finalName = getFileNameWithExtension(
      fileName || title,
      activeMimeType
    )

    downloadFileFromUrl(fileUrl, finalName, false)
  }

  return (
    <DefaultModal showModal={showModal} closeModal={closeModal} testId={testId}>
      <div className="flex h-[80vh] flex-col gap-6">
        <div className="flex items-center justify-between pr-24">
          <h3 className="truncate text-xl font-semibold text-gray-800">
            {`${t('title')} - ${fileName || title}`}
          </h3>
          {fileUrl && (
            <div className="absolute top-0 right-10 z-20 block pt-4 pr-4">
              <TooltipTw content={t('button.download')}>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="focus:ring-ibis-blue cursor-pointer rounded-md bg-white text-gray-400 hover:text-gray-500 focus:ring-2 focus:ring-offset-2 focus:outline-none"
                  data-testid="file-modal-download"
                >
                  <ArrowDownTrayIcon className="h-6 w-6" />
                </button>
              </TooltipTw>
            </div>
          )}
        </div>
        <div className="min-h-0 flex-1">
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
                <div className="relative flex h-full flex-col items-center justify-start overflow-hidden">
                  <div className="relative flex overflow-hidden rounded-lg border border-gray-200 shadow">
                    <img
                      src={fileUrl}
                      alt={title}
                      className="relative max-h-full"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex h-full flex-col justify-center gap-4">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <span className="font-normal text-gray-700">{title}</span>
                    <DocumentChartBarIcon className="h-12 w-12 text-gray-300" />
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <LoaderTw size={LoaderSize.XLarge} />
            </div>
          )}
        </div>
        {children && (
          <div className="flex items-center justify-center gap-4 border-t border-gray-100 pt-4">
            {children}
          </div>
        )}
      </div>
    </DefaultModal>
  )
}
