/* eslint-disable no-console */
import { debounce } from 'lodash'
import { ToastOptions } from 'react-hot-toast'

import { toastTw } from '@/components/organisms/toast-tw'

const recentMessages = new Set<string>()

const clearMessageAfterDelay = debounce((message: string) => {
  recentMessages.delete(message)
}, 1000)

const showToastWithUniqueBypass = (message: string, callback: () => void) => {
  const messageKey = message

  if (!recentMessages.has(messageKey)) {
    recentMessages.add(messageKey)
    callback()
    clearMessageAfterDelay(messageKey)
  }
}
export function showError(text: string, options?: Partial<ToastOptions>) {
  showToastWithUniqueBypass(text, () => {
    toastTw.error(text, options)
  })
}

export function showSuccess(text: string, options?: Partial<ToastOptions>) {
  toastTw.success(text, options)
}

export function showInfo(text: string, options?: Partial<ToastOptions>) {
  toastTw.info(text, options)
}

export function showErrorMessage(e: Error | string | unknown) {
  if (e instanceof Error) {
    console.error(e.message)
    return showError(e.message)
  }
  if (typeof e === 'string') {
    console.error(`Error: ${e}`)
    showError(e)
  }
}
