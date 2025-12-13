import React from 'react'

export default function TableBody({
  data,
  widthPercents,
}: {
  data: string[][]
  widthPercents?: number[]
}) {
  return (
    <tbody>
      {data.map((row, index) => (
        <tr key={index}>
          {row.map((cell, cellIndex) => (
            <td
              key={cellIndex}
              style={{
                width: widthPercents ? `${widthPercents[cellIndex]}%` : 'auto',
                wordBreak: 'break-word',
                whiteSpace: 'nowrap',
              }}
              className="border-b border-gray-300 px-4 py-2"
            >
              {cell}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  )
}
