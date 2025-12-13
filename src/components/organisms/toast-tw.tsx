'use client'

import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/20/solid'
import React from 'react'
import toast, { Toast, ToastOptions } from 'react-hot-toast'
import { twMerge } from 'tailwind-merge'

// Type for message content
type ToastMessage = {
  title: string
  description?: string
}

interface ToastOptionsWithDescription extends ToastOptions {
  description?: string
}

const DEFAULT_OPTIONS: ToastOptions = {
  duration: 5000,
  position: 'top-right',
}

const getOptions = (options?: ToastOptionsWithDescription) => {
  delete options?.description

  return {
    ...DEFAULT_OPTIONS,
    ...options,
  }
}

// Toast icon component based on type
const ToastIcon = ({
  type,
}: {
  type: 'success' | 'error' | 'warning' | 'info'
}) => {
  switch (type) {
    case 'success':
      return (
        <CheckCircleIcon aria-hidden="true" className="size-6 text-green-600" />
      )
    case 'error':
      return (
        <ExclamationCircleIcon
          aria-hidden="true"
          className="size-6 text-red-500"
        />
      )
    case 'warning':
      return (
        <ExclamationTriangleIcon
          aria-hidden="true"
          className="size-6 text-amber-500"
        />
      )
    case 'info':
    default:
      return (
        <InformationCircleIcon
          aria-hidden="true"
          className="size-6 text-blue-500"
        />
      )
  }
}

// Toast notification component
const ToastNotification = ({
  t,
  type,
  message,
  onDismiss,
}: {
  t: Toast
  type: 'success' | 'error' | 'warning' | 'info'
  message: ToastMessage
  onDismiss: () => void
}) => (
  <div
    className={twMerge(
      `toast-container pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-xl ring-1 ring-black/5`,
      t.visible ? 'animate-enter toast-container-visible' : 'animate-leave'
    )}
    data-testid="toast-container"
  >
    <div className="p-4">
      <div className="flex items-start">
        <div className="shrink-0">
          <ToastIcon type={type} />
        </div>
        <div className="ml-3 w-0 flex-1 pt-0.5">
          <p className="text-sm font-medium text-gray-900">{message.title}</p>
          {message.description && (
            <p className="mt-1 text-sm text-gray-500">{message.description}</p>
          )}
        </div>
        <div className="ml-4 flex shrink-0">
          <button
            type="button"
            onClick={onDismiss}
            className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
            data-testid="toast-container-close"
          >
            <span className="sr-only">Close</span>
            <XMarkIcon aria-hidden="true" className="size-5" />
          </button>
        </div>
      </div>
    </div>
  </div>
)

// The actual toast functionality that will be exported
export const toastTw = {
  success: (title: string, options: ToastOptionsWithDescription = {}) => {
    return toast.custom(
      (t) => (
        <ToastNotification
          t={t}
          type="success"
          message={{ title, description: options.description }}
          onDismiss={() => toast.dismiss(t.id)}
        />
      ),
      getOptions(options)
    )
  },

  error: (title: string, options: ToastOptionsWithDescription = {}) => {
    return toast.custom(
      (t) => (
        <ToastNotification
          t={t}
          type="error"
          message={{ title, description: options.description }}
          onDismiss={() => toast.dismiss(t.id)}
        />
      ),
      getOptions(options)
    )
  },

  warning: (title: string, options: ToastOptionsWithDescription = {}) => {
    return toast.custom(
      (t) => (
        <ToastNotification
          t={t}
          type="warning"
          message={{ title, description: options.description }}
          onDismiss={() => toast.dismiss(t.id)}
        />
      ),
      getOptions(options)
    )
  },

  info: (title: string, options: ToastOptionsWithDescription = {}) => {
    return toast.custom(
      (t) => (
        <ToastNotification
          t={t}
          type="info"
          message={{ title, description: options.description }}
          onDismiss={() => toast.dismiss(t.id)}
        />
      ),
      getOptions(options)
    )
  },
}
