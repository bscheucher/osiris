import { Field } from '@headlessui/react'
import {
  ChevronUpDownIcon,
  MinusIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useTranslations } from 'next-intl'
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Control, useController, UseFormRegisterReturn } from 'react-hook-form'
import { ObjectSchema } from 'yup'

import BadgeTw from '../badge-tw'
import ButtonTw, { ButtonSize } from '../button-tw'
import LoaderTw, { LoaderSize } from '../loader-tw'
import {
  BerufListNode,
  filterHierarchicalData,
  flattenHierarchy,
  VirtualBerufListNode,
} from './beruf-select-utils'
import useAsyncEffect from '@/hooks/use-async-effect'
import { useDebounceCallback } from '@/hooks/use-debounce'
import { getFormLabel, KeyLabelOption } from '@/lib/utils/form-utils'
import useBerufeStore from '@/stores/berufe-store'

const DEBOUNCE_TIMEOUT = 500

export interface BerufeSelectProps extends Partial<UseFormRegisterReturn> {
  control: Control<any, any>
  options?: KeyLabelOption[]
  label?: string
  name: string
  id?: string
  placeholder?: string
  disabled?: boolean
  isSingleSelection?: boolean
  schema?: ObjectSchema<any>
  testId?: string
}

const BerufSelectTw: FC<BerufeSelectProps> = ({
  control,
  label,
  disabled = false,
  isSingleSelection = false,
  name,
  schema,
  required,
  testId,
}) => {
  const t = useTranslations('components.berufSelect')
  const { berufe, fetchBerufe } = useBerufeStore()

  const containerRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const searchQueryRef = useRef<HTMLInputElement>(null)
  const { field, fieldState } = useController({
    control,
    name,
  })

  // State
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [isExpandedOverride, setIsExpandedOverride] = useState<boolean | null>(
    null
  )
  const [isLoading, setIsLoading] = useState(true)

  // Computed values
  const berufeList = useMemo(() => berufe || [], [berufe])

  const selectedBerufe: string[] = useMemo(
    () => (!!field.value && Array.isArray(field.value) ? field.value : []),
    [field.value]
  )

  const flattenedItems = useMemo(() => {
    const filteredData = filterHierarchicalData(berufeList, query)

    return flattenHierarchy(
      filteredData,
      expandedNodes,
      query,
      isExpandedOverride
    )
  }, [berufeList, expandedNodes, isExpandedOverride, query])

  const virtualizer = useVirtualizer({
    count: flattenedItems.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => 44,
    overscan: 10,
  })

  // Effects
  useAsyncEffect(async () => {
    await fetchBerufe()
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (isExpandedOverride !== null) {
      const timer = setTimeout(() => setIsExpandedOverride(null), 100)
      return () => clearTimeout(timer)
    }
  }, [isExpandedOverride])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setSearchQuery('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handlers
  const setSearchQuery = useCallback((value: string) => {
    if (searchQueryRef.current) {
      searchQueryRef.current.value = value
      setQuery(value)
    }
  }, [])

  const handleQueryChange = useDebounceCallback(() => {
    setQuery(searchQueryRef.current?.value || '')
  }, DEBOUNCE_TIMEOUT)

  const toggleBeruf = useCallback(
    (selectedItem: string) => {
      let nextValue = []
      if (selectedBerufe.includes(selectedItem)) {
        nextValue = selectedBerufe.filter((item) => item !== selectedItem)
      } else {
        nextValue = isSingleSelection
          ? [selectedItem]
          : [...selectedBerufe, selectedItem]
      }

      field.onChange(nextValue)
    },
    [field, isSingleSelection, selectedBerufe]
  )

  const toggleExpansion = useCallback((nodeId: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId)
      } else {
        newSet.add(nodeId)
      }
      return newSet
    })
  }, [])

  const collectAllNodeIds = useCallback(
    (nodes: BerufListNode[]): Set<string> => {
      const ids = new Set<string>()
      const collect = (node: BerufListNode) => {
        if (node.children?.length) {
          ids.add(node.id)
          node.children.forEach(collect)
        }
      }
      nodes.forEach(collect)
      return ids
    },
    []
  )

  const handleExpandAll = useCallback(() => {
    setExpandedNodes(collectAllNodeIds(berufeList))
    setIsExpandedOverride(null)
    setSearchQuery('')
  }, [berufeList, collectAllNodeIds, setSearchQuery])

  const handleCollapseAll = useCallback(() => {
    setExpandedNodes(new Set())
    setIsExpandedOverride(null)
    setSearchQuery('')
  }, [setSearchQuery])

  const handleReset = useCallback(() => {
    field.onChange([])
    handleCollapseAll()
  }, [field, handleCollapseAll])

  return (
    <Field disabled={disabled}>
      {label && (
        <label
          className="mb-2 block cursor-pointer text-sm leading-6 font-medium text-gray-900"
          data-testid={`label-${testId || name}`}
          htmlFor={`beruf-select-search-${name}`}
        >
          {getFormLabel(name, label, schema, required)}
        </label>
      )}

      <div
        ref={containerRef}
        className="relative"
        id={`beruf-select-input-${testId || name}`}
      >
        {/* Input Field */}
        <div
          className="relative flex min-h-12 w-full flex-wrap gap-2 rounded-md border-0 p-2 pr-10 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-700 sm:text-sm sm:leading-6"
          onClick={() => searchQueryRef.current?.focus()}
        >
          {selectedBerufe.map((title) => (
            <BadgeTw key={title} className="flex gap-2 rounded">
              {title}
              <button
                type="button"
                role="button"
                className="cursor-pointer"
                onClick={() => toggleBeruf(title)}
              >
                <XMarkIcon className="size-6 p-1" />
              </button>
            </BadgeTw>
          ))}

          <div className="flex">
            <input
              type="text"
              id={`beruf-select-search-${testId || name}`}
              className="flex w-72 border-none p-1 text-sm text-gray-900 outline-none focus:ring-0"
              placeholder={t('label.sucheEingeben')}
              onChange={handleQueryChange}
              ref={searchQueryRef}
              onFocus={() => setIsOpen(true)}
            />
            {query && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="cursor-pointer p-1 text-gray-500 hover:text-gray-900"
                data-testid={`search-input-clear-${testId || name}`}
              >
                <XMarkIcon className="size-5" />
              </button>
            )}
          </div>

          <ChevronUpDownIcon
            className="absolute top-1/2 right-3 size-5 -translate-y-1/2 cursor-pointer text-gray-400"
            data-testid={`dropdown-arrows-${testId || name}`}
          />
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute top-[calc(100%+0.5rem)] left-0 z-50 w-full rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
            {/* Action Buttons */}
            <div className="mb-2 flex gap-2">
              <ButtonTw
                size={ButtonSize.Medium}
                className="flex-auto"
                secondary
                onClick={handleReset}
                testId={`selection-reset-${testId || name}`}
              >
                {t('label.auswahlZuruecksetzen')}
              </ButtonTw>
              <ButtonTw
                size={ButtonSize.Medium}
                className="flex flex-auto justify-center gap-2"
                onClick={handleCollapseAll}
                testId={`collapse-nodes-${testId || name}`}
              >
                <MinusIcon className="size-5" />
                {t('label.alleEinklappen')}
              </ButtonTw>
              <ButtonTw
                size={ButtonSize.Medium}
                className="flex flex-auto justify-center gap-2"
                onClick={handleExpandAll}
                testId={`expand-nodes-${testId || name}`}
              >
                <PlusIcon className="size-5" />
                {t('label.alleAusklappen')}
              </ButtonTw>
            </div>

            {/* Virtual List */}
            <div
              ref={scrollContainerRef}
              className="h-[400px] overflow-auto rounded-lg border border-gray-200"
              style={{ contain: 'strict' }}
              id={`beruf-select-results-${testId || name}`}
            >
              {isLoading ? (
                <div className="flex h-[400px] items-center justify-center">
                  <LoaderTw size={LoaderSize.Large} />
                </div>
              ) : flattenedItems.length ? (
                <div
                  style={{
                    height: `${virtualizer.getTotalSize()}px`,
                    position: 'relative',
                  }}
                >
                  {virtualizer.getVirtualItems().map((virtualItem) => {
                    const item = flattenedItems[virtualItem.index]
                    return (
                      <VirtualBerufListNode
                        key={`${item.id}-${virtualItem.index}`}
                        item={item}
                        toggleBeruf={toggleBeruf}
                        toggleExpansion={toggleExpansion}
                        isSelected={selectedBerufe.includes(item.title)}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: `${virtualItem.size}px`,
                          transform: `translateY(${virtualItem.start}px)`,
                          backgroundColor:
                            virtualItem.index % 2 === 0
                              ? '#f9fafb'
                              : 'transparent',
                        }}
                      />
                    )
                  })}
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-gray-600">
                  {t('label.keineBerufe')}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {fieldState.error && (
        <p
          className="mt-2 text-red-500"
          data-testid={`${testId || name}-error`}
        >
          {fieldState.error.message}
        </p>
      )}
    </Field>
  )
}

BerufSelectTw.displayName = 'BerufSelectTw'
export default BerufSelectTw
