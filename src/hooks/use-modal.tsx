'use client'

import { createContext, ReactNode, useContext, useState } from 'react'

interface ModalContextType {
  showModal: boolean
  modalContent: ReactNode
  modalSize: string
  setShowModal: (show: boolean) => void
  setModalContent: (modalContent: ReactNode) => void
  setModalSize: (size: string) => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export const ModalProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [showModal, setShowModal] = useState(false)
  const [modalContent, setModalContent] = useState<ReactNode>(null)
  const [modalSize, setModalSize] = useState<string>('4xl')
  return (
    <ModalContext.Provider
      value={{
        showModal,
        modalContent,
        modalSize,
        setShowModal,
        setModalContent,
        setModalSize,
      }}
    >
      {children}
    </ModalContext.Provider>
  )
}

export const useModal = (): ModalContextType => {
  const context = useContext(ModalContext)
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider')
  }
  return context
}
