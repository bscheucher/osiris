import { DashboardWidget } from '@/lib/interfaces/dashboardWidget'

export interface SaveDashboardsRequest extends DashboardData {
  isFavourite: boolean
}

export interface DashboardResponse {
  dashboards: DashboardData[]
  favouriteDashboard: number
}

export interface DashboardData {
  dashboardId?: number
  dashboardName: string
  widgets: DashboardWidget[]
}
