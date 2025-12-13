'use server'

import { cookies } from 'next/headers'

import { ROLE } from '@/lib/constants/role-constants'
import { User } from '@/lib/interfaces/user'

export async function getRoles(): Promise<ROLE[]> {
  return getUser().then((a) => a?.roles ?? [])
}

export async function getCookie<T>(key: string) {
  const cookieStore = await cookies()

  const value = cookieStore.get(key)?.value
  if (!value) return undefined
  return JSON.parse(value) as T
}

export async function setCookie<T>(
  key: string,
  value: T,
  httpOnly: boolean = true
) {
  const cookieStore = await cookies()

  cookieStore.set(key, JSON.stringify(value), { httpOnly })
}

export async function getUser() {
  const userData = await getCookie<User>('user')

  if (userData) {
    const userRoles = userData.roles || []
    const roleOverride = process.env.NEXT_PUBLIC_DEBUG_ROLE_OVERRIDE
      ? process.env.NEXT_PUBLIC_DEBUG_ROLE_OVERRIDE.split(',')
      : []
    // remove duplicates
    const uniqueRoles = Array.from(
      new Set([...userRoles, ...roleOverride])
    ) as unknown as ROLE[]

    userData.roles = uniqueRoles
  }

  return userData
}

export async function setUser(user: User) {
  setCookie<User>('user', user)
}

export const waitFor = async (timeout: number) =>
  await new Promise((resolve) => setTimeout(resolve, timeout))
