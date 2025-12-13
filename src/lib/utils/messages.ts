import { readFileSync } from 'fs'
import { parse } from 'jsonc-parser'
import { join } from 'path'

export async function getMessages(locale: string) {
  try {
    const filePath = join(process.cwd(), 'src', 'messages', `${locale}.jsonc`)
    const content = readFileSync(filePath, 'utf-8')
    return parse(content)
  } catch (error) {
    console.error(`Failed to load messages for locale ${locale}:`, error)
    return {}
  }
}
