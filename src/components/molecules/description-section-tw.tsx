import { twMerge } from 'tailwind-merge'

import { BlockingAwareLink } from '../atoms/blocking-aware-link'

interface Props {
  description: string
  linkText?: string
  linkUrl?: string
  className?: string
}

const DescriptionSectionTw = ({
  description,
  linkText,
  linkUrl,
  className,
}: Props) => {
  return (
    <div className={twMerge('rounded-md bg-gray-50 px-6 py-4', className)}>
      <div className="flex">
        <p className="block text-sm text-gray-700">{description}</p>
        {linkText && linkUrl && (
          <p className="mt-2 block text-sm">
            <BlockingAwareLink
              href={linkUrl}
              className="font-semibold whitespace-nowrap text-gray-700 underline hover:text-gray-600"
            >
              {linkText}
              <span aria-hidden="true"> &rarr;</span>
            </BlockingAwareLink>
          </p>
        )}
      </div>
    </div>
  )
}
export default DescriptionSectionTw
