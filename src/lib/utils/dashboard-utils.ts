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

  try {
    return await res.json()
  } catch (e) {
    console.error('Failed to parse getAllDashboards response as JSON:', e)
    throw new Error('Invalid JSON response from server')
  }
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

  // Try to parse JSON, but don't fail if it's not JSON
  const contentType = res.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    try {
      return await res.json()
    } catch (e) {
      console.warn('Failed to parse JSON response, but save was successful')
    }
  }

  // If no JSON content or parsing failed, just return success
  return { success: true }
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

  // Try to parse JSON, but don't fail if it's not JSON
  const contentType = res.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    try {
      return await res.json()
    } catch (e) {
      console.warn('Failed to parse JSON response, but request was successful')
    }
  }

  // If no JSON content or parsing failed, just return success
  return { success: true }
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

  // Try to parse JSON, but don't fail if it's not JSON
  const contentType = res.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    try {
      return await res.json()
    } catch (e) {
      console.warn('Failed to parse JSON response, but deletion was successful')
    }
  }

  // If no JSON content or parsing failed, just return success
  return { success: true }
}
