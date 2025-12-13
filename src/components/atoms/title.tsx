import React from 'react'
import { HiOutlineLink } from 'react-icons/hi2'

import { BlockingAwareLink } from './blocking-aware-link'

type TitleProps = {
  title: string
  icon?: React.ReactNode
  link?: string
}

export default function TitleComponent({ title, icon, link }: TitleProps) {
  return (
    <div className="mb-2 text-xl">
      {link ? (
        <BlockingAwareLink
          href={link}
          className="text-ibis-blue flex items-center"
        >
          {title}
          {icon && <HiOutlineLink className="ml-1 h-4 w-4" />}
        </BlockingAwareLink>
      ) : (
        <>
          {title}
          {icon && <HiOutlineLink className="ml-1 h-4 w-4" />}
        </>
      )}
    </div>
  )
}
