'use client'

import { signIn } from 'next-auth/react'
import React, { useState } from 'react'

import ButtonTw, { ButtonSize } from '@/components/atoms/button-tw'
import { showError } from '@/lib/utils/toast-utils'

export const SignInForm = () => {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await signIn('azure-ad', {
        callbackUrl: '/dashboard',
      })
    } catch (__) {
      showError('An error occurred during sign in.')
    } finally {
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
