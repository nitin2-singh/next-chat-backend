# 💬 Real-Time Chat Application

A **WhatsApp-like real-time chat application** built with **Next.js, Express, Socket.IO, Prisma, PostgreSQL, and Kafka**.

This project supports:

- 1-to-1 chats
- Realtime messaging
- Typing indicators
- Read receipts (✓ / ✓✓)
- Online presence (only when user joins a chat)
- Optimistic UI
- Secure JWT authentication

---

## 🧠 Architecture Overview

```
Frontend (Next.js)
│
│ REST APIs (JWT)
│ WebSocket (Socket.IO)
▼
Backend (Express + Socket.IO)
│
│ Prisma ORM
▼
PostgreSQL
│
│ Kafka (fan-out / async processing)
▼
Realtime Consumers
```

### Design Decisions

- **REST APIs** → persistence & data fetching
- **Socket.IO** → realtime UX (typing, read receipts, presence)
- **JWT** → shared auth for REST + WebSocket
- **Presence in memory** → NOT stored in DB
- **Kafka** → scalable message fan-out & async processing

---

## 🛠 Tech Stack

### Frontend

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS + shadcn/ui
- TanStack React Query
- Socket.IO Client

### Backend

- Node.js
- Express
- Socket.IO
- Prisma ORM
- PostgreSQL
- Kafka (KafkaJS)
- JWT Authentication

---

## 📂 Repository Structure

```
next-chat/
├── next-chat-frontend/
│ ├── app/
│ ├── components/
│ ├── hooks/
│ ├── lib/
│ └── types/
│
├── next-chat-backend/
│ ├── src/
│ │ ├── controllers/
│ │ ├── routes/
│ │ ├── middleware/
│ │ ├── config/
│ │ └── prisma/
│ └── prisma/
│
└── README.md
```

---

# 🚀 Setup Instructions

## 1️⃣ Backend Setup

### Go to backend

```bash
cd next-chat-backend
npm install

```

# Env file backend

```bash
PORT=4000
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/chat_db
JWT_SECRET=super-secret-change-this

KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=chat-backend

```

# Prisma command

```
npx prisma generate
npx prisma migrate dev
```

# Start server

```
npm run dev
docker compose up -d
```

# Frontend Setup

## Go to frontend

```
cd next-chat-frontend
```

## Install dependencies

```
npm install
```

## Env File

```
Environment Variables (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

## Start frontend

```
npm run dev
```
