import { PlusIcon } from '@heroicons/react/24/outline'
import { FC, useCallback } from 'react'
import { twMerge } from 'tailwind-merge'

import ButtonTw, { ButtonSize } from '../button-tw'

export interface BerufListNode {
  children?: BerufListNode[]
  id: string
  title: string
  type: 'Kategorie' | 'Berufsfeld' | 'Beruf' | 'Spezialisierung'
}

export interface FlattenedBerufNode extends BerufListNode {
  depth: number
  hasChildren: boolean
  isExpanded: boolean
}

// Utilities
export const filterHierarchicalData = (
  nodes: BerufListNode[],
  query: string
): BerufListNode[] => {
  if (!query.trim()) return nodes

  const normalizedQuery = query.toLowerCase().trim()

  const filterNode = (node: BerufListNode): BerufListNode | null => {
    const matches = node.title.toLowerCase().includes(normalizedQuery)
    const filteredChildren = node.children
      ?.map(filterNode)
      .filter((child): child is BerufListNode => child !== null)

    return matches || filteredChildren?.length
      ? { ...node, children: filteredChildren || node.children }
      : null
  }

  return nodes
    .map(filterNode)
    .filter((node): node is BerufListNode => node !== null)
}

export const flattenHierarchy = (
  nodes: BerufListNode[],
  expandedNodes: Set<string>,
  query: string,
  isExpandedOverride: boolean | null
): FlattenedBerufNode[] => {
  const result: FlattenedBerufNode[] = []

  const flattenNode = (node: BerufListNode, depth = 0) => {
    const hasChildren = !!node.children?.length
    const shouldAutoExpand = !!query.trim()
    const isExpanded =
      shouldAutoExpand ||
      (isExpandedOverride !== null
        ? isExpandedOverride
        : expandedNodes.has(node.id))

    result.push({ ...node, depth, hasChildren, isExpanded })

    if (hasChildren && isExpanded && node.children) {
      node.children.forEach((child) => flattenNode(child, depth + 1))
    }
  }

  nodes.forEach((node) => flattenNode(node))
  return result
}

// Virtual List Item Component
export const VirtualBerufListNode: FC<{
  item: FlattenedBerufNode
  toggleExpansion: (id: string) => void
  toggleBeruf: (item: string) => void
  style: React.CSSProperties
  isSelected: boolean
}> = ({ item, toggleBeruf, toggleExpansion, style, isSelected }) => {
  const { id, title, type, depth, hasChildren, isExpanded } = item
  const isSelectable = type === 'Beruf' || type === 'Spezialisierung'

  const handleClick = useCallback(() => {
    if (isSelectable) toggleBeruf(title)
  }, [isSelectable, title, toggleBeruf])

  const handleExpansion = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (hasChildren) toggleExpansion(id)
    },
    [hasChildren, id, toggleExpansion]
  )

  return (
    <div
      className={twMerge(
        'flex items-center gap-1 px-2 py-1',
        isSelectable && 'cursor-pointer hover:!bg-blue-100',
        isSelected && '!bg-blue-500 hover:!bg-blue-600'
      )}
      onClick={handleClick}
      style={{ ...style, paddingLeft: `${depth * 48 + 8}px` }}
    >
      {hasChildren ? (
        <ButtonTw size={ButtonSize.XSmall} secondary onClick={handleExpansion}>
          <PlusIcon
            className={twMerge(
              'size-5 transition-transform',
              isExpanded && 'rotate-45'
            )}
          />
        </ButtonTw>
      ) : (
        type !== 'Spezialisierung' && <div className="w-8" />
      )}

      <div className="flex flex-1 items-center justify-between px-1.5 py-1">
        <span
          className={twMerge(
            'truncate text-sm font-normal text-gray-900',
            isSelected && 'font-semibold text-white'
          )}
        >
          {title}
        </span>
        <span
          className={twMerge(
            'text-xs text-gray-600',
            isSelected && 'text-white'
          )}
        >
          {type}
        </span>
      </div>
    </div>
  )
}
