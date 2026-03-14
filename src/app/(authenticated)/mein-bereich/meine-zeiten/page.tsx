import dayjs from 'dayjs'
import { redirect } from 'next/navigation'

export default function Page() {
  // catch all route
  const thisMonth = dayjs().format('YYYY-MM')
  // always redirect to
  redirect(`/mein-bereich/meine-zeiten/${thisMonth}`)
}
