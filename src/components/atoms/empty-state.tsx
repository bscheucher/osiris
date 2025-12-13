import { TbDatabaseX } from 'react-icons/tb'

type EmptyStateProps = {
  text: string
  testId?: string
}

export default function EmptyState({ text, testId }: EmptyStateProps) {
  return (
    <div
      className="flex h-full flex-col items-center justify-center pt-20"
      data-testid={testId}
    >
      <TbDatabaseX className="text-ibis-blue mb-2 h-11 w-11" />
      <div className="">{text}</div>
    </div>
  )
}
