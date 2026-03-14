import { screen, waitFor } from '@testing-library/react'
import { JSX } from 'react'

import { renderWithIntl } from '@/../jest.setup'

export async function renderAndWaitForLoaderGone(page: JSX.Element) {
  renderWithIntl(page)
  await waitFor(() =>
    expect(screen.queryByTestId('loader')).not.toBeInTheDocument()
  )
}
