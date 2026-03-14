import { ROLE } from '@/lib/constants/role-constants'
export interface User {
  firstName: string
  lastName: string
  email: string
  azureId: string
  roles: ROLE[]
}
