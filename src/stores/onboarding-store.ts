'use client'

import { create } from 'zustand'

import { WorkflowItem, Workflow } from '@/lib/interfaces/workflow'
import { executeGET } from '@/lib/utils/gateway-utils'
import {
  getSortedWorkflowItems,
  getSortedWorkflows,
  getWorkflowItemsFromWorkflow,
} from '@/lib/utils/mitarbeiter/workflow-utils'
import { showErrorMessage } from '@/lib/utils/toast-utils'

// Store definitions
interface OnboardingState {
  // workflows & workflow items
  workflowItems: WorkflowItem[] | null
  workflows: Workflow[] | null
  setWorkflowItems: (items: WorkflowItem[]) => void
  setWorkflowItemsFromWorkflow: (workflow: Workflow[]) => void
  resetWorkflowState: () => void
  fetchWorkflowGroup: (personalnummer: string) => Promise<void>

  kostenstellen: string[] | null
  fetchKostenstellen: (personalnummer: string) => Promise<void>
}

const useOnboardingStore = create<OnboardingState>((set, get) => ({
  // Workflows
  workflowItems: null,
  workflows: null,
  activeWorkflow: null,
  setWorkflowItems: (workflowItems: WorkflowItem[]) => {
    set({ workflowItems })
  },
  setWorkflowItemsFromWorkflow: (workflows: Workflow[]) => {
    const workflowItems = getWorkflowItemsFromWorkflow(workflows)

    set({
      workflows: getSortedWorkflows(workflows),
      workflowItems: getSortedWorkflowItems(workflowItems),
    })
  },

  resetWorkflowState: () => {
    set({
      workflowItems: null,
      workflows: null,
    })
  },

  fetchWorkflowGroup: async (personalnummer: string) => {
    try {
      const { data } = await executeGET<{ workflowgroup: Workflow[] }>(
        `/mitarbeiter/getWorkflowgroup?personalnummer=${personalnummer}`
      )

      if (data?.workflowgroup) {
        get().setWorkflowItemsFromWorkflow(data?.workflowgroup)
      }
    } catch (e) {
      showErrorMessage(e)
    }
  },
  // Kostenstellen
  kostenstellen: null,

  fetchKostenstellen: async (personalnummer: string) => {
    if (personalnummer) {
      try {
        const { data } = await executeGET<{ kostenstellen: string[] }>(
          `/mitarbeiter/getKostenstelleFromPersonalnummer?personalnummer=${personalnummer}`,
          { withCache: true }
        )
        if (data?.kostenstellen) {
          set({ kostenstellen: data?.kostenstellen })
        }
      } catch (e) {
        showErrorMessage(e)
      }
    }
  },
}))

export default useOnboardingStore
