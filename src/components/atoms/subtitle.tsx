import React from 'react'

type SubtitleProps = {
  subtitle: string
}

export default function SubtitleComponent({ subtitle }: SubtitleProps) {
  return <div className="text-md mb-4">{subtitle}</div>
}
