export interface TreeNode {
  id: string
  title: string
  createdAt: string
  path: string
  content?: FolderItem[] | FileItem[]
  mimeType?: string
}

export type FolderItem = Omit<TreeNode, 'mimeType'>

export type FileItem = Required<Omit<TreeNode, 'content'>>

export interface FolderApiResponse {
  success: boolean
  data: {
    type: string
    attributes: FolderItem[]
  }[]
}

export const getFileTypeFromMime = (mimeType?: string): string => {
  switch (mimeType) {
    case 'application/pdf':
      return 'PDF'
    case 'image/png':
      return 'PNG'
    case 'image/gif':
      return 'GIF'
    case 'image/jpg':
    case 'image/jpeg':
      return 'JPEG'
    case 'text/plain':
      return 'TXT'
    case 'application/msword':
      return 'DOC'
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return 'DOCX'
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      return 'XLSX'
    default:
      return '-'
  }
}

export const isImageFileType = (mimeType?: string) => {
  const validImageTypes = ['image/png', 'image/gif', 'image/jpeg', 'image/jpg']
  return !!mimeType && validImageTypes.includes(mimeType)
}

/**
 * Normalizes a string by removing umlauts, special characters, and converting to underscore-separated format
 */
function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
}

const VEREINBARUNG_FOLDER_PATH = 'Vereinbarungen/Unterschrieben'

/**
 * Recursively searches through folder structure to find nodes with matching titles
 */
function searchNodes(
  content: FolderItem[],
  normalizedSearchTitle: string,
  filterForSigned = true
): FolderItem[] {
  const results: FolderItem[] = []

  for (const node of content) {
    // Check if current node's title matches
    const normalizedNodeTitle = normalizeTitle(node.title)
    const isSigned = filterForSigned
      ? node.path.includes(VEREINBARUNG_FOLDER_PATH)
      : true
    if (normalizedNodeTitle.includes(normalizedSearchTitle) && isSigned) {
      results.push(node)
    }

    // Recursively search in content if it exists
    if (node.content && node.content.length > 0) {
      const childResults = searchNodes(node.content, normalizedSearchTitle)
      results.push(...childResults)
    }
  }

  return results
}

/**
 * Finds nodes by Vereinbarung name with normalized matching
 * @param folderStructure - The folder structure data
 * @param vereinbarungName - The name of the Vereinbarung to search for
 * @returns Array of matching nodes (can be empty if none found)
 */
export function findByVereinbarungName(
  folderStructure: TreeNode,
  vereinbarungName: string
): FolderItem[] {
  const normalizedSearchTitle = normalizeTitle(vereinbarungName)
  if (folderStructure.content) {
    return searchNodes(folderStructure.content, normalizedSearchTitle)
  }
  return []
}

/**
 * Finds the first node by Vereinbarung name (convenience method)
 * @param folderStructure - The folder structure data
 * @param vereinbarungName - The name of the Vereinbarung to search for
 * @returns First matching node or null if none found
 */
export function findFirstByVereinbarungName(
  folderStructure: FolderItem,
  vereinbarungName: string
): FolderItem | null {
  const results = findByVereinbarungName(folderStructure, vereinbarungName)

  return results.length > 0 ? results[0] : null
}
