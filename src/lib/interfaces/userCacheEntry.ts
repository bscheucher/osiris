import { UserDetailsDto } from '@/lib/interfaces/dtos'

export interface UserCacheEntry {
  userDetails: UserDetailsDto
  timestamp: number
}
