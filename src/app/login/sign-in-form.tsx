'use client'

import { useMsal } from '@azure/msal-react'
import React, { useState } from 'react'

import ButtonTw, { ButtonSize } from '@/components/atoms/button-tw'
import { loginRequest } from '@/lib/config/msal-config'
import { showError } from '@/lib/utils/toast-utils'

export const SignInForm = () => {
  const { instance } = useMsal()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Use redirect login for full-page navigation
      await instance.loginRedirect({
        ...loginRequest,
        redirectStartPage: '/dashboard',
      })
    } catch (error) {
      console.error('Login error:', error)
      showError('An error occurred during sign in.')
      setLoading(false)
    }
  }

  return (
    <form className="flex justify-center" onSubmit={handleSubmit}>
      <ButtonTw type="submit" size={ButtonSize.XLarge} testId="login-button">
        {loading ? 'Sie werden weitergeleitet...' : 'Mit Azure SSO einloggen'}
      </ButtonTw>
    </form>
  )
}
