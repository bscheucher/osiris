import React, { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

type Props = {
  children: ReactNode
  button?: ReactNode
  title: string
  className?: string
  containerClassName?: string
}

export const LayoutWrapper: React.FC<Props> = ({
  children,
  className = 'max-w-2xl',
  containerClassName = '',
  title,
  button,
}) => {
  return (
    <div className={twMerge(`container mx-auto`, className)}>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="block text-3xl font-semibold tracking-tight text-gray-900">
          {title}
        </h1>
        {button}
      </div>
      <div
        className={twMerge(
          `flex flex-col rounded-lg bg-white p-8 shadow ring-1 ring-gray-200`,
          containerClassName
        )}
      >
        {children}
      </div>
    </div>
  )
}
