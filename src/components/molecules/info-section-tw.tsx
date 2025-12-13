import { InformationCircleIcon } from '@heroicons/react/20/solid'
import { twMerge } from 'tailwind-merge'

import { BlockingAwareLink } from '../atoms/blocking-aware-link'

interface Props {
  description: string
  linkText?: string
  linkUrl?: string
  className?: string
  testId?: string
}

const InfoSectionTw = ({
  description,
  linkText,
  linkUrl,
  className,
  testId,
}: Props) => {
  return (
    <div className={twMerge('rounded-md bg-blue-50 p-4', className)}>
      <div className="flex">
        <div className="flex-shrink-0">
          <InformationCircleIcon
            className="h-5 w-5 text-blue-400"
            aria-hidden="true"
          />
        </div>
        <div className="ml-3 flex flex-1 flex-col">
          <p data-testid={testId} className="block text-sm text-blue-700">
            {description}
          </p>
          {linkText && linkUrl && (
            <p className="mt-2 block text-sm">
              <BlockingAwareLink
                href={linkUrl}
                className="font-semibold whitespace-nowrap text-blue-700 underline hover:text-blue-600"
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
export default InfoSectionTw
