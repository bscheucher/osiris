import { redirect } from 'next/navigation'

export default function Page() {
  // catch all route

  // always redirect to
  redirect('/teilnehmer/verwalten')
}
