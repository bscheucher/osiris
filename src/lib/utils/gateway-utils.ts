import { apiCache } from './cache-utils'
import { stripErrorsFromPayload } from './form-utils'
import { downloadFileFromStream } from './object-utils'
import { formFieldToUploadTypeMap } from '../constants/mitarbeiter-constants'
import { authService } from '@/lib/services/auth-service'
import { showError, showErrorMessage, showInfo } from '@/lib/utils/toast-utils'

export interface ErrorsResponse {
  errors?: string[]
  errorsMap?: Record<string, string>
}

export interface GatewayResponse<T> {
  data: T | null
  pagination: any | null
  success: boolean
  message?: string
  response: Response
}

const API_URL_PREFIX = '/api/gateway'

function checkErrorStatus(response: Response & { success?: boolean }) {
  if (response.status !== 200) {
    switch (response.status) {
      case 204:
        throw new Error('Server liefert keine Daten für diese Anfrage')
      case 400:
        throw new Error('Bad request')
      case 401:
        throw new Error('Unauthorized, User nicht eingeloggt')
      case 403:
        throw new Error('Rechte bei User nicht vorhanden')
      case 413:
        throw new Error('Datei überschreitet die Größe von 10 MB')
      case 422:
        throw new Error('Validierungserror')
      default:
        throw new Error(`Server Fehler mit Code: ${response.status}`)
    }
  }
}

async function handleResponse<T>(
  response: Response & { success?: boolean }
): Promise<GatewayResponse<T>> {
  if (!response) {
    throw new Error('Keine Antwort vom Server')
  }

  // Handle unauthorized responses by triggering MSAL logout
  if (response.status === 401) {
    await authService.logout()
  }

  if (response && response.status) {
    checkErrorStatus(response)
  }

  // only parse standard responses
  if (response.headers.get('content-type') === 'application/json') {
    const responseData = await response.json()

    const { success, data, pagination, message } = responseData

    // display error messages for integration / third party errors
    if (message) {
      if (!success) {
        showError(message)
      } else {
        showInfo(message)
      }
    }

    if (!data || !Array.isArray(data)) {
      return responseData
    }

    const transformedData: any = {}

    data.forEach((item: any) => {
      const { type, attributes } = item
      transformedData[type] = attributes
    })

    return { data: transformedData, success, pagination, response }
  }

  // default response to catch unpredictable backend response
  return {
    success: true,
    data: null,
    pagination: null,
    response,
  } as GatewayResponse<T>
}

export type FetchGatewayOptions = Omit<RequestInit, 'body'> & {
  withCache?: boolean
  cacheTTL?: number
  withErrors?: boolean
}

export type FetchGatewayOptionsWithBody<T> = FetchGatewayOptions & {
  body?: T & Partial<ErrorsResponse>
}

// complex utility method with caching
export async function fetchGateway<T, U = any>(
  endpoint: string,
  options?: FetchGatewayOptionsWithBody<U>
): Promise<GatewayResponse<T>> {
  const { ...fetchOptions } = options
  let requestBody = fetchOptions?.body

  // custom settings
  const withCache = !!options?.withCache
  const cacheTTL = options?.cacheTTL || 900 * 1000 // 15 minutes
  const cacheKey = `${options?.method || 'GET'}:${endpoint}`
  const withErrors = !!options?.withErrors // pass errors to backend if true

  // Only use cache for GET requests
  if (withCache && (!options?.method || options.method === 'GET')) {
    const cachedData = apiCache.get<GatewayResponse<T>>(cacheKey)

    if (cachedData && process.env.NEXT_PUBLIC_DEBUG_MODE) {
      console.debug(`-------------------------------`)
      console.debug(`return cached data: ${endpoint}`, cachedData)
      console.debug(`result:`, cachedData)
      console.debug(`-------------------------------`)
      return cachedData
    }
  }

  try {
    // Get access token from MSAL
    const accessToken = await authService.getAccessToken()
    if (!accessToken) {
      throw new Error('Nicht authentifiziert')
    }

    // Detect content type and prepare body
    let contentType: string | undefined = 'application/json'
    let body: any = undefined

    if (requestBody instanceof FormData) {
      body = requestBody
      contentType = undefined // Let browser set it automatically
    } else if (requestBody instanceof File) {
      const formData = new FormData()
      formData.append('file', requestBody)
      body = formData
      contentType = undefined // Let browser set it automatically
    } else if (requestBody instanceof Blob) {
      body = requestBody
      contentType = requestBody.type
    } else if (typeof requestBody === 'object' && requestBody !== null) {
      // TODO: Allow Arrays here?
      // strip errors and errorsMap according to setting
      if (requestBody && !withErrors) {
        requestBody = stripErrorsFromPayload(requestBody)
      }

      body = JSON.stringify(requestBody)
      contentType = 'application/json'
    }

    // Prepare headers with Authorization
    const headers = new Headers({
      ...(contentType && { 'Content-Type': contentType }),
      Authorization: `Bearer ${accessToken}`,
      ...options?.headers,
    })

    const response = await fetch(`${API_URL_PREFIX}${endpoint}`, {
      ...fetchOptions,
      headers,
      body,
      cache: 'no-store',
    })

    const result = await handleResponse<T>(response)

    if (process.env.NEXT_PUBLIC_DEBUG_MODE) {
      console.debug(`-------------------------------`)
      console.debug(`fetch url: ${endpoint}`, result)
      console.debug(`result:`, result)
      console.debug(`-------------------------------`)
    }

    // Cache successful GET requests
    if (withCache && (!options?.method || options.method === 'GET')) {
      apiCache.set(cacheKey, result, cacheTTL)
    }

    return result
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error)
    showErrorMessage(error)
    if (typeof error === 'string') {
      throw new Error(error)
    } else {
      throw new Error('Fehler beim Abrufen der Daten')
    }
  }
}

