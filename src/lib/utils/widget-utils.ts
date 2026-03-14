import { Layout } from 'react-grid-layout'

import { fetchGatewayRaw, toQueryString } from './gateway-utils'
import { ProjectControllingForm } from '@/components/organisms/project-controlling-table'
import { DashboardWidget } from '@/lib/interfaces/dashboardWidget'
import { WidgetStructure } from '@/lib/interfaces/widgetStructure'
import {
  formatDate,
  getEndOfWeek,
  getFirstDayOfMonth,
  getFirstDayOfNextMonth,
  getFirstDayOfYear,
  getLastDayOfMonth,
  getLastDayOfYear,
  getNextMonday,
} from '@/lib/utils/date-utils'

const otherValue = 'OTHER'

export function getFromToDate(
  form: ProjectControllingForm
): [Date | null, Date | null] {
  const dateFrom = form.from
  const dateTo = form.to
  const nextMonday = getNextMonday()

  switch (form.selectedDropDown) {
    case 'PEOT': // "Projektstart bis heute"
    case 'TDEOP': // "heute bis Projektende"
      return [new Date(), new Date()] // dedicated flag - therefore dates doesnt matter
    case otherValue:
      return [dateFrom, dateTo]
    case 'M': // "aktueller Monat"
      return [getFirstDayOfMonth(), getLastDayOfMonth()]
    case 'Y': // "aktuelles Jahr bis heute"
      return [getFirstDayOfYear(), new Date()]
    case 'TDEOY': // "heute bis Jahresende"
      return [new Date(), getLastDayOfYear()]
    case 'NXW': // "nächste Woche"
      return [nextMonday, getEndOfWeek(nextMonday)]
    case 'NNXW': // "übernächste Woche"
      return [getNextMonday(nextMonday), getEndOfWeek(nextMonday)]
    case 'NXM': // "nächster Monat"
      return [
        getFirstDayOfNextMonth(),
        getLastDayOfMonth(getFirstDayOfNextMonth()),
      ]
    case 'NNXM': // "übernächster Monat"
      return [
        getFirstDayOfNextMonth(getFirstDayOfNextMonth()),
        getLastDayOfMonth(getFirstDayOfNextMonth(getFirstDayOfNextMonth())),
      ]
    case 'MTD': // "Monatsanfang bis heute"
      return [getFirstDayOfMonth(new Date()), new Date()]
    default:
      return [null, null]
  }
}

export async function getProjectData(
  projectNumber: number,
  from: Date,
  to: Date,
  isProjectStartToToday: boolean = false,
  isTodayToProjectEnd: boolean = false
) {
  return fetchGatewayRaw(
    `/widget/controlling/getRevenueForProject${toQueryString({
      projectNumber,
      isProjectStartToToday: isProjectStartToToday,
      isTodayToProjectEnd: isTodayToProjectEnd,
      bis: formatDate(to),
      von: formatDate(from),
    })}`
  ).then((res) => res.json())
}

export async function getProjectForecast(projectNumber: number) {
  return fetchGatewayRaw(
    `/widget/controlling/getForecastForProject${toQueryString({
      projectNumber,
    })}`
  ).then((res) => res.json())
}

export function createLayout(
  widget: DashboardWidget,
  widgetConfig: WidgetStructure
): Layout {
  return {
    i: widget.id.toString(),
    x: widget.positionX,
    y: widget.positionY,
    w: widgetConfig.width,
    h: widgetConfig.height,
  }
}
export async function getWidgetData<T>(widgetId: number) {
  return fetchGatewayRaw(
    `/widget/getMeinePersoenlichenDaten${toQueryString({
      widgetId,
    })}`
  ).then((res) => res.json())
}

export async function getMeineSeminareData<T>() {
  return fetchGatewayRaw(`/widget/getMeineSeminare`).then((res) => res.json())
}

export async function getFehlerhafteTeilnehmerData(date: string) {
  return fetchGatewayRaw(
    `/widget/getFehlerhafteTeilnehmer${toQueryString({
      date,
    })}`
  ).then((res) => res.json())
}

export async function getAllProjects(
  isActive: boolean,
  isFuture: boolean = false
) {
  return fetchGatewayRaw(
    `/widget/controlling/getProjectsForUser${toQueryString({
      isActive,
      isInTheFuture: isFuture,
    })}`
  ).then((res) => res.json())
}

export const WIDGET_DATA = [
  {
    id: '1',
    title: 'Meine Seminare',
    description: 'Seminare',
    imagePath: 'image_url',
    width: 8,
    height: 3,
  },
  {
    id: '2',
    title: 'Eingelesene Teilnehmerdaten',
    description: 'Eingelesene Teilnehmerdaten',
    imagePath: 'image_url',
    width: 10,
    height: 3,
  },
  {
    id: '3',
    title: 'Meine persönlichen Daten',
    description: 'Mein Vertrag und meine Laufbahn.',
    imagePath: 'image_url',
    width: 10,
    height: 4,
  },
  {
    id: '4',
    title: 'Project Controlling',
    description: 'Projekte und Hochrechnungen.',
    imagePath: 'image_url',
    width: 5,
    height: 5,
  },
]
