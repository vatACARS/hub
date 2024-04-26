import React from 'react'
import { useRouter } from "next/router";
import type { AppProps } from 'next/app'

import Header from "../comp/meta/Header";
import '../comp/index.css'

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  return (
    <main className="prevent-select h-screen overflow-hidden bg-slate-900">
      {router.asPath != "/" && <Header maximiseDisabled={router.asPath == "/welcome/"} />}
      <Component {...pageProps} />
    </main>
  );
}

export default MyApp
