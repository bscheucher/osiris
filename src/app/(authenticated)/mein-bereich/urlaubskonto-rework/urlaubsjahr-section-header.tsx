export function UrlaubsjahrSectionHeader({
  title,
  range,
  variant,
}: {
  title: string
  range: string
  variant: 'current' | 'next'
}) {
  const badgeClass =
    variant === 'current'
      ? 'bg-orange-100 text-orange-700'
      : 'bg-green-100 text-ibis-emerald'

  return (
    <div className="mt-6 mb-2 flex items-center gap-3">
      <h2 className="text-[11px] font-semibold tracking-[0.6px] whitespace-nowrap text-gray-500 uppercase">
        {title}
      </h2>
      <div className="h-px flex-1 bg-gray-200" />
      <span
        className={`rounded-full px-3 py-1 text-[11px] font-semibold whitespace-nowrap ${badgeClass}`}
      >
        {range}
      </span>
    </div>
  )
}
