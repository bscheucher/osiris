import { promises as fs } from 'fs'
import { NextResponse } from 'next/server'
import path from 'path'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const filename = (await params).filename

    // You might want to add security checks here
    if (!filename.endsWith('.pdf')) {
      return new NextResponse('Invalid file type', { status: 400 })
    }

    const filePath = path.join(process.cwd(), 'public', 'pdfs', filename)
    const fileBuffer = await fs.readFile(filePath)

    await new Promise((resolve) => setTimeout(resolve, 1500))

    const response = new NextResponse(fileBuffer)
    response.headers.set('Content-Type', 'application/pdf')
    response.headers.set('Content-Disposition', 'inline')

    return response
  } catch (error) {
    return new NextResponse('PDF not found', { status: 404 })
  }
}
