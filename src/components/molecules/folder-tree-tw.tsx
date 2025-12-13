import { useTranslations } from 'next-intl'
import React from 'react'

import FolderTreeNodeTw from './folder-tree-node-tw'
import { FileItem, FolderItem } from '@/lib/utils/personalakt-utils'

interface FolderTreeProps {
  data: FolderItem[]
  openOverride: boolean | null
  setOpenOverride: React.Dispatch<React.SetStateAction<boolean | null>>
  openFileInModal: (item: FileItem) => void
}

const FolderTreeTw: React.FC<FolderTreeProps> = ({
  data,
  openFileInModal,
  openOverride,
  setOpenOverride,
}) => {
  const t = useTranslations('components.folderTree')

  return (
    <div className="overflow-x-auto rounded-md border border-gray-300 shadow">
      <div className="inline-block min-w-full">
        <div className="flex border-b border-gray-200 bg-gray-100 text-left">
          <div className="flex-1 px-4 py-3 pl-8 font-bold text-gray-700">
            {t('label.name')}
          </div>
          <div className="w-48 px-4 py-3 font-bold text-gray-700">
            {t('label.erstelltAm')}
          </div>
          <div className="w-32 px-4 py-3 font-bold text-gray-700">
            {t('label.dateiTyp')}
          </div>
        </div>

        {data.map((item) => (
          <FolderTreeNodeTw
            key={item.id}
            node={item}
            openFileInModal={openFileInModal}
            openOverride={openOverride}
            setOpenOverride={setOpenOverride}
            depth={0}
          />
        ))}
      </div>
    </div>
  )
}

export default FolderTreeTw
