'use client'

import { create } from 'zustand'

import {
  MitarbeiterType,
  MitarbeiterTypeAsString,
} from '@/lib/interfaces/mitarbeiter'
import { executeGET } from '@/lib/utils/gateway-utils'
import { Masterdata } from '@/lib/utils/mitarbeiter/mitarbeiter-utils'

// Store definitions
interface FormState {
  masterdataTN: Masterdata | null
  masterdataMA: Masterdata | null

  fetchMasterdata: (type?: MitarbeiterTypeAsString) => Promise<void>
}

const useMasterdataStore = create<FormState>((set) => ({
  masterdataTN: null,
  masterdataMA: null,
  mitarbeiterType: null,

  fetchMasterdata: async (type?: MitarbeiterTypeAsString) => {
    const response = await executeGET<{ masterdata: Masterdata[] }>(
      `/mitarbeiter/masterdata?type=${type}`,
      { withCache: true }
    )

    const masterdata = response.data?.masterdata[0]

    if (masterdata) {
      if (type === MitarbeiterType.Mitarbeiter) {
        set({
          masterdataMA: masterdata,
        })
      } else {
        set({
          masterdataTN: masterdata,
        })
      }
    }
  },
}))

export default useMasterdataStore