// minimal utility method
export async function fetchGatewayRaw(
  endpoint: string,
  options?: RequestInit & { skipDefaultContentType?: boolean }
): Promise<any> {
  try {
    // Get access token from MSAL
    const accessToken = await authService.getAccessToken()
    if (!accessToken) {
      throw new Error('Nicht authentifiziert')
    }

    const headers = new Headers({
      // Only set default Content-Type if not explicitly skipped
      ...(!options?.skipDefaultContentType && {
        'Content-Type': 'application/json',
      }),
      Authorization: `Bearer ${accessToken}`,
      ...options?.headers,
    })

    const response = await fetch(`${API_URL_PREFIX}${endpoint}`, {
      cache: 'no-store',
      ...options,
      headers,
    })

    return response
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error)
    showErrorMessage(error)
  }
}

// method specific wrapper methods
export const executeGET = async <T, U = any>(
  endpoint: string,
  options?: Omit<FetchGatewayOptions, 'method' | 'body'>
) => {
  return fetchGateway<T, U>(endpoint, {
    ...options,
    headers: { ...options?.headers },
    method: 'GET',
  })
}

export const executePOST = async <T, U = any>(
  endpoint: string,
  body?: U,
  options?: Omit<FetchGatewayOptions, 'method' | 'body'>
) => {
  return fetchGateway<T, U>(endpoint, {
    ...options,
    method: 'POST',
    headers: { ...options?.headers },
    body,
  } as FetchGatewayOptionsWithBody<U>)
}

export const executePUT = async <T, U = any>(
  endpoint: string,
  body: U,
  options?: Omit<FetchGatewayOptions, 'method' | 'body'>
) => {
  return fetchGateway<T, U>(endpoint, {
    ...options,
    method: 'PUT',
    headers: { ...options?.headers },
    body,
  } as FetchGatewayOptionsWithBody<U>)
}

export const executeDELETE = async <T, U = any>(
  endpoint: string,
  options?: Omit<FetchGatewayOptions, 'method' | 'body'>
) => {
  return fetchGateway<T, U>(endpoint, { ...options, method: 'DELETE' })
}

// Helper methods
export const toQueryString = (params: Record<string, any>): string => {
  const validParams = Object.entries(params)
    .filter(
      ([_, value]) => value !== undefined && value !== null && value !== ''
    )
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    )
    .join('&')

  return validParams ? `?${validParams}` : ''
}

export async function executeFileUpload(
  file: File,
  type: string,
  identifier: string,
  additionalIdentifier?: string
) {
  const formData = new FormData()
  formData.append('file', file)

  return await fetchGatewayRaw(
    `/file/upload?type=${type}&identifier=${identifier}${additionalIdentifier ? `&additionalIdentifier=${additionalIdentifier}` : ''}`,
    {
      method: 'POST',
      body: formData,
      skipDefaultContentType: true,
    }
  )
}

export async function executeFileDownload(
  fieldName: string,
  identifier: string,
  additionalIdentifier?: number
): Promise<any> {
  const uploadType = formFieldToUploadTypeMap.get(fieldName)
  if (!uploadType) {
    console.error('Form field name and file type mismatch')
    showError('Form field name and file type mismatch')
    return
  }
  const response = await fetchGatewayRaw(
    `/file/download?type=${uploadType}&identifier=${identifier}${additionalIdentifier ? `&additionalIdentifier=${additionalIdentifier}` : ''}`
  )

  if (response.ok) {
    await downloadFileFromStream(response)
  } else {
    showError('der Download konnte nicht erfolgreich ausgeführt werden')
  }
}
