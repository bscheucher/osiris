import { Fieldset, Label } from '@headlessui/react'
import { forwardRef, useState } from 'react'
import { Control, Controller, UseFormRegisterReturn } from 'react-hook-form'
import { ObjectSchema } from 'yup'

import { getFormLabel, KeyLabelOption } from '@/lib/utils/form-utils'

interface ComboSelectProps extends Partial<UseFormRegisterReturn> {
  control: Control<any, any>
  options: KeyLabelOption[]
  label?: string
  name: string
  placeholder?: string
  disabled?: boolean
  disableInput?: boolean
  optionsClassName?: string
  schema?: ObjectSchema<any>
  testId?: string
}

export enum OptionCommand {
  Reset = 'reset',
  SelectAll = 'selectAll',
}

const SelectableList = forwardRef<HTMLInputElement, ComboSelectProps>(
  (
    {
      control,
      options,
      label,
      disabled = false,
      placeholder = '',
      name,
      schema,
      required,
      testId = '',
    },
    ref
  ) => {
    // TODO: implement filter
    const [query, setQuery] = useState('')
    const filteredOptions =
      query === ''
        ? options
        : options.filter((option) =>
            option.label.toLowerCase().includes(query.toLowerCase())
          )

    return (
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState }) => (
          <Fieldset disabled={disabled}>
            {label && (
              <Label
                className="block text-sm leading-6 font-medium text-gray-900"
                data-testid={`${testId || name}-label`}
              >
                {getFormLabel(name, label, schema, required)}
              </Label>
            )}
            <div className="mt-2">
              <div className="relative flex items-start gap-4 border-b border-gray-200 py-3">
                <input
                  type="checkbox"
                  disabled={disabled}
                  className="text-ibis-blue focus:ring-ibis-blue h-5 w-5 rounded border-gray-300"
                />
                <Label className="font-semibold text-gray-900">
                  Alle Auswählen
                </Label>
              </div>

              {filteredOptions &&
                filteredOptions.map((option) => (
                  <div
                    key={option.key}
                    className="relative flex items-start gap-4 py-3"
                  >
                    <input
                      id={option.key}
                      name={option.key}
                      type="checkbox"
                      disabled={disabled}
                      aria-describedby={option.label}
                      className="text-ibis-blue focus:ring-ibis-blue h-5 w-5 rounded border-gray-300"
                      onChange={(e) => {
                        // console.log(e)
                      }}
                      data-testid={testId || name}
                    />
                    <div className="flex-1 text-sm">
                      <label
                        htmlFor={option.key}
                        className="font-semibold text-gray-900"
                      >
                        {option.label}
                      </label>
                      {option.description && (
                        <p id="offers-description" className="text-gray-500">
                          {option.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
            </div>
            {fieldState.error && (
              <p
                className="mt-2 text-red-500"
                data-testid={`${testId || name}-error`}
              >
                {fieldState.error.message}
              </p>
            )}
          </Fieldset>
        )}
      />
    )
  }
)

SelectableList.displayName = 'SelectableList'

export default SelectableList
