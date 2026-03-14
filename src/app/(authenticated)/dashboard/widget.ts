import { ComponentType } from 'react'

import EingeleseneTeilnehmerdaten from '@/components/widgets/eingelesene-teilnehmerdaten'
import MeinePersoenlichenDaten from '@/components/widgets/meine-persoenlichen-daten'
import MeineSeminare from '@/components/widgets/meine-seminare'
import ProjectControlling from '@/components/widgets/project-controlling'
import { Widget } from '@/lib/types/types'

export const widgetComponents: Record<Widget['id'], ComponentType> = {
  1: MeineSeminare,
  2: EingeleseneTeilnehmerdaten,
  3: MeinePersoenlichenDaten,
  4: ProjectControlling,
}
