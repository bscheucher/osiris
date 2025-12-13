import { showErrorMessage } from './toast-utils'

export type ValueField =
  | string
  | number
  | undefined
  | unknown[]
  | Date
  | boolean

export function hasValue(o: any): boolean {
  if (!o) {
    return false
  }
  if (typeof o == 'string') {
    return o.length > 0
  }
  if (typeof o == 'boolean') {
    return o
  }
  if (typeof o == 'number') {
    return !isNaN(o)
  }
  if (o instanceof Date) {
    return !isNaN(+o)
  }
  if (o instanceof Array) {
    return o.length > 0
  }
  return true
}

export const removeDuplicates = (arr: string[]): string[] => [...new Set(arr)]

/**
 * @deprecated use downloadFileFromStream instead
 */
export async function invokeDownloadFromBlobResponse(
  response: Response | undefined,
  prefix = ''
) {
  if (!response) {
    return
  }
  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.style.display = 'none'
  a.href = url
  const filename =
    (hasValue(prefix) ? prefix + '_' : '') +
      response.headers
        .get('content-disposition')
        ?.split(';')[1]
        .split('=')[1] || 'download'
  a.setAttribute('download', filename)
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
}

export function downloadFileFromUrl(fileUrl: string, fileName: string) {
  // Create a temporary anchor element
  const a = document.createElement('a')
  a.href = fileUrl
  a.download = fileName

  // Append to body, click, and remove
  document.body.appendChild(a)
  a.click()

  // Cleanup
  window.URL.revokeObjectURL(fileUrl)
  document.body.removeChild(a)
}

export function getFileNameFromResponse(response: Response) {
  // Get filename from Content-Disposition header
  const contentDisposition = response.headers.get('content-disposition')
  let fileName = 'download' // default filename

  if (contentDisposition) {
    const fileNameMatch = contentDisposition.match(/filename=([^;]+)/)
    if (fileNameMatch?.[1]) {
      fileName = fileNameMatch[1].replace(/['"]/g, '')
    }
  }

  return fileName
}

export async function getFileUrlFromStream(response: Response) {
  try {
    const fileName = getFileNameFromResponse(response)

    // Get the stream
    const blob = await response.blob()

    // Create a URL for the blob
    const url = window.URL.createObjectURL(blob)

    // Detect MIME type from the blob
    const detectedType = blob.type

    return [url, fileName, detectedType]
  } catch (error) {
    showErrorMessage(error)
  }
}

export async function downloadFileFromStream(response?: Response) {
  try {
    if (!response || !response.ok) {
      throw new Error(`HTTP error! status: ${response?.status}`)
    }

    const result = await getFileUrlFromStream(response)

    if (result) {
      const [url, fileName] = result
      downloadFileFromUrl(url, fileName)
    }
  } catch (error) {
    showErrorMessage(error)
  }
}

export const getUrlEncodedValue = (str: string): string => {
  return encodeURIComponent(str).replace(/%20/g, '+')
}
