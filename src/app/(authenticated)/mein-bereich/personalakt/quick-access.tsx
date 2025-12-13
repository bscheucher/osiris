'use client'

import { DocumentTextIcon } from '@heroicons/react/24/outline'
import dayjs from 'dayjs'
import { useTranslations } from 'next-intl'
import React from 'react'

import GridListTw from '@/components/molecules/grid-list-tw'
import {
  FileItem,
  FolderItem,
  getFileTypeFromMime,
  TreeNode,
} from '@/lib/utils/personalakt-utils'

interface QuickAccessProps {
  fileList: FolderItem[]
  openFileInModal: (item: FileItem) => void
}

const flattenTree = (items: TreeNode[]): TreeNode[] =>
  items.flatMap((item) => [
    item,
    ...(item?.content ? flattenTree(item.content) : []),
  ])

const QuickAccess: React.FC<QuickAccessProps> = ({
  fileList,
  openFileInModal,
}) => {
  const t = useTranslations('personalakt')

  const getFileById = (id: string): TreeNode | null =>
    flattenTree(fileList).find((item) => item.id === id) ?? null

  const getQuickAccessItems = (folders: FolderItem[], size: number = 4) => {
    const files = flattenTree(folders)
      .filter((item) => !!item.mimeType)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, size)
      .map((item) => ({
        id: item.id,
        title: item.title,
        description: `${dayjs(item.createdAt).format('DD.MM.YYYY, HH:mm')} • ${getFileTypeFromMime(item.mimeType)}`,
        icon: <DocumentTextIcon className="text-ibis-blue h-10 w-10" />,
        selected: false,
      }))

    return files
  }

  const openFileInModalById = (selectedId: string) => {
    const selectedFile = getFileById(selectedId)
    if (selectedFile?.mimeType) {
      openFileInModal(selectedFile as FileItem)
    }
  }

  return (
    <div className="border-b border-gray-900/10 pb-12">
      <h3 className="mb-5 text-base leading-7 font-semibold text-gray-900">
        {t('section.schnellZugriff')}
      </h3>
      <GridListTw
        testId="personalakt-file-gridList"
        items={getQuickAccessItems(fileList)}
        onSelect={openFileInModalById}
      />
    </div>
  )
}

export default QuickAccess
