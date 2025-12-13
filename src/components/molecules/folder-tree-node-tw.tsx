import { FolderIcon, FolderOpenIcon } from '@heroicons/react/20/solid'
import { ChevronRightIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import dayjs from 'dayjs'
import React, { useEffect, useState } from 'react'
import { twMerge } from 'tailwind-merge'

import {
  FileItem,
  getFileTypeFromMime,
  TreeNode,
} from '@/lib/utils/personalakt-utils'

interface TreeNodeProps {
  node: TreeNode
  openFileInModal: (item: FileItem) => void
  openOverride: boolean | null
  setOpenOverride: React.Dispatch<React.SetStateAction<boolean | null>>
  depth: number
}

const FolderTreeNodeTw: React.FC<TreeNodeProps> = ({
  node,
  openFileInModal,
  openOverride,
  setOpenOverride,
  depth,
}) => {
  const [isOpen, setIsOpen] = useState(openOverride)

  useEffect(() => {
    if (openOverride !== null) {
      setIsOpen(openOverride)
    }
  }, [openOverride])

  const isFolder = (item: TreeNode) => !item.mimeType
  const isFile = (item: TreeNode) => item.mimeType

  const toggleFolder = () => {
    if (isFolder(node)) {
      setIsOpen((prev) => !prev)
      setOpenOverride(null)
    }
  }

  return (
    <>
      <div
        className={twMerge(
          'flex cursor-pointer items-center even:bg-gray-50 hover:bg-blue-100'
        )}
        style={{ paddingLeft: `${depth * 2}rem` }}
        onClick={() => toggleFolder()}
      >
        <div className="px-4 py-2 pr-0">
          {isFolder(node) ? (
            <span>
              <div className="flex">
                <ChevronRightIcon
                  aria-hidden="true"
                  className={twMerge(
                    'mr-1 h-6 w-6 shrink-0 p-1 text-gray-400',
                    isOpen && 'rotate-90 text-gray-500'
                  )}
                />
                {isOpen ? (
                  <FolderOpenIcon className="text-ibis-yellow-light h-6 w-6" />
                ) : (
                  <FolderIcon className="text-ibis-yellow-light h-6 w-6" />
                )}
              </div>
            </span>
          ) : (
            <span className="flex items-center">
              <DocumentTextIcon className="text-ibis-gray-dark h-6 w-6" />
            </span>
          )}
        </div>
        <div
          className="flex-1 p-4 text-gray-700"
          onClick={() => isFile(node) && openFileInModal(node as FileItem)}
        >
          {node.title}
        </div>
        <div className="w-48 p-4 text-gray-700">{`${dayjs(node.createdAt).format('DD.MM.YYYY, HH:mm')}`}</div>
        <div className="w-32 p-4 text-gray-700">
          {node?.mimeType && isFile(node)
            ? getFileTypeFromMime(node.mimeType)
            : '-'}
        </div>
      </div>
      {isFolder(node) &&
        isOpen &&
        node.content &&
        node.content.map((child) => (
          <FolderTreeNodeTw
            key={child.id}
            node={child}
            openFileInModal={openFileInModal}
            openOverride={openOverride}
            setOpenOverride={setOpenOverride}
            depth={depth + 1}
          />
        ))}
    </>
  )
}

export default FolderTreeNodeTw
