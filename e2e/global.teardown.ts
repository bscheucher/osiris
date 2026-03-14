import fs from 'fs/promises'
import path from 'path'

async function globalTeardown() {
  const storageDir = path.join(__dirname, 'storage')
  try {
    await fs.unlink(path.join(storageDir, 'personalnummer.json'))
    await fs.unlink(path.join(storageDir, 'session.json'))
  } catch (error) {
    console.error('Failed to delete JSON files for temporary storage', error)
  }
  console.log('Temporary JSON files deleted')
}

export default globalTeardown
