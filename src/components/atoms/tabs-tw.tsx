import React, { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

import { BlockingAwareLink } from './blocking-aware-link'

export interface Tab {
  name: string
  key: string
  href: string
  current: boolean
}

export interface Props {
  tabs: Tab[]
  className?: string
  testId?: string
}

export const TabsTw: React.FC<Props> = ({ tabs, className, testId }) => (
  <div className={twMerge('w-full', className)} data-testid={testId}>
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => (
          <BlockingAwareLink
            key={tab.key}
            href={tab.href}
            className={twMerge(
              'border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap',
              tab.current
                ? 'border-ibis-blue text-ibis-blue'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            )}
            data-testid={`${testId}-${tab.key}`}
          >
            {tab.name}
          </BlockingAwareLink>
        ))}
      </nav>
    </div>
  </div>
)

export const TabsItemTw: React.FC<{
  name: string
  count?: number
  href?: string
  onClick?: () => void
  current?: boolean
  className?: string
  testId?: string
}> = ({ name, count, current, href, className, onClick }) => {
  const commonClassName = twMerge(
    current
      ? 'border-ibis-blue text-ibis-blue-dark'
      : 'border-transparent text-gray-500 hover:border-gray-200 hover:text-gray-700',
    'flex whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium cursor-pointer',
    className
  )

  const componentCore = (
    <>
      {name}
      {count ? (
        <span
          className={twMerge(
            current
              ? 'text-ibis-blue-dark bg-indigo-100'
              : 'bg-gray-100 text-gray-900',
            'ml-3 hidden rounded-full px-2.5 py-0.5 text-xs font-medium md:inline-block'
          )}
        >
          {count}
        </span>
      ) : null}
    </>
  )

  return href ? (
    <BlockingAwareLink href={href} className={commonClassName}>
      {componentCore}
    </BlockingAwareLink>
  ) : (
    <div onClick={onClick ? onClick : undefined} className={commonClassName}>
      {componentCore}
    </div>
  )
}

export const TabsContainerTw: React.FC<{
  children: ReactNode
  className?: string
  testId?: string
}> = ({ children, className }) => (
  <div className={twMerge('border-b border-gray-200', className)}>
    <nav aria-label="Tabs" className="-mb-px flex space-x-8">
      {children}
    </nav>
  </div>
)
