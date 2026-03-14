import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { ComponentProps, ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

import { BlockingAwareLink } from '@/components/atoms/blocking-aware-link'

type NavigationLinkProps = {
  Icon: (props: { className: string }) => ReactNode
  isVisible?: boolean
  children: ReactNode
  testId?: string
}
const stripUrlParams = (url: string): string => {
  return url.split('?')[0]
}

const NavigationLink = ({
  Icon,
  isVisible = true,
  children,
  testId,
  ...props
}: NavigationLinkProps & ComponentProps<typeof Link>) => {
  const pathname = usePathname()
  const cleanPathname = stripUrlParams(pathname)
  const cleanHref = stripUrlParams(props.href.toString())

  const isActive =
    stripUrlParams(cleanPathname).startsWith(cleanHref) ||
    stripUrlParams(cleanPathname).includes(cleanHref)

  if (!isVisible) {
    return null
  }

  return (
    <li>
      <BlockingAwareLink
        {...props}
        className={twMerge(
          isActive
            ? 'text-ibis-blue bg-gray-50'
            : 'hover:text-ibis-blue text-gray-700 hover:bg-gray-50',
          'group mt-2 flex gap-x-3 rounded-md px-3 py-2 text-sm leading-6 font-normal'
        )}
        data-testid={testId}
      >
        {Icon({
          className: twMerge(
            isActive
              ? 'text-ibis-blue'
              : 'text-gray-400 group-hover:text-ibis-blue',
            'h-6 w-6 shrink-0'
          ),
        })}
        {children}
      </BlockingAwareLink>
    </li>
  )
}

export default NavigationLink
