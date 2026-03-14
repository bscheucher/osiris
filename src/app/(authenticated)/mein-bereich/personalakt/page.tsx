'use client'

import { FolderMinusIcon, FolderPlusIcon } from '@heroicons/react/24/outline'
import { useTranslations } from 'next-intl'
import React, { useState } from 'react'

import QuickAccess from './quick-access'
import ButtonTw from '@/components/atoms/button-tw'
import LoaderTw, { LoaderSize } from '@/components/atoms/loader-tw'
import FileModal from '@/components/molecules/file-modal'
import FolderTreeTw from '@/components/molecules/folder-tree-tw'
import { LayoutWrapper } from '@/components/molecules/layout-wrapper'
import useAsyncEffect from '@/hooks/use-async-effect'
import { executeGET } from '@/lib/utils/gateway-utils'
import { FileItem, FolderItem, TreeNode } from '@/lib/utils/personalakt-utils'
import { showError } from '@/lib/utils/toast-utils'

export default function Page() {
  const t = useTranslations('personalakt')
  const [isLoading, setIsLoading] = useState(true)
  const [fileList, setFileList] = useState<FolderItem[]>([])
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
  const [showFileModal, setShowFileModal] = useState(false)
  const [openOverride, setOpenOverride] = useState<boolean | null>(null)

  useAsyncEffect(async () => {
    try {
      const { data } = await executeGET<{ folderStructure: FolderItem[] }>(
        `/file/own-folder-structure`
      )
      if (data && data.folderStructure) {
        setFileList(data.folderStructure)
      }
    } catch (error) {
      showError(t('error.laden'))
    }
    setIsLoading(false)
  }, [])

  const openFileInModal = (item: TreeNode) => {
    if (item.mimeType) {
      setSelectedFile(item as FileItem)
      setShowFileModal(true)
    }
  }

  return (
    <LayoutWrapper
      className="max-w-4xl xl:max-w-5xl 2xl:max-w-6xl"
      title={t('label')}
    >
      <>
        {!fileList.length || isLoading ? (
          <div className="flex h-[760px] items-center justify-center">
            <LoaderTw size={LoaderSize.XLarge} />
          </div>
        ) : (
          <div className="space-y-8">
            <QuickAccess
              fileList={fileList}
              openFileInModal={openFileInModal}
            />
            <div className="flex items-center justify-between">
              <h3 className="text-base leading-7 font-semibold text-gray-900">
                {t('section.alleDateien')}
              </h3>
              <div className="ml-auto flex gap-4">
                <ButtonTw
                  secondary
                  onClick={() => {
                    setOpenOverride(false)
                  }}
                  className="flex h-10 items-center gap-2"
                >
                  <FolderMinusIcon className="flex h-5 w-5" />
                  {t('button.closeAll')}
                </ButtonTw>
                <ButtonTw
                  secondary
                  onClick={() => {
                    setOpenOverride(true)
                  }}
                  className="flex h-10 items-center gap-2"
                >
                  <FolderPlusIcon className="flex h-5 w-5" />
                  {t('button.openAll')}
                </ButtonTw>
              </div>
            </div>
            <FolderTreeTw
              data={fileList}
              openFileInModal={openFileInModal}
              openOverride={openOverride}
              setOpenOverride={setOpenOverride}
            />
          </div>
        )}
        {selectedFile && (
          <FileModal
            showModal={showFileModal}
            closeModal={() => {
              setShowFileModal(false)
            }}
            title={selectedFile.title}
            downloadUrl={`/file/download-filename?filename=${selectedFile.title}&directoryPath=${selectedFile.path}`}
            mimeType={selectedFile.mimeType}
          />
        )}
      </>
    </LayoutWrapper>
  )
}
