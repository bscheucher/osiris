import React, {
  ButtonHTMLAttributes,
  DetailedHTMLProps,
  ReactNode,
} from 'react'
import { twMerge } from 'tailwind-merge'

import { BlockingAwareLink } from '../atoms/blocking-aware-link'

export interface ButtonProps
  extends Partial<
    DetailedHTMLProps<
      ButtonHTMLAttributes<HTMLButtonElement>,
      HTMLButtonElement
    >
  > {
  className?: string
  href?: string
  isLoading?: boolean
  disabled?: boolean
  hidden?: boolean
  testId?: string
  hasNotification?: boolean
  isActive?: boolean
}

export const MultiButtonItemTw = ({
  className,
  href,
  children,
  isLoading,
  disabled,
  type = 'button',
  hasNotification,
  isActive,
  ...rest
}: ButtonProps) => {
  const baseStyles = twMerge(
    `relative -ml-px first:rounded-l-md last:rounded-r-md inline-flex items-center bg-white px-3 py-2 text-sm font-normal text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10`,
    isActive && 'text-blue-500',
    className
  )

  if (href) {
    return (
      <BlockingAwareLink className={twMerge(baseStyles)} href={href}>
        {children}
      </BlockingAwareLink>
    )
  }

  return (
    <button type="button" className={baseStyles} {...rest}>
      {hasNotification && (
        <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-white bg-red-600 text-xs text-white"></span>
      )}
      {children}
    </button>
  )
}

const MultiButtonTw = ({ children }: { children: ReactNode }) => {
  return (
    <span className="isolate inline-flex rounded-md shadow-sm">{children}</span>
  )
}

export default MultiButtonTw
