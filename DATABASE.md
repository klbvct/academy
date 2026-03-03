# 🗄️ Prisma ORM — база данных

Ниже актуальная информация по работе с Prisma в проекте и по фактической текущей конфигурации.

## 📊 Что есть в проекте

- ✅ `Prisma Client` — ORM для работы с БД
- ✅ Локальная dev-база (SQLite) — файл находится в `prisma/prisma/dev.db`
- ✅ Миграции — папка `prisma/migrations` с историей изменений
- ✅ Скрипт для посева `prisma/seed.ts` и команда `npm run prisma:seed`

---

## 📋 Структура таблиц в БД (по `schema.prisma`)

### Users (Пользователи)
```
- id: уникальный идентификатор
- fullName: полное имя
- email: электронная почта (уникальная)
- password: пароль (хешируется bcryptjs перед сохранением)
- phone: номер телефона (обязателен при регистрации)
- birthDate: дата рождения
- role: роль пользователя ("user" | "admin")
- isActive: статус аккаунта
- resetToken: токен для сброса пароля
- resetTokenExpires: срок действия токена сброса
- createdAt: дата создания аккаунта
- updatedAt: дата последнего обновления
```

### Tests (Тесты)
```
- id: ID теста
- title: название теста
- description: описание
- category: категория
- price: цена (для LiqPay)
- duration: длительность в минутах
- questionsCount: количество вопросов
```

### Questions (Вопросы)
```
- id: ID вопроса
- testId: связь с тестом
- text: текст вопроса
- questionOrder: порядковый номер
```

### Payments (Платежи - для LiqPay)
```
- id: ID платежа
- userId: пользователь
- testId: тест
- orderId: уникальный ID заказа
- amount: сумма
- currency: валюта (по умолчанию "UAH")
- type: тип платежа ("access" — доступ к тесту)
- status: статус ("pending" | "success" | "failed")
- liqpayTransactionId: ID транзакции LiqPay
- description: описание платежа
- createdAt: дата создания
- completedAt: дата завершения
- expiresAt: дата истечения доступа
```

### TestAccess (Доступ к тестам)
```
- id: ID доступа
- userId: пользователь
- testId: тест
- paymentId: связь с платежом
- hasAccess: есть ли доступ
- accessGrantedAt: когда выдан доступ
- accessExpiresAt: когда истекает доступ
```

### TestResult (Результаты тестов)
```
- id: ID результата
- userId: пользователь
- testId: тест
- data: ответы/данные (строка с JSON)
- scores: результаты (JSON строка)
- recommendations: рекомендации (JSON строка)
- completedAt: когда пройден
```

---

## 🛠️ Полезные команды Prisma

Локальная разработка (создание и применение миграции, открытие Studio):

```bash
# Создать/применить миграцию локально
npx prisma migrate dev --name init

# Открыть Prisma Studio (UI)
npx prisma studio
```

Сброс локальной БД (очистит данные и повторно применит миграции):

```bash
npx prisma migrate reset
```

Применение уже закоммиченных миграций на сервере (production):

```bash
npx prisma migrate deploy
```

---

## 💻 Примеры работы с Prisma в коде

### Создание пользователя:
```typescript
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

const hashedPassword = await bcrypt.hash('plaintextPassword', 12)

const user = await prisma.user.create({
  data: {
    fullName: 'Іван Петренко',
    email: 'ivan@example.com',
    phone: '+380501234567',
    password: hashedPassword, // всегда хешируйте перед сохранением
    birthDate: new Date('2005-01-15'),
  },
})
```

### Поиск пользователя:
```typescript
const user = await prisma.user.findUnique({
  where: { email: 'ivan@example.com' },
})
```

### Обновление пользователя:
```typescript
const updatedUser = await prisma.user.update({
  where: { id: 1 },
  data: { fullName: 'Новое имя' },
})
```

### Удаление пользователя:
```typescript
await prisma.user.delete({
  where: { id: 1 },
})
```

### Получение всех тестов:
```typescript
const tests = await prisma.test.findMany({
  include: { questions: true },
})
```

---

## ⚠️ ВАЖНО для продакшена

1. Хешируйте пароли: используйте `bcryptjs` при сохранении паролей в БД.

```bash
npm install bcryptjs
```

2. Текущее окружение по умолчанию использует SQLite (удобно для разработки). Для production рекомендуется PostgreSQL — измените datasource в `prisma/schema.prisma` и установите `DATABASE_URL`.

```env
DATABASE_URL="postgresql://user:password@host:5432/dbname"
```

3. На production применяйте миграции командой `npx prisma migrate deploy` (не используйте `db push` для production).

4. Настройте логирование ошибок на сервере.

---

## 📁 Структура файлов (фактическая)

```
prisma/
├── schema.prisma
├── prisma/
│   └── dev.db             # локальная dev sqlite БД
└── migrations/
  └── <timestamp>_init/

lib/
└── prisma.ts               # инициализация Prisma Client

.env                        # переменные окружения (DATABASE_URL и т.д.)
```

---

## 🔄 Рекомендации для production

1. Переключитесь на PostgreSQL — измените `provider` в `prisma/schema.prisma` и задайте `DATABASE_URL` в `.env`.
2. Примените миграции на сервере: `npx prisma migrate deploy`.
3. Убедитесь, что `prisma/migrations` есть в репозитории (не игнорируется `.gitignore`).

---

**Примечание:** сейчас проект использует реальную БД (SQLite) для разработки; для продакшена требуется перенос на производственную СУБД и применение миграций.
