import React, { DetailedHTMLProps, LabelHTMLAttributes, ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

export interface LabelProps
  extends DetailedHTMLProps<
    LabelHTMLAttributes<HTMLLabelElement>,
    HTMLLabelElement
  > {
  testId?: string
  className?: string
  children?: ReactNode
}

const FormLabelTw = ({ testId, className, children, ...rest }: LabelProps) => {
  return (
    <label
      className={twMerge(
        'block cursor-pointer text-sm leading-6 font-medium text-gray-900',
        className
      )}
      data-testid={`${testId}-label`}
      {...rest}
    >
      {children}
    </label>
  )
}

export default FormLabelTw
