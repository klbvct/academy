# Примеры миграции на глобальную систему загрузки

## Пример 1: Страница Dashboard с карточками тестов

### До (локальная загрузка):

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function TestCard({ testId, completed }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleViewResults = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/tests/${testId}/results`)
      if (response.ok) {
        router.push(`/tests/${testId}/results`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={handleViewResults} disabled={loading}>
      {loading ? 'Завантаження...' : 'Переглянути результати'}
    </button>
  )
}
```

### После (с глобальным индикатором):

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLoadingAction } from '@/app/hooks/useLoadingAction'

export default function TestCard({ testId, completed }: Props) {
  const [localLoading, setLocalLoading] = useState(false)
  const { executeWithLoading } = useLoadingAction()
  const router = useRouter()

  const handleViewResults = async () => {
    setLocalLoading(true)
    await executeWithLoading(async () => {
      const response = await fetch(`/api/tests/${testId}/results`)
      if (response.ok) {
        router.push(`/tests/${testId}/results`)
      }
    })
    setLocalLoading(false)
  }

  return (
    <button onClick={handleViewResults} disabled={localLoading}>
      {localLoading ? (
        <>
          <span className="animate-spin mr-2">⟳</span>
          Завантаження...
        </>
      ) : (
        'Переглянути результати'
      )}
    </button>
  )
}
```

**Преимущества:**
- ✅ Глобальный прогресс-бар сверху для всех пользователей
- ✅ Локальный индикатор на кнопке для точности
- ✅ Предотвращение повторных нажатий

---

## Пример 2: Форма с отправкой данных

### До:

```tsx
'use client'

import { useState } from 'react'

export default function RegistrationForm() {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await fetch('/api/register', {
        method: 'POST',
        body: JSON.stringify(formData)
      })
  }

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit" disabled={loading}>
        {loading ? 'Відправка...' : 'Зареєструватися'}
      </button>
    </form>
  )
}
```

### После:

```tsx
'use client'

import { useState } from 'react'
import { useLoadingAction } from '@/app/hooks/useLoadingAction'

export default function RegistrationForm() {
  const [submitting, setSubmitting] = useState(false)
  const { executeWithLoading } = useLoadingAction()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    await executeWithLoading(async () => {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(formData)
      })
      
      if (!response.ok) throw new Error('Registration failed')
      
      // Показать успешное сообщение (используйте свой механизм уведомлений)
      console.log('Реєстрація успішна!')
    })
    
    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit" disabled={submitting}>
        {submitting ? 'Відправка...' : 'Зареєструватися'}
      </button>
    </form>
  )
}
```

---

## Пример 3: Простая навигация

### До:

```tsx
'use client'

import { useRouter } from 'next/navigation'

export default function BackButton() {
  const router = useRouter()

  return (
    <button onClick={() => router.push('/dashboard')}>
      Назад
    </button>
  )
}
```

### После:

```tsx
'use client'

import { useRouter } from 'next/navigation'
import { useLoading } from '@/app/contexts/LoadingContext'

export default function BackButton() {
  const router = useRouter()
  const { startLoading } = useLoading()

  const handleBack = () => {
    startLoading()
    router.push('/dashboard')
  }

  return (
    <button onClick={handleBack}>
      Назад
    </button>
  )
}
```

---

## Пример 4: Загрузка данных при монтировании

### До:

```tsx
'use client'

import { useEffect, useState } from 'react'

export default function ResultsPage({ params }: Props) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/tests/${params.id}/results`)
        const json = await response.json()
        setData(json)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [params.id])

  if (loading) return <div>Завантаження...</div>

  return <div>{/* Render data */}</div>
}
```

### После:

```tsx
'use client'

import { useEffect, useState } from 'react'
import { useFetchWithLoading } from '@/app/hooks/useLoadingAction'

export default function ResultsPage({ params }: Props) {
  const [data, setData] = useState(null)
  const { fetchWithLoading } = useFetchWithLoading()

  useEffect(() => {
    const loadData = async () => {
      try {
        const json = await fetchWithLoading(`/api/tests/${params.id}/results`)
        setData(json)
      } catch (error) {
        console.error('Failed to load results:', error)
      }
    }
    loadData()
  }, [params.id, fetchWithLoading])

  // Теперь глобальный индикатор показывает состояние загрузки
  if (!data) return null

  return <div>{/* Render data */}</div>
}
```

---

## Пример 5: Множественные одновременные операции

### До:

```tsx
'use client'

import { useState } from 'react'

export default function BatchOperations() {
  const [loading1, setLoading1] = useState(false)
  const [loading2, setLoading2] = useState(false)
  const [loading3, setLoading3] = useState(false)

  const operation1 = async () => {
    setLoading1(true)
    await fetch('/api/operation1')
    setLoading1(false)
  }

  const operation2 = async () => {
    setLoading2(true)
    await fetch('/api/operation2')
    setLoading2(false)
  }

  return (
    <div>
      <button onClick={operation1} disabled={loading1}>
        Операція 1 {loading1 && '...'}
      </button>
      <button onClick={operation2} disabled={loading2}>
        Операція 2 {loading2 && '...'}
      </button>
    </div>
  )
}
```

### После:

```tsx
'use client'

import { useState } from 'react'
import { useLoadingAction } from '@/app/hooks/useLoadingAction'

export default function BatchOperations() {
  const [activeButton, setActiveButton] = useState<string | null>(null)
  const { executeWithLoading } = useLoadingAction()

  const createOperation = (id: string, endpoint: string) => async () => {
    setActiveButton(id)
    await executeWithLoading(async () => {
      await fetch(endpoint)
    })
    setActiveButton(null)
  }

  const operation1 = createOperation('op1', '/api/operation1')
  const operation2 = createOperation('op2', '/api/operation2')

  return (
    <div>
      <button onClick={operation1} disabled={activeButton === 'op1'}>
        Операція 1 {activeButton === 'op1' && '⟳'}
      </button>
      <button onClick={operation2} disabled={activeButton === 'op2'}>
        Операція 2 {activeButton === 'op2' && '⟳'}
      </button>
    </div>
  )
}
```

---

## Чек-лист миграции

При миграции существующего компонента:

- [ ] Импортировать `useLoadingAction` или `useLoading`
- [ ] Обернуть асинхронные операции в `executeWithLoading`
- [ ] Сохранить локальное состояние для UI кнопки (опционально)
- [ ] Убрать дублирующиеся полноэкранные лоадеры
- [ ] Протестировать навигацию и индикаторы
- [ ] Проверить обработку ошибок

## Рекомендации

1. **Используйте оба индикатора** (глобальный + локальный) для лучшего UX
2. **Глобальный** показывает, что приложение работает
3. **Локальный** показывает, какая именно кнопка активна
4. **Не дублируйте** полноэкранные оверлеи - используйте только глобальный
