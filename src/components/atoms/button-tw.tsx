import React, { ButtonHTMLAttributes, DetailedHTMLProps } from 'react'
import { twMerge } from 'tailwind-merge'

import { BlockingAwareLink } from '@/components/atoms/blocking-aware-link'
import LoaderTw, { LoaderSize } from '@/components/atoms/loader-tw'
export enum ButtonSize {
  XSmall = 'xsmall',
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
  XLarge = 'xlarge',
}

export interface ButtonProps
  extends Partial<
    DetailedHTMLProps<
      ButtonHTMLAttributes<HTMLButtonElement>,
      HTMLButtonElement
    >
  > {
  className?: string
  href?: string
  size?: `${ButtonSize}`
  isLoading?: boolean
  disabled?: boolean
  hidden?: boolean
  secondary?: boolean
  testId?: string
  notificationCount?: number
}

const getClassnameFromSize = (size?: `${ButtonSize}`) => {
  if (size === ButtonSize.XSmall) {
    return 'px-1 py-1'
  } else if (size === ButtonSize.Small) {
    return ' px-2 py-1'
  } else if (size === ButtonSize.Large) {
    return ' px-3.5 py-2.5'
  } else if (size === ButtonSize.XLarge) {
    return ' px-6 py-3.5'
  }

  return 'px-3 py-2'
}

const ButtonTw = ({
  className,
  href,
  size,
  children,
  isLoading,
  disabled,
  hidden,
  secondary,
  testId,
  type = 'button',
  notificationCount,
  ...rest
}: ButtonProps) => {
  if (hidden) return null

  const baseStyles = twMerge(
    `cursor-pointer rounded-md font-normal shadow-sm text-sm ring-1 ring-inset focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50 disabled:text-gray-950 disabled:ring-gray-400`,
    secondary
      ? `bg-white text-gray-900 ring-gray-300 hover:bg-gray-50`
      : `cursor-pointer bg-ibis-blue ring-ibis-blue-dark text-white hover:bg-ibis-blue-light focus-visible:outline-ibis-blue`,
    getClassnameFromSize(size),
    className
  )

  if (!disabled && !isLoading && href) {
    return (
      <BlockingAwareLink
        className={twMerge(`flex items-center justify-center`, baseStyles)}
        href={href}
        data-testid={testId}
      >
        {isLoading ? <LoaderTw className="fill-gray-600" /> : children}
      </BlockingAwareLink>
    )
  }

  return (
    <button
      className={baseStyles}
      disabled={isLoading || disabled}
      type={type}
      {...rest}
      data-testid={testId}
    >
      {!!notificationCount && (
        <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full border border-white bg-red-600 text-xs text-white">
          <span>{notificationCount}</span>
        </span>
      )}
      {isLoading ? (
        <LoaderTw
          className="fill-gray-600"
          testId="button-loader"
          size={LoaderSize.Small}
        />
      ) : (
        children
      )}
    </button>
  )
}

export default ButtonTw
