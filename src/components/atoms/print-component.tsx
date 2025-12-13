import React, { ReactNode } from 'react'

import ButtonTw from './button-tw'

interface PrintComponentProps {
  contentRef: React.RefObject<HTMLDivElement | null>
  buttonClassName?: string
  children?: string | ReactNode
}

const PrintComponent: React.FC<PrintComponentProps> = ({
  contentRef,
  buttonClassName = 'print-button',
  children = 'Drucken',
}) => {
  const handlePrint = () => {
    if (!contentRef || !contentRef.current) return

    // Create a clone of the content
    const printContent = contentRef.current.cloneNode(true) as HTMLElement

    // Create a new container
    const printContainer = document.createElement('div')
    printContainer.appendChild(printContent)

    // Store the current content
    const originalContent = document.body.innerHTML

    // Apply print content
    document.body.innerHTML = printContainer.innerHTML

    // Print
    window.print()

    // Restore original content via DOM manipulation instead of innerHTML
    document.body.innerHTML = originalContent

    // Force a re-render to restore React event listeners
    window.location.reload()
  }

  return (
    <ButtonTw onClick={handlePrint} className={buttonClassName} type="button">
      {children}
    </ButtonTw>
  )
}

export default PrintComponent
