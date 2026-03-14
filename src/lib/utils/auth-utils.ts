'use server'

import { cookies } from 'next/headers'

import { USER_COOKIE } from '../constants/session'
import { setUser } from '@/lib/utils/api-utils'

export async function executeUserSessionLogout() {
  const { NEXT_PUBLIC_GATEWAY_URL } = process.env

  try {
    await fetch(`${NEXT_PUBLIC_GATEWAY_URL}/benutzer/logout`, {
      cache: 'no-store',
    })

    const cookieStore = await cookies()
    cookieStore.getAll().forEach((cookie) => {
      if (cookie.name.startsWith(USER_COOKIE)) {
        cookieStore.delete(cookie.name)
      }
    })
  } catch (_) {
    // console.error(e)
  }
}

export async function getUserData(token?: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_GATEWAY_URL}/benutzer/get`,
      {
        method: 'GET',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    )

    const responseData = await response.json()
    if (responseData?.error) {
      throw new Error(`${responseData.error} for URL: 'benutzer/get'`)
    }

    await setUser(responseData)
  } catch (_) {
    // console.error(e)
  }
}
