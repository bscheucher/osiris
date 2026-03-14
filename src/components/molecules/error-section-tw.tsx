import { ExclamationCircleIcon } from '@heroicons/react/20/solid'
import { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

import { BlockingAwareLink } from '../atoms/blocking-aware-link'

interface Props {
  description: string | ReactNode
  linkText?: string
  linkUrl?: string
  className?: string
  testId?: string
}

const ErrorSectionTw = ({
  description,
  linkText,
  linkUrl,
  className,
  testId,
}: Props) => {
  return (
    <div className={twMerge('rounded-md bg-red-50 p-4', className)}>
      <div className="flex">
        <div className="flex-shrink-0">
          <ExclamationCircleIcon
            className="h-5 w-5 text-red-400"
            aria-hidden="true"
          />
        </div>
        <div className="ml-3 flex flex-1 flex-col">
          <p data-testid={testId} className="block text-sm text-red-700">
            {description}
          </p>
          {linkText && linkUrl && (
            <p className="mt-2 block text-sm">
              <BlockingAwareLink
                href={linkUrl}
                className="font-semibold whitespace-nowrap text-red-700 underline hover:text-red-600"
              >
                {linkText}
                <span aria-hidden="true"> &rarr;</span>
              </BlockingAwareLink>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
export default ErrorSectionTw
