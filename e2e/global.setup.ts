import fs from 'fs/promises'
import path from 'path'

async function globalSetup() {
  const storageDir = path.join(__dirname, 'storage')

  try {
    await fs.mkdir(storageDir, { recursive: true })
    await fs.writeFile(path.join(storageDir, 'personalnummer.json'), '{}')
    await fs.writeFile(path.join(storageDir, 'session.json'), '{}')
  } catch (error) {
    console.error('Failed to create JSON files for temporary storage', error)
  }

  console.log('Temporary JSON files created')
}

export default globalSetup
