'use client'

import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

type DefaultModalProps = {
  showModal: boolean
  closeModal: () => void
  showCloseMark?: boolean
  modalSize?: string
  children: ReactNode
  testId?: string
}

export const DefaultModal = ({
  showModal,
  closeModal,
  showCloseMark = true,
  modalSize = '4xl',
  children,
  testId,
}: DefaultModalProps) => (
  <Dialog open={showModal} onClose={closeModal} className="relative z-[9999]">
    <DialogBackdrop
      transition
      className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[enter]:ease-out data-[leave]:duration-300 data-[leave]:ease-in"
    />

    <div
      className="fixed inset-0 z-10 w-screen overflow-y-auto"
      data-testid={testId}
    >
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <DialogPanel
          transition
          className={twMerge(
            `relative transform rounded-md bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[enter]:ease-out data-[leave]:duration-200 data-[leave]:ease-in sm:my-8 sm:p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95`,
            `sm:w-full sm:max-w-${modalSize}`
          )}
        >
          {showCloseMark && (
            <div className="absolute top-0 right-0 z-20 block pt-4 pr-4">
              <button
                type="button"
                onClick={closeModal}
                className="cursor-pointer rounded-md bg-white text-gray-400 hover:text-gray-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
                data-testid="modal-close"
              >
                <span className="sr-only">Close</span>
                <XMarkIcon aria-hidden="true" className="h-6 w-6" />
              </button>
            </div>
          )}
          {children}
        </DialogPanel>
      </div>
    </div>
  </Dialog>
)
