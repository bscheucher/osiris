'use client'

import { useTranslations } from 'next-intl'
import React, { useState } from 'react'

import HorizontalRow from '../atoms/hr-tw'
import ButtonTw, { ButtonSize } from '@/components/atoms/button-tw'
import { DefaultModal } from '@/components/organisms/default-modal'
import { executePOST, toQueryString } from '@/lib/utils/gateway-utils'
import {
  showError,
  showErrorMessage,
  showSuccess,
} from '@/lib/utils/toast-utils'

export interface PlzOrtValues {
  plz?: string | number
  ort?: string
}

interface Props {
  plzOrtData: PlzOrtValues
  showModal: boolean
  closeModal: () => void
}

export default function PlzOrtModal({
  plzOrtData,
  showModal,
  closeModal,
}: Props) {
  const t = useTranslations('mitarbeiter.erfassen.stammdaten')
  const [isLoading, setIsLoading] = useState(false)
  const isDisabled = !plzOrtData.ort || !plzOrtData.plz

  const savePlzOrt = async () => {
    if (isDisabled) {
      return
    }

    setIsLoading(true)
    try {
      const response = await executePOST(
        `/plz/savePlzAndOrtRelation${toQueryString({
          plz: `${plzOrtData.plz}`,
          ort: plzOrtData.ort,
        })}`
      )

      if (response.success) {
        showSuccess(t('plzOrt.message.success'))
      } else {
        showError(t('plzOrt.message.error'))
      }
    } catch (e) {
      showErrorMessage(e)
    } finally {
      closeModal()
    }
    setIsLoading(false)
  }

  return (
    <DefaultModal
      showModal={showModal}
      closeModal={closeModal}
      modalSize="2xl"
      testId="plzOrt-form-modal"
    >
      <div className="space-y-6">
        <div className="mb-6 flex content-center items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-800">
            {t('plzOrt.title')}
          </h3>
        </div>
        <div>
          <div className="mt-4 text-gray-600">
            <div className="space-y-4">
              <div
                dangerouslySetInnerHTML={{
                  __html: t.markup('plzOrt.text', {
                    strong: (chunks) => `<b>${chunks}</b>`,
                    plz: plzOrtData.plz,
                    ort: plzOrtData.ort,
                  }),
                }}
              />
            </div>
          </div>
        </div>
        <HorizontalRow />

        <div className="col-span-12 flex justify-between">
          <ButtonTw
            className="h-full"
            size={ButtonSize.Large}
            secondary
            disabled={isLoading}
            isLoading={isLoading}
            onClick={() => closeModal()}
            testId="plzOrt-cancel-button"
          >
            {t('plzOrt.cancel')}
          </ButtonTw>
          <ButtonTw
            className="h-full"
            size={ButtonSize.Large}
            disabled={isDisabled}
            isLoading={isLoading}
            testId="plzOrt-save-button"
            onClick={savePlzOrt}
          >
            {t('plzOrt.save')}
          </ButtonTw>
        </div>
      </div>
    </DefaultModal>
  )
}
