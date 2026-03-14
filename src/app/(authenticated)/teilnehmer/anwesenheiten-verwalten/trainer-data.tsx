import { useTranslations } from 'next-intl'
import { useCallback } from 'react'

import { AbwesenheitSeminarTrainer } from './anwesenheiten-verwalten-utils'
import BadgeTw from '@/components/atoms/badge-tw'
import TooltipTw, { TooltipDirection } from '@/components/atoms/tooltip-tw'

export interface Props {
  className?: string
  trainerList?: AbwesenheitSeminarTrainer[]
}

const TrainerData = ({ trainerList }: Props) => {
  const t = useTranslations('anwesenheitenVerwalten')

  const content = useCallback(() => {
    if (!trainerList || !trainerList.length) {
      return null
    }

    return trainerList.map((trainer) => {
      return (
        <TooltipTw
          key={trainer.id}
          content={
            <div className="break-normal">
              <ul>
                <li>
                  {t('label.tooltipName')}: {trainer.name}
                </li>
                <li>
                  {t('label.tooltipTel')}: {trainer.telefon}
                </li>
                <li>
                  {t('label.tooltipEmail')}:{' '}
                  <a href={`mailto:${trainer.email}`} className="underline">
                    {trainer.email}
                  </a>
                </li>
              </ul>
            </div>
          }
          direction={TooltipDirection.Top}
        >
          <BadgeTw>{trainer.name}</BadgeTw>
        </TooltipTw>
      )
    })
  }, [trainerList])

  return <div className="flex gap-2">{content()}</div>
}

export default TrainerData
