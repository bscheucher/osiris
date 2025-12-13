import { create } from 'zustand'

import { ROLE } from '@/lib/constants/role-constants'
import { getUser } from '@/lib/utils/api-utils'

export const hasUserSomeRole = (
  rolesToCheck: ROLE | ROLE[],
  userRoles: ROLE[] | null
) => {
  if (!userRoles) return false

  if (Array.isArray(rolesToCheck)) {
    return rolesToCheck.some((role) => userRoles.includes(role))
  }

  return userRoles.includes(rolesToCheck)
}

export const hasUserEveryRole = (
  rolesToCheck: ROLE | ROLE[],
  userRoles: ROLE[] | null
) => {
  if (!userRoles) return false

  if (Array.isArray(rolesToCheck)) {
    return rolesToCheck.every((role) => userRoles.includes(role))
  }

  return userRoles.includes(rolesToCheck)
}

interface UserStore {
  user: {
    firstName: string
    lastName: string
    fullName: string
  } | null
  roles: ROLE[] | null
  fetchUser: () => void
  hasEveryRole: (rolesToCheck: ROLE | ROLE[]) => boolean
  hasSomeRole: (rolesToCheck: ROLE | ROLE[]) => boolean
}

const useUserStore = create<UserStore>((set, get) => ({
  user: null,
  roles: null,

  fetchUser: async () => {
    const user = await getUser()

    if (user) {
      const roles = process.env.NEXT_PUBLIC_DEBUG_ROLE_OVERRIDE
        ? (process.env.NEXT_PUBLIC_DEBUG_ROLE_OVERRIDE.split(',').map((role) =>
            role.trim()
          ) as ROLE[])
        : user.roles || []

      set({
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: `${user.firstName} ${user.lastName}`,
        },
        roles,
      })
    }
  },

  hasSomeRole: (rolesToCheck: ROLE | ROLE[]) =>
    hasUserSomeRole(rolesToCheck, get().roles),

  hasEveryRole: (rolesToCheck: ROLE | ROLE[]) =>
    hasUserEveryRole(rolesToCheck, get().roles),
}))

export default useUserStore
