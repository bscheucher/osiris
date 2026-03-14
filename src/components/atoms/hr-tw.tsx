import React from 'react'
import { twMerge } from 'tailwind-merge'

const HorizontalRow = ({
  className,
  testId,
}: {
  className?: string
  testId?: string
}) => (
  <hr
    className={twMerge('border-gray-900/10', className)}
    data-testid={testId}
  />
)

HorizontalRow.displayName = 'HorizontalRow'

export default HorizontalRow
