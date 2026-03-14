import { UserCacheEntry } from '@/lib/interfaces/userCacheEntry'

export type InputType =
  | 'text'
  | 'number'
  | 'password'
  | 'search'
  | 'date'
  | 'email'
  | 'file'

export type RequestType =
  | 'widgetData'
  | 'saveDashboard'
  | 'deleteDashboard'
  | 'favouriteDashboard'

export type Select = 'select'

export type UserDetailsCache = Record<string, UserCacheEntry>

export type Widget = {
  id: string
  title: string
  description: string
  imagePath: string
  height: number
  width: number
}

export type EditValue = string | number | Date | number[] | boolean

export type FieldType = InputType | Select | 'checkbox' | 'dateRange'
