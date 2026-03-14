import { useTranslations } from 'next-intl'
import { HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi'

interface Props {
  entries: number
  index: number

  valueChanged: (n: number) => void
}

export default function Pagination({ entries, index, valueChanged }: Props) {
  const t = useTranslations('components.pagination')
  const handlePageChange = (pageNumber: number) => {
    valueChanged(index + pageNumber)
  }
  // we disable the buttons if we have no entries
  const disableLeft = !entries || index == 0
  const disableRight = !entries || index == entries - 1
  return (
    <div className="flex flex-row items-center justify-center gap-8">
      <span>{entries == 0 ? 0 : index + 1}</span>
      <span>{t('von')}</span>
      <span>{entries}</span>
      <button
        disabled={disableLeft}
        onClick={() => handlePageChange(-1)}
        className={disableLeft ? 'cursor-not-allowed' : ''}
        aria-label="left-arrow-button"
      >
        <HiOutlineChevronLeft
          className={
            'hover:bg-ibis-gray-light flex h-6 w-6 items-center justify-center ' +
            (disableLeft ? 'text-ibis-gray-light' : 'text-ibis-blue')
          }
        />
      </button>
      <button
        disabled={disableRight}
        onClick={() => handlePageChange(+1)}
        className={disableRight ? 'cursor-not-allowed' : ''}
        aria-label="right-arrow-button"
      >
        <HiOutlineChevronRight
          className={
            'hover:bg-ibis-gray-light flex h-6 w-6 items-center justify-center ' +
            (disableRight ? 'text-ibis-gray-light' : 'text-ibis-blue')
          }
        />
      </button>
    </div>
  )
}
