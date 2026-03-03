# 🎯 Платформа профорієнтаційного тестування

## 📋 Опис проекту

Веб-платформа для допомоги користувачам у визначенні свого професійного напрямку через систему інтерактивних багатомодульних тестів, AI-інтерпретацію результатів та платіжну інтеграцію.

---

## ✨ Основні функції

### Для користувачів:
- ✅ Реєстрація, вхід, скидання пароля
- ✅ Особистий кабінет з історією тестів
- ✅ Багатомодульне профорієнтаційне тестування
- ✅ AI-інтерпретація результатів (Google Gemini)
- ✅ Перегляд детального звіту з рекомендаціями
- ✅ Експорт результатів у PDF
- ✅ Оплата доступу через LiqPay

### Для адміністраторів:
- ✅ Панель управління користувачами
- ✅ Перегляд платежів та статусів доступу
- ✅ Перегляд тест-репортів будь-якого користувача
- ✅ Скидання результатів тестів

---

## 🏗️ Архітектура проекту

```
├── Frontend (Next.js 14 App Router)
│   ├── Лендінг, реєстрація/вхід, кабінет
│   ├── Проходження тестів (app/tests/[id]/)
│   ├── Перегляд результатів і рекомендацій
│   └── Адмін-панель (app/admin/)
│
├── Backend (Next.js API Routes)
│   ├── Аутентифікація (JWT + bcryptjs)
│   ├── Тести: відповіді, прогрес, результати
│   ├── AI-рекомендації (Google Gemini)
│   ├── Платежі (LiqPay callback/checkout)
│   └── Адмін-ендпоінти
│
└── Database (Prisma ORM)
    ├── SQLite — локальна розробка
    └── PostgreSQL — production
```

---

## 🛠️ Технологічний стек

| Шар | Технології |
|-----|-----------|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS |
| Backend | Next.js API Routes |
| ORM / БД | Prisma 5, SQLite (dev) / PostgreSQL (prod) |
| Auth | JWT (`jsonwebtoken`), bcryptjs |
| AI | Google Gemini (`@google/generative-ai`) |
| Платежі | LiqPay |
| Email | Nodemailer |
| PDF | html2canvas + jsPDF |
| Утиліти | axios, crypto-js |

---

## 📊 Схема даних (Prisma)

### User
```
id, fullName, email, password (hashed), phone, birthDate,
role ("user" | "admin"), isActive, resetToken, createdAt, updatedAt
```

### Test
```
id, title, description, category, price, duration, questionsCount, createdAt
```

### Question
```
id, testId, text, questionOrder, createdAt
```

### Payment
```
id, userId, testId, orderId, amount, currency,
type ("access"), status ("pending" | "success" | "failed"),
liqpayTransactionId, createdAt, completedAt, expiresAt
```

### TestAccess
```
id, userId, testId, paymentId, hasAccess, accessGrantedAt, accessExpiresAt
```

### TestResult
```
id, userId, testId,
data (JSON — відповіді по модулях),
scores (JSON — бали),
recommendations (JSON — AI-рекомендації),
completedAt
```

---

## 📝 API Endpoints

### Auth
```
POST   /api/auth/register              — Реєстрація
POST   /api/auth/login                 — Вхід
GET    /api/auth/me                    — Поточний користувач
POST   /api/auth/forgot-password       — Запит скидання пароля
POST   /api/auth/reset-password        — Скидання пароля
```

### Тести
```
GET    /api/tests/modules              — Список модулів тесту
POST   /api/tests/answers              — Зберегти відповіді
GET    /api/tests/[id]/progress        — Прогрес проходження
POST   /api/tests/[id]/complete        — Завершити тест
GET    /api/tests/[id]/results         — Результати тесту
POST   /api/tests/[id]/generate-recommendations — AI-рекомендації
```

### Користувач
```
GET    /api/user/tests                 — Тести користувача
```

### Платежі (LiqPay)
```
POST   /api/liqpay/checkout            — Оплата доступу до тесту
POST   /api/liqpay/callback            — Webhook від LiqPay
```

### Адмін
```
GET    /api/admin/users                — Список користувачів
GET    /api/admin/users/[id]           — Деталі користувача
GET    /api/admin/users/[id]/payments  — Платежі та доступи
GET    /api/admin/users/[id]/test-results         — Результати тестів
GET    /api/admin/users/[id]/test-report/[testId] — Повний тест-репорт
POST   /api/admin/users/[id]/reset-test           — Скинути результати
```

---

## 🔒 Безпека

- ✅ Хешування паролів (bcryptjs)
- ✅ JWT токени для аутентифікації
- ✅ Адмін-ендпоінти захищені перевіркою ролі
- ✅ Валідація вхідних даних на сервері

---

## 📱 UX Flow

```
Відвідувач → Головна сторінка
    ↓
Реєстрація / Вхід
    ↓
Особистий кабінет → Вибір тесту → Оплата доступу (LiqPay)
    ↓
Проходження тесту (багатомодульний, 8 модулів)
    ↓
Завершення тесту → Повернення до кабінету
    ↓
"Переглянути результати" → AI-генерація рекомендацій (Gemini, при першому відкритті)
    ↓
Детальний звіт + Експорт PDF
```

---

## 🧰 Корисні скрипти та міграції

Скрипти для локальних перевірок знаходяться в `scripts/`. Міграції — в `prisma/migrations` (зберігати в репозиторії).

```bash
# Локально (створити та застосувати міграції)
npx prisma migrate dev --name init

# На сервері
npx prisma migrate deploy

# Seed
npm run prisma:seed
```

Детальніше — у [SETUP.md](SETUP.md).

---

## 📄 Ліцензія

MIT License

---

**Статус проекту:** 🚀 MVP готовий, функціонал активно розвивається  
**Дата початку:** Лютий 2026
