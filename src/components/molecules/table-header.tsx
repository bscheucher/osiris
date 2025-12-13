import React from 'react'

type TableHeaderProps = {
  columns: string[]
  widthPercents?: number[]
}

export default function TableHeader({
  columns,
  widthPercents,
}: TableHeaderProps) {
  const widths = widthPercents ?? columns.map(() => 100 / columns.length)
  return (
    <thead className="bg-gray-50">
      <tr className="text-left">
        {columns.map((column, index) => (
          <th
            style={{ minWidth: widths[index] + '%' }}
            key={index}
            className="sticky top-0 z-10 border-b border-gray-300 bg-gray-50 px-4 py-2 font-normal"
          >
            {column}
          </th>
        ))}
      </tr>
    </thead>
  )
}
