'use client'

import { LoadingProvider } from '@/app/contexts/LoadingContext'
import { GlobalLoadingIndicator } from '@/app/components/GlobalLoadingIndicator'
import { ReactNode } from 'react'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <LoadingProvider>
      <GlobalLoadingIndicator />
      {children}
    </LoadingProvider>
  )
}
