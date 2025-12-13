'use client'

import { create } from 'zustand'

import { BerufListNode } from '@/components/atoms/beruf-select-tw/beruf-select-utils'
import { executeGET } from '@/lib/utils/gateway-utils'

// Store definitions
interface FormState {
  berufe: BerufListNode[] | null
  isFetching: boolean

  fetchBerufe: () => Promise<void>
}

const useBerufeStore = create<FormState>((set, get) => ({
  berufe: null,
  isFetching: false,

  fetchBerufe: async () => {
    // Prevent concurrent fetches
    if (get().isFetching || get().berufe) {
      return
    }

    set({ isFetching: true })

    try {
      const { data } = await executeGET<{ berufe: BerufListNode[] }>(
        '/teilnehmer/berufe',
        { withCache: true }
      )

      if (data?.berufe) {
        set({
          berufe: data?.berufe,
        })
      }
    } finally {
      set({ isFetching: false })
    }
  },
}))

export default useBerufeStore
