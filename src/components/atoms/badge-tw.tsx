import { DetailedHTMLProps } from 'react'
import { twMerge } from 'tailwind-merge'

export enum BadgeSize {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
  XLarge = 'xlarge',
}

export enum BadgeColor {
  Red = 'red',
  Blue = 'blue',
  Green = 'green',
  Yellow = 'yellow',
  Gray = 'gray',
  Purple = 'purple',
}

export interface BadgeProps
  extends Partial<
    DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>
  > {
  className?: string
  size?: BadgeSize
  color?: BadgeColor
}

const getClassnameFromSize = (size?: BadgeSize) => {
  switch (size) {
    case BadgeSize.Small:
      return 'px-1 py-0.5'
    case BadgeSize.Large:
      return 'px-3 py-2 text-sm'
    case BadgeSize.XLarge:
      return 'px-3.5 py-2.5 text-base'
    default:
      return 'px-2 py-1.5'
  }
}

const getClassnameFromColor = (color?: BadgeColor) => {
  switch (color) {
    case BadgeColor.Red:
      return 'bg-red-50 text-red-700 ring-red-600/10'
    case BadgeColor.Blue:
      return 'bg-blue-50 text-blue-700 ring-blue-600/10'
    case BadgeColor.Green:
      return 'bg-green-50 text-green-700 ring-green-600/10'
    case BadgeColor.Yellow:
      return 'bg-yellow-50 text-yellow-700 ring-yellow-600/10'
    case BadgeColor.Purple:
      return 'bg-purple-50 text-purple-700 ring-purple-600/10'
    case BadgeColor.Gray:
    default:
      return 'bg-gray-50 text-gray-600 ring-gray-500/10'
  }
}

const BadgeTw = ({ className, size, color, children, ...rest }: BadgeProps) => {
  return (
    <span
      className={twMerge(
        `inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-normal text-red-700 ring-1 ring-red-600/10 ring-inset`,
        getClassnameFromSize(size),
        getClassnameFromColor(color),
        className
      )}
      {...rest}
    >
      {children}
    </span>
  )
}

export default BadgeTw
