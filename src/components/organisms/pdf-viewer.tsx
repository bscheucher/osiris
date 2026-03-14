'use client'

import { useTranslations } from 'next-intl'

interface PDFViewerProps {
  url: string
  height?: string | number
  className?: string
  // PDF viewer options
  hideToolbar?: boolean
  zoom?: number | 'page-fit' | 'page-width' | 'page-height'
  page?: number
  scrollbar?: boolean
  rotation?: 0 | 90 | 180 | 270
  hideFrameBorder?: boolean
  style?: React.CSSProperties
  testId?: string
}

const PDFViewer = ({
  url,
  height = '800px',
  className = '',
  hideToolbar = false,
  zoom = 'page-width',
  page = 1,
  scrollbar = true,
  rotation = 0,
  hideFrameBorder = false,
  style,
  testId,
}: PDFViewerProps) => {
  const t = useTranslations('components.pdfViewer')

  // Construct the URL with parameters
  const urlWithParams = new URL(url, window.location.origin)
  urlWithParams.hash = `page=${page}&zoom=${zoom}&toolbar=${hideToolbar ? '0' : '1'}&view=FitH`

  return (
    <object
      data={urlWithParams.toString()}
      type="application/pdf"
      width="100%"
      height={height}
      className={className}
      style={{
        border: hideFrameBorder ? 'none' : undefined,
        overflow: scrollbar ? 'auto' : 'hidden',
        transform: rotation ? `rotate(${rotation}deg)` : undefined,
        borderBottom: '5px solid rgb(82, 86, 89)',
        ...style,
      }}
      data-testid={testId}
    >
      <p>
        {t('noSupport')}
        <a href={url} download className="ml-2 underline">
          {t('downloadInstead')}
        </a>
      </p>
    </object>
  )
}

export default PDFViewer
