import { ComponentPropsWithoutRef, forwardRef, KeyboardEvent } from 'react'

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

type SpinInputProps = {
  value: number | null
  min: number
  max: number
  onChange: (value: number | null) => void
  step?: number
  onNextInput?: () => void
  onPreviousInput?: () => void
}

export const SpinInput = forwardRef<
  HTMLInputElement,
  SpinInputProps & Omit<ComponentPropsWithoutRef<'input'>, 'onChange' | 'value'>
>(function SpinInput(
  {
    value,
    min,
    max,
    onChange,
    step = 1,
    onNextInput,
    onPreviousInput,
    onFocus,
    readOnly,
    ...others
  },
  ref
) {
  const maxDigit = Number(max.toFixed(0)[0])
  const arrowsMax = max + 1 - step

  const handleChange = (value: string) => {
    if (readOnly) {
      return
    }

    const clearValue = value.replace(/\D/g, '')
    if (clearValue !== '') {
      const parsedValue = clamp(parseInt(clearValue, 10), min, max)
      onChange(parsedValue)
      if (parsedValue > maxDigit) {
        onNextInput?.()
      }
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (readOnly) {
      return
    }

    if (event.key === '0' || event.key === 'Num0') {
      if (value === 0) {
        event.preventDefault()
        onNextInput?.()
      }
    }

    if (event.key === 'Home') {
      event.preventDefault()
      onChange(min)
    }

    if (event.key === 'End') {
      event.preventDefault()
      onChange(max)
    }

    if (event.key === 'Backspace' || event.key === 'Delete') {
      event.preventDefault()

      if (value !== null) {
        onChange(null)
      } else {
        onPreviousInput?.()
      }
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault()
      onNextInput?.()
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      onPreviousInput?.()
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      const newValue =
        value === null ? min : clamp(value + step, min, arrowsMax)
      onChange(newValue)
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      const newValue =
        value === null ? arrowsMax : clamp(value - step, min, arrowsMax)
      onChange(newValue)
    }
  }

  return (
    <input
      ref={ref}
      type="text"
      role="spinbutton"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value === null ? 0 : value}
      data-empty={value === null || undefined}
      inputMode="numeric"
      placeholder="--"
      value={value === null ? '' : value.toString().padStart(2, '0')}
      onChange={(event) => handleChange(event.currentTarget.value)}
      onKeyDown={handleKeyDown}
      onFocus={(event) => {
        event.currentTarget.select()
        onFocus?.(event)
      }}
      onClick={(event) => {
        event.stopPropagation()
        event.currentTarget.select()
      }}
      onMouseDown={(event) => event.stopPropagation()}
      {...others}
    />
  )
})
