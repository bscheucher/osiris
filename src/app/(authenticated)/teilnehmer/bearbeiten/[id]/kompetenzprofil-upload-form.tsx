import { yupResolver } from '@hookform/resolvers/yup'
import { useTranslations } from 'next-intl'
import React, { useMemo, useState } from 'react'
import { Resolver, useForm } from 'react-hook-form'
import * as yup from 'yup'

import ButtonTw from '@/components/atoms/button-tw'
import InputFileSimpleTw from '@/components/atoms/input-file-simple-tw'
import ProgressBarTw from '@/components/atoms/progress-bar-tw'
import InfoSectionTw from '@/components/molecules/info-section-tw'
import { Teilnehmer } from '@/lib/interfaces/teilnehmer'
import { executePOST } from '@/lib/utils/gateway-utils'
import { showError, showSuccess } from '@/lib/utils/toast-utils'

export const createkompetenzprofilSchema = (t: (key: string) => string) =>
  yup.object({
    kompetenzprofilFile: yup
      .mixed<FileList>()
      .test(
        'required',
        t('required.kompetenzprofil.text'),
        (file) => file && file.length > 0
      ),
  })

type KompetenzprofilFormValues = {
  kompetenzprofilFile: FileList
}

interface Props {
  participant: Teilnehmer
  setParticipant: React.Dispatch<React.SetStateAction<Teilnehmer | null>>
  isReadOnly: boolean
  teilnehmerId: number
}

const KompetenzprofilUploadForm = ({
  isReadOnly,
  teilnehmerId,
  participant,
  setParticipant,
}: Props) => {
  const t = useTranslations('teilnehmer.bearbeiten')
  const [showProgressbar, setShowProgressbar] = useState<boolean>(false)

  const kompetenzprofilSchema = useMemo(
    () => createkompetenzprofilSchema(t),
    [t]
  )

  const { register, handleSubmit, control } =
    useForm<KompetenzprofilFormValues>({
      resolver: yupResolver(
        kompetenzprofilSchema
      ) as Resolver<KompetenzprofilFormValues>,
    })

  const formHandler = async (data: KompetenzprofilFormValues) => {
    if (!data?.kompetenzprofilFile || !data?.kompetenzprofilFile.length) {
      return
    }

    setShowProgressbar(true)
    const selectedFile = data?.kompetenzprofilFile[0]

    try {
      const { data } = await executePOST<{
        teilnehmerSeminars: Array<{ teilnehmerDto: Teilnehmer }>
      }>(`/teilnehmer/postKompetenzenUebersicht/${teilnehmerId}`, selectedFile)

      if (data?.teilnehmerSeminars[0].teilnehmerDto) {
        setParticipant(data.teilnehmerSeminars[0].teilnehmerDto)
        showSuccess(t('success.bisUpload'))
      }
    } catch (error) {
      showError(t('error.bisUpload'))
    } finally {
      setShowProgressbar(false)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit(formHandler)}>
        <h3 className="mb-5 text-base leading-7 font-semibold text-gray-900">
          {t('section.kompetenzprofil')}
        </h3>
        {showProgressbar ? (
          <ProgressBarTw />
        ) : (
          <>
            {participant?.hasBisDocument && (
              <InfoSectionTw
                description={t('text.kompetenzprofilBereitsHochgeladen')}
                className="my-5"
              />
            )}
            <div className="flex gap-4">
              <div className="flex-1">
                <InputFileSimpleTw
                  disabled={isReadOnly}
                  placeholder={t('placeholder.kompetenzprofil')}
                  control={control}
                  schema={kompetenzprofilSchema}
                  {...register('kompetenzprofilFile')}
                />
              </div>
              <ButtonTw
                type="submit"
                className="mt-2 h-10 px-4 whitespace-nowrap"
              >
                {t('button.bisHochladen')}
              </ButtonTw>
            </div>
          </>
        )}
      </form>
    </>
  )
}

export default KompetenzprofilUploadForm
