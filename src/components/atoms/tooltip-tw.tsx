import {
  useFloating,
  offset,
  flip,
  shift,
  Placement,
  autoUpdate,
} from '@floating-ui/react'
import React, { ReactNode, useState } from 'react'
import { twMerge } from 'tailwind-merge'

interface TooltipProps {
  content: ReactNode
  children: ReactNode
  className?: string
  direction?: TooltipDirection
}

export enum TooltipDirection {
  Top = 'top',
  Bottom = 'bottom',
  Left = 'left',
  Right = 'right',
}

const TooltipTw: React.FC<TooltipProps> = ({
  content,
  children,
  className,
  direction = TooltipDirection.Top,
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const { x, y, refs, strategy, update } = useFloating({
    placement: direction as Placement,
    middleware: [offset(12), flip(), shift()],
    whileElementsMounted: autoUpdate,
  })

  const showTooltip = () => {
    setIsOpen(true)
    update() // Update tooltip position
  }

  const hideTooltip = () => {
    setIsOpen(false)
  }

  return (
    <>
      <div
        ref={refs.setReference}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        className={twMerge('inline-block', className)}
        data-testid="tooltip-tw-container"
      >
        {children}
        <div
          ref={refs.setFloating}
          style={{
            position: strategy,
            top: y ?? 0,
            left: x ?? 0,
          }}
          className={twMerge(
            'pointer-events-none absolute z-50 rounded-lg bg-gray-700 px-6 py-4 text-sm text-white shadow-2xl transition-all duration-300 ease-in-out',
            isOpen
              ? 'pointer-events-auto translate-y-0 opacity-100'
              : 'translate-y-1 opacity-0',
            'before:absolute before:-bottom-3 before:left-0 before:h-3 before:w-full',
            'after:absolute after:left-1/2 after:h-3 after:w-3 after:-translate-x-1/2 after:rotate-45 after:bg-inherit after:transition-all after:duration-300 after:ease-in-out',
            direction === TooltipDirection.Top &&
              'after:top-full after:-translate-y-1/2',
            direction === TooltipDirection.Bottom &&
              'after:bottom-full after:translate-y-1/2',
            direction === TooltipDirection.Left &&
              'after:top-1/2 after:left-full after:-translate-x-1/2 after:-translate-y-1/2',
            direction === TooltipDirection.Right &&
              'after:top-1/2 after:right-full after:translate-x-1/2 after:-translate-y-1/2'
          )}
        >
          {content}
        </div>
      </div>
    </>
  )
}

export default TooltipTw
