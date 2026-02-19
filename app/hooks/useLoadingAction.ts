'use client'

import { useLoading } from '@/app/contexts/LoadingContext'
import { useCallback } from 'react'

/**
 * Хук для выполнения асинхронных операций с автоматическим индикатором загрузки
 * 
 * @example
 * ```tsx
 * const { executeWithLoading } = useLoadingAction()
 * 
 * const handleSubmit = async () => {
 *   await executeWithLoading(async () => {
 *     const response = await fetch('/api/data')
 *     const data = await response.json()
 *     return data
 *   })
 * }
 * ```
 */
export function useLoadingAction() {
  const { startLoading, stopLoading } = useLoading()

  const executeWithLoading = useCallback(
    async <T,>(action: () => Promise<T>): Promise<T> => {
      try {
        startLoading()
        const result = await action()
        return result
      } catch (error) {
        throw error
      } finally {
        stopLoading()
      }
    },
    [startLoading, stopLoading]
  )

  return { executeWithLoading, startLoading, stopLoading }
}

/**
 * Обертка для fetch с автоматическим индикатором загрузки
 * 
 * @example
 * ```tsx
 * const { fetchWithLoading } = useFetchWithLoading()
 * 
 * const data = await fetchWithLoading('/api/data', {
 *   method: 'POST',
 *   body: JSON.stringify({ id: 1 })
 * })
 * ```
 */
export function useFetchWithLoading() {
  const { executeWithLoading } = useLoadingAction()

  const fetchWithLoading = useCallback(
    async <T,>(url: string, options?: RequestInit): Promise<T> => {
      return executeWithLoading(async () => {
        const response = await fetch(url, options)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        return response.json()
      })
    },
    [executeWithLoading]
  )

  return { fetchWithLoading }
}
