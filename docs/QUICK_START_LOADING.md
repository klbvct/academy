# Быстрый старт: Глобальная система загрузки

## ✅ Система уже установлена и работает!

Глобальная система индикации загрузки уже интегрирована в приложение и работает автоматически при навигации.

---

## 🚀 Как использовать в своих компонентах

### Вариант 1: Самый простой (для навигации)

```tsx
'use client'

import { useLoading } from '@/app/contexts/LoadingContext'
import { useRouter } from 'next/navigation'

export default function MyButton() {
  const { startLoading } = useLoading()
  const router = useRouter()

  return (
    <button onClick={() => {
      startLoading()
      router.push('/results')
    }}>
      Перейти к результатам
    </button>
  )
}
```

### Вариант 2: Рекомендуемый (для асинхронных операций)

```tsx
'use client'

import { useLoadingAction } from '@/app/hooks/useLoadingAction'

export default function MyButton() {
  const { executeWithLoading } = useLoadingAction()

  const handleClick = async () => {
    await executeWithLoading(async () => {
      const response = await fetch('/api/data')
      const data = await response.json()
      // Ваша логика
    })
  }

  return <button onClick={handleClick}>Загрузить данные</button>
}
```

### Вариант 3: Продвинутый (с локальным индикатором)

```tsx
'use client'

import { useState } from 'react'
import { useLoadingAction } from '@/app/hooks/useLoadingAction'

export default function MyButton() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { executeWithLoading } = useLoadingAction()

  const handleSubmit = async () => {
    setIsSubmitting(true)
    await executeWithLoading(async () => {
      await fetch('/api/submit', { method: 'POST' })
    })
    setIsSubmitting(false)
  }

  return (
    <button onClick={handleSubmit} disabled={isSubmitting}>
      {isSubmitting ? '⟳ Завантаження...' : 'Відправити'}
    </button>
  )
}
```

---

## 📋 Шпаргалка по импортам

```tsx
// Базовый контроль загрузки
import { useLoading } from '@/app/contexts/LoadingContext'
const { startLoading, stopLoading, isLoading } = useLoading()

// Для асинхронных операций (рекомендуется)
import { useLoadingAction } from '@/app/hooks/useLoadingAction'
const { executeWithLoading, startLoading, stopLoading } = useLoadingAction()

// Для fetch запросов
import { useFetchWithLoading } from '@/app/hooks/useLoadingAction'
const { fetchWithLoading } = useFetchWithLoading()
```

---

## 🎯 Когда использовать

| Сценарий | Решение | Код |
|----------|---------|-----|
| Навигация между страницами | `startLoading()` | `startLoading(); router.push('/page')` |
| API запрос | `executeWithLoading()` | `await executeWithLoading(() => fetch('/api'))` |
| Fetch запрос | `fetchWithLoading()` | `await fetchWithLoading('/api/data')` |
| Отправка формы | `executeWithLoading()` + локальный state | См. Вариант 3 выше |

---

## 📁 Созданные файлы

```
app/
├── contexts/
│   └── LoadingContext.tsx               # ✨ Context для управления
├── components/
│   ├── GlobalLoadingIndicator.tsx       # 🎨 Визуальный компонент
│   └── AppProviders.tsx                 # 🔧 Провайдер приложения
├── hooks/
│   └── useLoadingAction.ts              # 🎣 Удобные хуки
└── layout.tsx                           # ✅ Обновлен (включен провайдер)

docs/
├── LOADING_SYSTEM.md                    # 📖 Полная документация
└── LOADING_MIGRATION_EXAMPLES.md        # 📝 Примеры миграции
```

---

## 🔍 Что происходит визуально

1. **При быстрых операциях (0–600мс):**
   - Появляется тонкий прогресс-бар (сине-фиолетовый градиент) сверху экрана
   - Таймеры: 100мс → 30%, 300мс → 60%, 600мс → 80%
   - Плавно заполняется и исчезает

2. **При длительных операциях (progress > 60%, после ~600мс):**
   - Прогресс-бар сверху
   - + Полупрозрачный оверлей с спиннером по центру
   - + Текст "Завантаження..."

---

## ⚡ Автоматические возможности

- ✅ Автоматически останавливается при смене маршрута
- ✅ Плавные CSS анимации (без JavaScript)
- ✅ Предотвращает повторные запуски
- ✅ Не блокирует UI для быстрых операций
- ✅ TypeScript поддержка из коробки

---

## 🎨 Настройка стилей

Чтобы изменить цвета, откройте:
**`app/components/GlobalLoadingIndicator.tsx`**

```tsx
// Цвет прогресс-бара (сине-фиолетовый градиент)
background: 'linear-gradient(90deg, #0c68f5 0%, #764ba2 100%)'

// Цвет спиннера
borderTop: '4px solid #0c68f5'
```

---

## 🐛 Устранение проблем

**Индикатор не появляется?**
- Убедитесь, что компонент Client Component (`'use client'`)
- Проверьте, что вызываете `startLoading()` или `executeWithLoading()`

**Индикатор не исчезает?**
- Убедитесь, что вызываете `stopLoading()` в finally блоке
- Или используйте `executeWithLoading()` - он автоматически останавливает

**Нужна помощь?**
- Полная документация: `docs/LOADING_SYSTEM.md`
- Примеры миграции: `docs/LOADING_MIGRATION_EXAMPLES.md`

---

## ✨ Готово к использованию!

Система уже работает. Попробуйте перейти на любую страницу - увидите прогресс-бар сверху. 

Теперь просто добавьте `useLoadingAction()` в свои компоненты для улучшения UX! 🚀
