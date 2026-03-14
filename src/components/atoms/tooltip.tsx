import React from 'react'
export default function Tooltip({
  children,
  message,
}: {
  children: React.ReactNode
  message: string
}) {
  return (
    <div className="group relative inline-flex">
      <div>{children}</div>
      <div className="absolute top-full z-50 mt-2 min-w-max rounded border border-gray-200 bg-white p-1 text-sm text-red-500 opacity-0 shadow-lg transition duration-200 ease-out group-hover:translate-y-0 group-hover:opacity-100">
        {message}
      </div>
    </div>
  )
}
