import { NextRequest } from 'next/server'

// Helper to forward headers while removing ones that cause issues
function filterHeaders(headers: Headers): Headers {
  const filtered = new Headers(headers)
  // Remove headers that could cause issues
  filtered.delete('host')
  filtered.delete('connection')
  filtered.delete('content-length')
  return filtered
}

// German transliteration for umlauts
function germanTransliterate(text: string): string {
  return text
    .replace(/Ä/g, 'Ae')
    .replace(/Ö/g, 'Oe')
    .replace(/Ü/g, 'Ue')
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
}

// Generic handler for all HTTP methods
async function handleRequest(request: NextRequest, method: string) {
  try {
    const path = request.nextUrl.pathname.replace('/api/gateway', '')
    const searchParams = request.nextUrl.search
    const url = `${process.env.NEXT_PUBLIC_GATEWAY_URL}${path}${searchParams}`

    const headers = filterHeaders(request.headers)

    // Check for Authorization header from client
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    }

    // Forward the authorization header
    headers.set('authorization', authHeader)

    // Get the request body if it exists
    let body: BodyInit | null = null
    if (method !== 'GET' && method !== 'HEAD') {
      body = await request.blob()
    }

    const response = await fetch(url, {
      method,
      headers,
      body,
      // Forward credentials if needed
      credentials: 'include',
    })

    // Forward the response with appropriate headers
    const responseHeaders = new Headers(response.headers)

    // Only handle content-disposition header
    const contentDisposition = responseHeaders.get('content-disposition')
    if (contentDisposition && contentDisposition.includes('filename=')) {
      // Simple regex replacement for the filename
      const newDisposition = contentDisposition.replace(
        /filename="([^"]*)"/,
        (match, filename) => {
          // Apply German transliteration to the filename
          const transliteratedFilename = germanTransliterate(filename)
          return `filename="${transliteratedFilename}"`
        }
      )

      responseHeaders.set('content-disposition', newDisposition)
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    })
  } catch (error) {
    // console.error('Proxy error:', error)
    return new Response(
      JSON.stringify({ error: `Proxy error occurred: ${error}` }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }
}

// Export handlers for all HTTP methods
export async function GET(request: NextRequest) {
  return handleRequest(request, 'GET')
}

export async function POST(request: NextRequest) {
  return handleRequest(request, 'POST')
}

export async function PUT(request: NextRequest) {
  return handleRequest(request, 'PUT')
}

export async function DELETE(request: NextRequest) {
  return handleRequest(request, 'DELETE')
}

export async function PATCH(request: NextRequest) {
  return handleRequest(request, 'PATCH')
}

export async function HEAD(request: NextRequest) {
  return handleRequest(request, 'HEAD')
}

export async function OPTIONS(request: NextRequest) {
  return handleRequest(request, 'OPTIONS')
}
