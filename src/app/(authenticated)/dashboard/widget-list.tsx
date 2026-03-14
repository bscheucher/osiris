import { useTranslations } from 'next-intl'
import { Dispatch, SetStateAction } from 'react'
import { Layout } from 'react-grid-layout'

import { ROLE } from '@/lib/constants/role-constants'
import { Widget } from '@/lib/types/types'
import useUserStore from '@/stores/user-store'
import {
  AdjustmentsHorizontalIcon,
  BookOpenIcon,
  CircleStackIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'

const getIconByWidgetId = (id: string) => {
  switch (id) {
    case '1':
      return <BookOpenIcon className="size-5" />
    case '2':
      return <UserGroupIcon className="size-5" />
    case '3':
      return <CircleStackIcon className="size-5" />
    case '4':
      return <AdjustmentsHorizontalIcon className="size-5" />
    default:
      return null
  }
}

export default function WidgetList({
  widgets,
  layout,
  setDraggedWidget,
}: {
  widgets: Widget[]
  layout: Layout[]
  setDraggedWidget: Dispatch<SetStateAction<Widget | undefined>>
}) {
  const t = useTranslations('dashboard')

  const { roles, hasSomeRole } = useUserStore()

  const filteredWidgets = widgets
    .filter((widget) => !layout.map((item) => item.i).includes(widget.id))
    .filter((widget) => {
      if (!roles) return false

      if (widget.title === 'Project Controlling') {
        return hasSomeRole([ROLE.PK, ROLE.CFO])
      }
      if (widget.title === 'Meine Seminare') {
        return hasSomeRole([ROLE.MEINE_SEMINARE])
      }
      if (widget.title === 'Meine persönlichen Daten') {
        return hasSomeRole([ROLE.MEINE_DATEN])
      }
      if (widget.title === 'Eingelesene Teilnehmerdaten') {
        return hasSomeRole([ROLE.TEILNEHMER_DATEN_KORRIGIEREN])
      }
      return true
    })

  return (
    <aside className="z-50 flex w-96 flex-col">
      <h3 className="py-4 text-xl">{t('widget.hinzufuegen')}</h3>
      <ul>
        {filteredWidgets.map((widget) => (
          <WidgetListItem
            key={widget.id}
            widget={widget}
            setDraggedWidget={setDraggedWidget}
          />
        ))}
      </ul>
    </aside>
  )
}

function WidgetListItem({
  widget,
  setDraggedWidget,
}: {
  widget: Widget
  setDraggedWidget: Dispatch<SetStateAction<Widget | undefined>>
}) {
  return (
    <li
      className="droppable-element mb-4 flex h-32 cursor-pointer items-center gap-5 rounded-md border border-gray-200 bg-white px-4"
      draggable={true}
      unselectable="on"
      onDragStart={() => setDraggedWidget(widget)}
    >
      {getIconByWidgetId(widget.id)}
      <article>
        <h4 className="text-xl font-bold">{widget.title}</h4>
        <p>{widget.description}</p>
      </article>
    </li>
  )
}
