import React from 'react'

import LoaderTw, { LoaderProps, LoaderSize } from './loader-tw'

const LoaderWithSpacer = (props: LoaderProps) => (
  <div className="flex h-[760px] items-center justify-center">
    <LoaderTw size={LoaderSize.XLarge} {...props} />
  </div>
)

LoaderWithSpacer.displayName = 'LoaderWithSpacer'

export default LoaderWithSpacer
