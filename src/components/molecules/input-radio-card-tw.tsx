'use client'

import { Field, Label, Radio, RadioGroup } from '@headlessui/react'
import { CheckCircleIcon } from '@heroicons/react/20/solid'
import React, { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

export type InputRadioGroupProps = {
  defaultValue: string
  label?: string
  disabled?: boolean
  testId?: string
  children?: ReactNode
  className?: string
  onChange?: (value: string) => void
  elements: (Record<string, unknown> & {
    title: string
    value: string
  })[]
}

export const InputRadioCardGroupTw = ({
  label,
  defaultValue,
  disabled,
  testId,
  children,
  className,
  onChange,
  elements,
}: InputRadioGroupProps) => {
  return (
    <div>
      <Field as="div" className="flex flex-col" disabled={disabled}>
        {label && (
          <Label
            as="span"
            className="mb-2 text-sm"
            data-testid={`${testId || name}-label`}
          >
            <span className="cursor-pointer font-medium text-gray-900">
              {label}
            </span>
          </Label>
        )}
        <RadioGroup
          value={defaultValue}
          onChange={(value) => {
            // field.onChange(value)
            onChange?.(value)
          }}
          className={twMerge(`grid grid-cols-1 gap-y-6`, className)}
        >
          {elements.map((element, idx) => (
            <Radio
              key={idx}
              value={element}
              className={twMerge(
                `group data-[focus]:border-ibis-blue data-[focus]:ring-ibis-blue relative flex cursor-pointer flex-col rounded-lg border border-gray-300 bg-white p-4 shadow-sm focus:outline-none data-[focus]:ring-2`,
                className
              )}
            >
              <div className="mb-2 flex justify-between gap-1">
                <span className="text-normal block font-medium text-gray-900">
                  {element.title}
                </span>
                <CheckCircleIcon
                  aria-hidden="true"
                  className="text-ibis-blue size-5 group-[&:not([data-checked])]:invisible"
                />
              </div>
              <div className="flex flex-col gap-2">{children}</div>
              <span
                aria-hidden="true"
                className="group-data-[checked]:border-ibis-blue pointer-events-none absolute -inset-px rounded-lg border-2 border-transparent group-data-[focus]:border"
              />
            </Radio>
          ))}
          {children}
        </RadioGroup>
      </Field>
      {/* {fieldState.error && (
            <p
              className="mt-2 text-red-500"
              data-testid={`${testId || name}-error`}
            >
              {fieldState.error.message}{' '}
            </p>
          )} */}
    </div>
  )
}

/* type InputRadioCardTwProps = {
  children?: ReactNode
  title?: string
  value: unknown
  className?: string
}

export const InputRadioCardTw = ({
  children,
  title,
  className,
}: InputRadioCardTwProps) => {
  return (
    <Radio
      value={field.value}
      className={twMerge(
        `group data-[focus]:border-ibis-blue data-[focus]:ring-ibis-blue relative flex cursor-pointer flex-col rounded-lg border border-gray-300 bg-white p-4 shadow-sm focus:outline-none data-[focus]:ring-2`,
        className,
      )}
    >
      <div className="mb-2 flex justify-between gap-1">
        <span className="text-normal block font-medium text-gray-900">
          {title}
        </span>
        <CheckCircleIcon
          aria-hidden="true"
          className="text-ibis-blue size-5 group-[&:not([data-checked])]:invisible"
        />
      </div>
      <div className="flex flex-col gap-2">{children}</div>
      <span
        aria-hidden="true"
        className="group-data-[checked]:border-ibis-blue pointer-events-none absolute -inset-px rounded-lg border-2 border-transparent group-data-[focus]:border"
      />
    </Radio>
  )
}
 */
