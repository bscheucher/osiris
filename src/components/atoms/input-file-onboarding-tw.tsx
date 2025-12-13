import { DocumentTextIcon } from '@heroicons/react/20/solid'
import {
  ArrowDownTrayIcon,
  ArrowsPointingOutIcon,
} from '@heroicons/react/24/outline'
import { useTranslations } from 'next-intl'
import React, { SyntheticEvent, useRef, useState } from 'react'
import { Control, useController, UseFormRegisterReturn } from 'react-hook-form'
import { twMerge } from 'tailwind-merge'
import { ObjectSchema } from 'yup'

import ButtonTw from './button-tw'
import FileModal from '../molecules/file-modal'
import {
  FileStatus,
  formFieldToUploadTypeMap,
} from '@/lib/constants/mitarbeiter-constants'
import { getFormLabel } from '@/lib/utils/form-utils'
import {
  executeFileDownload,
  executeFileUpload,
} from '@/lib/utils/gateway-utils'
import {
  showError,
  showErrorMessage,
  showSuccess,
} from '@/lib/utils/toast-utils'

export interface InputProps extends Partial<UseFormRegisterReturn> {
  control: Control<any, any>
  personalnummer: string
  id?: string
  type?: string
  name: string
  label?: string
  placeholder?: string
  disabled?: boolean
  schema?: ObjectSchema<any>
  className?: string
  testId?: string
  // helper method to pass selected file to parent
  onFileSelect?: (file: File | null) => void
  preventAutoUpload?: boolean
  hideButtons?: boolean
}

const InputFileOnbaordingTw: React.FC<InputProps> = ({
  control,
  id,
  name,
  label,
  placeholder,
  personalnummer,
  disabled,
  schema,
  required,
  testId,
  onFileSelect,
  preventAutoUpload,
  hideButtons,
}) => {
  const t = useTranslations('components.fileUpload')
  const [showModal, setShowModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [displayFileName, setDisplayFileName] = useState<string>('')
  const inputRef = useRef<HTMLInputElement>(null)
  const uploadType = formFieldToUploadTypeMap.get(name)

  const { field, fieldState } = useController({
    name,
    control,
  })

  const showFile =
    isLoading ||
    field.value === FileStatus.NOT_VERIFIED ||
    field.value === FileStatus.VERIFIED

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    event.preventDefault()

    const file = event.target.files?.[0]

    if (file) {
      if (!preventAutoUpload) {
        await handleUpload(file)
      }

      // Save the filename for display
      setDisplayFileName(file.name)

      // custom file handling requires passing the value to the parent
      if (onFileSelect) {
        onFileSelect(file)
      }
    }
  }

  const handleUpload = async (selectedFile: File) => {
    if (!selectedFile || !uploadType) return

    // check if file is larger than 10MB
    if (selectedFile.size > 10 * 1024 * 1024) {
      showError(t('label.errorSize'))

      return
    }

    setIsLoading(true)

    try {
      const response = await executeFileUpload(
        selectedFile,
        uploadType,
        personalnummer
      )

      if (!response) {
        throw new Error(t('label.errorUpload'))
      } else {
        // Set the field value to NOT_VERIFIED after successful upload
        field.onChange(FileStatus.NOT_VERIFIED)

        // Clear the file input
        if (inputRef.current) {
          inputRef.current.value = ''
        }
      }

      // Show success message
      showSuccess(t('label.successUpload', { filename: selectedFile.name }))
    } catch (error) {
      showErrorMessage(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = async (event?: SyntheticEvent) => {
    event?.preventDefault()

    setIsLoading(true)
    try {
      await executeFileDownload(name, personalnummer)
    } catch (error) {
      showErrorMessage(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {label && (
        <label
          htmlFor={id || name}
          className="block text-sm leading-6 font-medium text-gray-900"
          data-testid={`${testId || name}-label`}
        >
          {getFormLabel(name, label, schema, required)}
        </label>
      )}

      {showFile && (
        <div
          className={twMerge(
            `focus:ring-ibis-blue mt-2 flex h-10 w-full items-center justify-between rounded-md border-0 p-1 text-sm text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-5`,
            fieldState.error ? 'ring-2 ring-red-500' : 'ring-gray-300',
            disabled && 'cursor-not-allowed bg-gray-100 text-gray-700'
          )}
        >
          <div
            className={twMerge(
              'flex flex-auto items-center gap-2 overflow-hidden p-2',
              disabled ? 'cursor-not-allowed' : 'cursor-pointer'
            )}
            onClick={() => {
              inputRef.current?.click()
            }}
          >
            <DocumentTextIcon
              className={twMerge(
                'size-5 flex-[0_0_auto]',
                disabled ? 'text-gray-500' : 'text-ibis-blue'
              )}
            />{' '}
            <span className="truncate" data-testid={`${name}-filename`}>
              {displayFileName || label}
            </span>
          </div>
          {!hideButtons && (
            <div className="flex gap-1">
              <ButtonTw
                onClick={() => {
                  setShowModal(true)
                }}
                title={t('label.vorschau')}
                secondary
                className="flex h-8 w-10 items-center justify-center rounded-sm p-0"
                testId={`${name}-preview-button`}
              >
                <ArrowsPointingOutIcon className="size-4" />
              </ButtonTw>
              <ButtonTw
                onClick={handleDownload}
                isLoading={isLoading}
                title={t('label.herunterladen')}
                className="bg-ibis-emerald flex h-8 w-10 items-center justify-center rounded-sm p-0 ring-emerald-600 hover:bg-emerald-500"
                testId={`${name}-download-button`}
              >
                <ArrowDownTrayIcon className="size-4" />
              </ButtonTw>
            </div>
          )}
        </div>
      )}

      <input
        type="file"
        ref={inputRef}
        name={name}
        id={id}
        autoComplete="off"
        disabled={disabled}
        placeholder={placeholder}
        className={twMerge(
          `focus:ring-ibis-blue mt-2 block h-10 w-full rounded-md border-0 pr-4 text-sm text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-700 sm:text-sm sm:leading-5`,
          fieldState.error ? 'ring-2 ring-red-500' : 'ring-gray-300',
          showFile && 'hidden'
        )}
        onChange={(e) => handleFileSelect(e)}
        data-testid={testId || name}
      />

      {fieldState.error && (
        <p
          className="mt-2 text-red-500"
          data-testid={`${testId || name}-error`}
        >
          {fieldState.error.message}
        </p>
      )}
      <FileModal
        title={displayFileName || label || ''}
        downloadUrl={`/file/download?type=${uploadType}&identifier=${personalnummer}`}
        mimeType={'image/png'}
        showModal={showModal}
        closeModal={() => {
          setShowModal(false)
        }}
      />
    </>
  )
}

InputFileOnbaordingTw.displayName = 'InputFileOnbaordingTw'

export default InputFileOnbaordingTw
