import { fetchGatewayRaw } from './gateway-utils'
import {
  DashboardData,
  SaveDashboardsRequest,
} from '@/lib/interfaces/dashboardsData'
import { DashboardWidget } from '@/lib/interfaces/dashboardWidget'

export function createSaveDashboardRequest(
  dashboardName: string,
  widgets: DashboardWidget[],
  isFavourite: boolean,
  dashboardId?: number
): SaveDashboardsRequest {
  return {
    dashboardId,
    dashboardName,
    widgets,
    isFavourite,
  }
}

export async function getAllDashboards() {
  const res = await fetchGatewayRaw('/dashboards/get')

  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(
      `Failed to get dashboards: ${res.status} - ${errorText}`
    )
  }

  return res.json()
}

export async function saveDashboardData(data: DashboardData) {
  const res = await fetchGatewayRaw('/dashboards/save', {
    method: 'POST',
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(
      `Failed to save dashboard: ${res.status} - ${errorText}`
    )
  }

  return res.json()
}

export async function setFavouriteDashboard(id: number) {
  const res = await fetchGatewayRaw(
    `/dashboards/favouriteDashboard?dashboardId=${id}`,
    {
      method: 'POST',
    }
  )

  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(
      `Failed to set favourite dashboard: ${res.status} - ${errorText}`
    )
  }

  return res.json()
}

export async function deleteDashboardData(id: number) {
  const res = await fetchGatewayRaw(`/dashboards/delete?dashboardId=${id}`, {
    method: 'DELETE',
  })

  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(
      `Failed to delete dashboard: ${res.status} - ${errorText}`
    )
  }

  return res.json()
}
