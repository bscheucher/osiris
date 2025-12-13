// scripts/process-translations.ts
import fs from 'fs'
import { parse } from 'jsonc-parser'
import path from 'path'

const messagesDir = path.join(process.cwd(), 'src', 'messages')
const outputDir = path.join(process.cwd(), 'src', 'messages', 'compiled')

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

// Process all JSONC files
const files = fs
  .readdirSync(messagesDir)
  .filter((file) => file.endsWith('.jsonc'))

files.forEach((file) => {
  const filePath = path.join(messagesDir, file)
  const content = fs.readFileSync(filePath, 'utf-8')
  const parsed = parse(content)

  const outputFile = file.replace('.jsonc', '.json')
  const outputPath = path.join(outputDir, outputFile)

  fs.writeFileSync(outputPath, JSON.stringify(parsed, null, 2))
})

console.log(`✅ Processed ${files.length} translation files successfully!`)
