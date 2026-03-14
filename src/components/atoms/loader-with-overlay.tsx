import React from 'react'

import LoaderTw, { LoaderProps, LoaderSize } from './loader-tw'

const LoaderWithOverlay = (props: LoaderProps) => (
  <>
    <div className="absolute top-0 left-0 z-40 flex h-full w-full rounded-lg bg-white/60"></div>
    <div className="sticky top-[450px] z-50 flex h-0 w-full items-center justify-center">
      <LoaderTw size={LoaderSize.XLarge} {...props} />
    </div>
  </>
)

LoaderWithOverlay.displayName = 'LoaderWithOverlay'

export default LoaderWithOverlay
