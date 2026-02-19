'use client'

import { useEffect, useState } from 'react'
import { useLoading } from '@/app/contexts/LoadingContext'
import { usePathname, useSearchParams } from 'next/navigation'

export function GlobalLoadingIndicator() {
  const { isLoading, startLoading, stopLoading } = useLoading()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [progress, setProgress] = useState(0)

  // Отслеживание изменений маршрута
  useEffect(() => {
    stopLoading()
    setProgress(0)
  }, [pathname, searchParams, stopLoading])

  // Анимация прогресс-бара
  useEffect(() => {
    if (isLoading) {
      setProgress(0)
      const timer1 = setTimeout(() => setProgress(30), 100)
      const timer2 = setTimeout(() => setProgress(60), 300)
      const timer3 = setTimeout(() => setProgress(80), 600)
      
      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
        clearTimeout(timer3)
      }
    } else {
      setProgress(100)
      const timer = setTimeout(() => setProgress(0), 400)
      return () => clearTimeout(timer)
    }
  }, [isLoading])

  if (progress === 0) return null

  return (
    <>
      {/* Прогресс-бар сверху */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          zIndex: 9999,
          background: 'transparent',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            height: '100%',
            background: 'linear-gradient(90deg, #0c68f5 0%, #764ba2 100%)',
            width: `${progress}%`,
            transition: 'width 0.3s ease-out',
            boxShadow: '0 0 10px rgba(12, 104, 245, 0.5)',
          }}
        />
      </div>

      {/* Полупрозрачный оверлей с спиннером для долгих загрузок */}
      {isLoading && progress > 60 && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(255, 255, 255, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9998,
            animation: 'fadeIn 0.3s ease-in',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '50px',
                height: '50px',
                border: '4px solid #f3f4f6',
                borderTop: '4px solid #0c68f5',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 15px',
              }}
            />
            <p style={{ color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>
              Завантаження...
            </p>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  )
}
