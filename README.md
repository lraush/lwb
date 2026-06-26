# ⚖️ lifeWorkBalances — Персональный ИИ-ассистент

Полноценная SaaS-платформа на микросервисной архитектуре для управления работой, учёбой и личной жизнью.

## 🏗️ Архитектура

```
┌─────────────────────────────────────────────────────┐
│                    Браузер / Desktop                 │
└─────────────────────┬───────────────────────────────┘
                      │ :80
┌─────────────────────▼───────────────────────────────┐
│              Nginx API Gateway                       │
│  /         → Frontend (React + Vite)                │
│  /api/auth → Auth Service      :3001                │
│  /api/tasks → Task Service     :3002                │
│  /api/calendar → Calendar      :3003                │
│  /api/finance  → Finance       :3004                │
│  /api/learning → Learning      :3005                │
│  /api/health   → Health        :3006                │
│  /api/events   → Events        :3007                │
│  /api/files    → File Service  :3008                │
│  /api/ai       → AI Service    :8000 (Python)       │
└─────────────────────────────────────────────────────┘
         │              │               │
    PostgreSQL x7    MinIO S3       OpenAI API
```

## 🚀 Быстрый старт

### 1. Требования

- Docker Desktop 24+
- Docker Compose 2.24+
- 8GB RAM (рекомендуется 16GB)

### 2. Клонирование и настройка

```bash
git clone <your-repo>
cd lifeworkbalances

# Скопируй и заполни .env
cp .env.example .env

# Обязательно: JWT_SECRET (любая строка 32+ символа)
# Опционально: OPENAI_API_KEY (для ИИ-функций)
```

### 3. Запуск

```bash
# Первый запуск (сборка занимает 5-10 мин)
docker-compose up --build

# Последующие запуски
docker-compose up

# В фоне
docker-compose up -d
```

### 4. Открыть в браузере

```
http://localhost
```

**Демо-доступ:** `demo@lwb.app` / `demo1234`

---

## 📁 Структура проекта

```
lifeworkbalances/
├── frontend/                    # React 18 + Vite + Tailwind
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard/       # Главная страница
│   │   │   ├── Work/            # Kanban-доска задач
│   │   │   ├── Finance/         # Финансы + графики
│   │   │   ├── Learning/        # Роадмапы + карточки
│   │   │   ├── Health/          # Здоровье + привычки
│   │   │   ├── Sports/          # Тренировки
│   │   │   ├── Travel/          # Путешествия
│   │   │   ├── Media/           # Книги + фильмы
│   │   │   ├── AI/              # ИИ-ассистент
│   │   │   └── Shared/          # Layout, компоненты
│   │   ├── store/               # Zustand state
│   │   ├── utils/               # API клиент
│   │   └── pages/               # LoginPage
│   └── Dockerfile
│
├── backend/
│   ├── auth-service/            # JWT аутентификация     :3001
│   ├── task-service/            # Kanban задачи          :3002
│   ├── calendar-service/        # Календарь событий      :3003
│   ├── finance-service/         # Финансы                :3004
│   ├── learning-service/        # Роадмапы + сессии      :3005
│   ├── health-service/          # Здоровье + привычки    :3006
│   ├── events-service/          # Спорт + медиа          :3007
│   ├── file-service/            # MinIO S3 хранилище     :3008
│   └── ai-service/              # Python FastAPI + GPT   :8000
│
├── nginx/
│   └── nginx.conf               # API Gateway
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🔧 Настройка ИИ

### OpenAI (рекомендуется)

```env
OPENAI_API_KEY=sk-...
```

Используется: GPT-4o-mini (чат), Whisper (голос), GPT-4o Vision (экран)

### Без API ключа

Приложение работает в демо-режиме с заготовленными ответами.

---

## 🛠️ Разработка без Docker

### Frontend

```bash
cd frontend
npm install
npm run dev
# http://localhost:5173
```

### Backend (отдельный сервис)

```bash
cd backend/auth-service
npm install
npx prisma migrate dev
npm run dev
```

### AI Service

```bash
cd backend/ai-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

---

## 📡 API Endpoints

### Auth Service (:3001)

| Method | Path      | Описание         |
| ------ | --------- | ---------------- |
| POST   | /register | Регистрация      |
| POST   | /login    | Вход             |
| GET    | /me       | Профиль          |
| PUT    | /me       | Обновить профиль |

### Task Service (:3002)

| Method | Path   | Описание        |
| ------ | ------ | --------------- |
| GET    | /      | Список задач    |
| POST   | /      | Создать задачу  |
| PATCH  | /:id   | Обновить задачу |
| DELETE | /:id   | Удалить задачу  |
| GET    | /stats | Статистика      |

### AI Service (:8000)

| Method | Path            | Описание         |
| ------ | --------------- | ---------------- |
| POST   | /chat           | Чат с ИИ         |
| POST   | /transcribe     | Голос → текст    |
| POST   | /analyze-screen | Анализ скриншота |
| POST   | /generate-pdf   | Генерация PDF    |

---

## 🔒 Безопасность

- JWT токены с 30-дневным сроком
- Раздельные PostgreSQL БД для каждого сервиса
- Rate limiting через Nginx (60 req/min API, 20 req/min AI)
- Валидация входных данных на всех эндпоинтах
- Изоляция данных по userId на уровне БД

---

## 🐛 Частые проблемы

**Порт 80 занят:**

```bash
# Найти процесс
lsof -i :80
# Изменить порт в docker-compose.yml: "8080:80"
```

**Миграции не применились:**

```bash
docker-compose exec auth-service npx prisma migrate deploy
```

**Очистить всё и начать заново:**

```bash
docker-compose down -v
docker-compose up --build
```

**Логи конкретного сервиса:**

```bash
docker-compose logs -f ai-service
docker-compose logs -f auth-service
```

---

## 🗺️ Роадмап

- [ ] Telegram-бот интеграция
- [ ] PWA (офлайн-режим)
- [ ] Экспорт данных в PDF/CSV
- [ ] Тёмная/светлая тема
- [ ] Mobile приложение (React Native)
- [ ] Интеграция с Google Calendar
- [ ] Pomodoro таймер
- [ ] Аналитика продуктивности

---

## 📄 Лицензия

MIT — личный проект, свободное использование.
