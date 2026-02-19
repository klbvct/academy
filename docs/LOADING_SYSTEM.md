# Глобальная система индикации загрузки

## Обзор

Реализована глобальная система индикации загрузки для улучшения пользовательского опыта. Система автоматически показывает:
- **Прогресс-бар сверху** - тонкая сине-фиолетовая полоса (градиент `#0c68f5 → #764ba2`) для быстрых операций
- **Полноэкранный индикатор** - появляется при длительных загрузках (>600мс)

## Структура файлов

```
app/
├── contexts/
│   └── LoadingContext.tsx          # React Context для управления состоянием загрузки
├── components/
│   ├── GlobalLoadingIndicator.tsx  # Визуальный компонент индикатора
│   └── AppProviders.tsx            # Обертка всех провайдеров
├── hooks/
│   └── useLoadingAction.ts         # Хуки для удобного использования
└── layout.tsx                      # Обновлен для включения провайдеров
```

## Использование

### 1. Базовое использование с хуком useLoading

```tsx
'use client'

import { useLoading } from '@/app/contexts/LoadingContext'
import { useRouter } from 'next/navigation'

export default function MyComponent() {
  const { startLoading, stopLoading } = useLoading()
  const router = useRouter()

  const handleNavigation = async () => {
    startLoading()
    try {
      // Ваша логика
      await fetchSomeData()
      router.push('/results')
    } finally {
      stopLoading()
    }
  }

  return <button onClick={handleNavigation}>Перейти</button>
}
```

### 2. Использование хука useLoadingAction (Рекомендуется)

```tsx
'use client'

import { useLoadingAction } from '@/app/hooks/useLoadingAction'

export default function MyComponent() {
  const { executeWithLoading } = useLoadingAction()

  const handleSubmit = async () => {
    await executeWithLoading(async () => {
      const response = await fetch('/api/tests/submit', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      return response.json()
    })
  }

  return <button onClick={handleSubmit}>Отправить</button>
}
```

### 3. Использование хука useFetchWithLoading

```tsx
'use client'

import { useFetchWithLoading } from '@/app/hooks/useLoadingAction'
import { useState } from 'react'

export default function TestResults() {
  const { fetchWithLoading } = useFetchWithLoading()
  const [results, setResults] = useState(null)

  const loadResults = async () => {
    try {
      const data = await fetchWithLoading('/api/tests/123/results')
      setResults(data)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <div>
      <button onClick={loadResults}>Загрузить результаты</button>
      {results && <div>{/* Отображение результатов */}</div>}
    </div>
  )
}
```

### 4. Использование с навигацией

```tsx
'use client'

import { useLoadingAction } from '@/app/hooks/useLoadingAction'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Navigation() {
  const { startLoading } = useLoadingAction()
  const router = useRouter()

  // При программной навигации
  const handleProgrammaticNav = () => {
    startLoading()
    router.push('/dashboard')
    // stopLoading вызовется автоматически при смене маршрута
  }

  // При использовании Link - индикатор НЕ появится автоматически
  // Если нужен индикатор, используйте onClick
  return (
    <div>
      <button onClick={handleProgrammaticNav}>
        Программная навигация
      </button>
      
      <Link 
        href="/dashboard"
        onClick={startLoading}
      >
        Навигация с Link
      </Link>
    </div>
  )
}
```

### 5. Использование в Server Actions

> ⚠️ Пример ниже демонстрирует паттерн — файл `@/app/actions/testActions` не существует в проекте. Создайте свой Server Action и используйте этот паттерн.

```tsx
'use client'

import { useLoadingAction } from '@/app/hooks/useLoadingAction'
import { submitTestAction } from '@/app/actions/testActions'

export default function TestForm() {
  const { executeWithLoading } = useLoadingAction()

  const handleSubmit = async (formData: FormData) => {
    await executeWithLoading(async () => {
      await submitTestAction(formData)
    })
  }

  return (
    <form action={handleSubmit}>
      <button type="submit">Отправить тест</button>
    </form>
  )
}
```

### 6. Комбинирование с локальным состоянием загрузки

Для кнопок с собственным индикатором загрузки:

```tsx
'use client'

import { useLoadingAction } from '@/app/hooks/useLoadingAction'
import { useState } from 'react'

export default function TestCard() {
  const { executeWithLoading } = useLoadingAction()
  const [localLoading, setLocalLoading] = useState(false)

  const handleStart = async () => {
    setLocalLoading(true)
    await executeWithLoading(async () => {
      await fetch('/api/tests/start', { method: 'POST' })
    })
    setLocalLoading(false)
  }

  return (
    <button 
      onClick={handleStart}
      disabled={localLoading}
      className="px-4 py-2 bg-blue-600 text-white rounded"
    >
      {localLoading ? (
        <>
          <span className="animate-spin mr-2">⟳</span>
          Завантаження...
        </>
      ) : (
        'Почати тест'
      )}
    </button>
  )
}
```

## Особенности работы

### Автоматическая остановка при смене маршрута
Индикатор автоматически останавливается при изменении `pathname` или `searchParams`.

### Двухуровневая индикация
1. **Быстрая загрузка (0-600мс)**: Показывается только прогресс-бар сверху
2. **Длительная загрузка (>600мс)**: Добавляется полноэкранный оверлей со спиннером

### Плавная анимация
- Прогресс-бар плавно заполняется: 0% → 30% → 60% → 80% → 100%
- Fade-in анимация для оверлея
- Smooth transition при завершении

## Когда использовать

✅ **Используйте глобальный индикатор:**
- Навигация между страницами
- Загрузка данных с сервера
- Отправка форм
- Длительные операции (>500мс)
- API запросы

❌ **НЕ используйте глобальный индикатор:**
- Для мгновенных операций (<200мс)
- Когда нужен локальный индикатор на конкретной кнопке
- Для операций, которые не должны блокировать UI

## Стилизация

Чтобы изменить цвета или стиль индикатора, отредактируйте:
- `app/components/GlobalLoadingIndicator.tsx` - основной компонент
- Цвета градиента: `#0c68f5` и `#764ba2`
- Высота прогресс-бара: `3px`
- Таймауты: `100ms`, `300ms`, `600ms`

## Совместимость

- ✅ Next.js 14+ App Router
- ✅ React 18+
- ✅ TypeScript
- ✅ Client Components
- ✅ Server Actions

## Производительность

- Минимальное влияние на производительность
- Использует CSS transitions вместо JavaScript анимаций
- Автоматическая очистка таймеров
- Оптимизированные re-renders с useCallback
