'use client'

import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  TransitionChild,
} from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import { ReactNode, Suspense, useState } from 'react'
import { Toaster } from 'react-hot-toast'

import Navigation from './navigation'
import { BlockingAwareLink } from '@/components/atoms/blocking-aware-link'
import Chatbot from '@/components/organisms/chatbot'
import useAsyncEffect from '@/hooks/use-async-effect'
import { ROLE } from '@/lib/constants/role-constants'
import { MitarbeiterType } from '@/lib/interfaces/mitarbeiter'
import useMasterdataStore from '@/stores/form-store'
import useUserStore from '@/stores/user-store'

const Layout = ({ children }: { children: ReactNode }) => {
  const buildTag = process?.env?.NEXT_PUBLIC_BUILD_TAG || 'Development'

  const { fetchUser, hasSomeRole } = useUserStore()
  const { fetchMasterdata } = useMasterdataStore()

  const [sidebarOpen, setSidebarOpen] = useState(false)

  useAsyncEffect(async () => {
    // pre fetch all user and masterdata
    await Promise.all([
      fetchUser(),
      fetchMasterdata(MitarbeiterType.Mitarbeiter),
      fetchMasterdata(MitarbeiterType.Teilnehmer),
    ])
  }, [])

  return (
    <Suspense>
      <div>
        <Dialog
          open={sidebarOpen}
          onClose={setSidebarOpen}
          className="relative z-50 lg:hidden"
        >
          <DialogBackdrop
            transition
            className="fixed inset-0 bg-gray-900/80 transition-opacity duration-300 ease-linear data-[closed]:opacity-0"
          />

          <div className="fixed inset-0 flex">
            <DialogPanel
              transition
              className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-[closed]:-translate-x-full"
            >
              <TransitionChild>
                <div className="absolute top-0 left-full flex w-16 justify-center pt-5 duration-300 ease-in-out data-[closed]:opacity-0">
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(false)}
                    className="-m-2.5 p-2.5"
                  >
                    <span className="sr-only">Close sidebar</span>
                    <XMarkIcon
                      aria-hidden="true"
                      className="h-6 w-6 text-white"
                    />
                  </button>
                </div>
              </TransitionChild>
              {/* Sidebar component, swap this element with another sidebar if you like */}
              <div className="flex grow flex-col gap-y-6 overflow-y-auto bg-white px-6 pb-2">
                <div className="my-6 flex">
                  <BlockingAwareLink href="/dashboard">
                    <Image
                      src="/ibis-acam-logo.svg"
                      alt="Logo"
                      height={80}
                      width={144}
                      title={`Build: ${buildTag}`}
                      priority
                    />
                  </BlockingAwareLink>
                </div>
                <Navigation />
              </div>
            </DialogPanel>
          </div>
        </Dialog>

        {/* Static sidebar for desktop */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-80 lg:flex-col">
          {/* Sidebar component, swap this element with another sidebar if you like */}
          <div className="flex grow flex-col overflow-y-auto border-r border-gray-200 bg-white px-6">
            <div className="my-8 flex">
              <BlockingAwareLink href="/dashboard">
                <Image
                  src="/ibis-acam-logo.svg"
                  alt="Logo"
                  height={80}
                  width={144}
                  priority
                  title={`Build: ${buildTag}`}
                />
              </BlockingAwareLink>
            </div>
            <Navigation />
          </div>
        </div>

        <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-white px-4 py-4 shadow-sm sm:px-6 lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
          >
            <span className="sr-only">Menü öffnen</span>
            <Bars3Icon aria-hidden="true" className="h-6 w-6" />
          </button>
        </div>

        <main className="lg:pl-80">
          <div className="relative">
            <Toaster
              containerStyle={{
                top: 24,
                left: 24,
                bottom: 24,
                right: 24,
              }}
            />
          </div>
          <div className="px-4 py-10 sm:px-6 lg:px-8">{children} </div>
        </main>
        {hasSomeRole(ROLE.FN_AI_CHATBOT) && <Chatbot />}
      </div>
    </Suspense>
  )
}

export default Layout
