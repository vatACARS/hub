import React from 'react'
import type { AppProps } from 'next/app'

import '../comp/index.css'

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

export default MyApp
