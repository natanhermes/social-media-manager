'use client'

import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'sonner'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Toaster richColors position="top-right" duration={2000} />
      {children}
    </SessionProvider>
  )
}
