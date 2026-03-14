import BadgeTw, { BadgeColor, BadgeProps } from '../atoms/badge-tw'

export interface Props extends BadgeProps {
  hours?: number[] | null
}

const getBadgeColor = ([ist, soll]: number[]) => {
  if (soll == 0) {
    return BadgeColor.Gray
  }

  return ist >= soll ? BadgeColor.Green : BadgeColor.Red
}

const SollIstBadge = ({ hours, ...rest }: Props) => {
  if (!hours) {
    return null
  }
  const color = getBadgeColor(hours)

  return (
    <BadgeTw color={color} {...rest}>
      {`${hours[0]} / ${hours[1]}`}
    </BadgeTw>
  )
}

export default SollIstBadge
