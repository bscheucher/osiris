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
  return fetchGatewayRaw('/dashboards/get').then((res) => res.json())
}

export async function saveDashboardData(data: DashboardData) {
  return fetchGatewayRaw('/dashboards/save', {
    method: 'POST',
    body: JSON.stringify(data),
  }).then((res) => res.json())
}

export async function setFavouriteDashboard(id: number) {
  return fetchGatewayRaw(`/dashboards/favouriteDashboard?dashboardId=${id}`, {
    method: 'POST',
  }).then((res) => res.json())
}

export async function deleteDashboardData(id: number) {
  return fetchGatewayRaw(`/dashboards/delete?dashboardId=${id}`, {
    method: 'DELETE',
  }).then((res) => res.json())
}
