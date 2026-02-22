# 🧠 Prompt: Implement a Minimal “Italian Daily Trainer” in an Existing Next.js App

You are a senior full-stack engineer working inside an already-generated **Next.js (App Router) + TypeScript** project.

Your task is to implement a **deliberately minimal** feature set that helps a single user follow a structured daily Italian-learning schedule.

This is **NOT** a language-learning platform.
It is a **daily execution assistant** that organizes tasks and sends SMS reminders.

Avoid overengineering at all costs.

---

## 🎯 Product Goal

Provide one clear answer each day:

> “What should I do today, and in what order?”

The system:

* Displays today’s learning agenda
* Lets the user mark tasks complete
* Tracks progress
* Sends a daily SMS reminder via Twilio

The system does **NOT**:

* Teach Italian
* Generate lessons
* Replace Anki
* Implement spaced repetition
* Store vocabulary
* Use AI features

---

## 🧱 Tech Constraints

Use only:

* Next.js App Router
* TypeScript
* Tailwind (if already installed)
* Prisma ORM
* SQLite (local dev DB)
* Twilio for SMS
* Vercel Cron (or compatible cron trigger)

Do not introduce additional frameworks.

---

## 📦 Feature Scope (MVP Only)

### 1️⃣ Today Page (`/today`)

Mobile-first page showing:

Header:

```
Week 1 — Essere
Day 3
```

Checklist (tap to complete):

* Review (5m)
* Learn (10m)
* Build Sentences (10m)
* Speak (5m)

Each item:

* Toggle complete/incomplete
* Persist state in DB

Also display:

* Today’s practice sentences (read-only)
* Button: “Open Anki”

---

### 2️⃣ Progress Persistence

Track completion by **date**, not by lesson ID.

If user completes today:
store record keyed by `YYYY-MM-DD`.

---

### 3️⃣ Static Learning Plan (No CMS)

Create:

```
/plans/month1.json
```

This file defines the entire schedule.

The app must **read from this JSON only**.
No admin UI.

---

### Example Plan Shape

```json
{
  "weeks": [
    {
      "title": "Week 1 — Essere",
      "days": [
        {
          "title": "Day 1",
          "sentences": ["Io sono felice.", "Sono a casa."],
          "agenda": [
            { "key": "review", "label": "Review", "minutes": 5 },
            { "key": "learn", "label": "Learn essere", "minutes": 10 },
            { "key": "sentences", "label": "Build sentences", "minutes": 10 },
            { "key": "speak", "label": "Speak aloud", "minutes": 5 }
          ]
        }
      ]
    }
  ]
}
```

---

### 4️⃣ Prisma Schema

Implement only these models:

```prisma
model User {
  id          String   @id @default(cuid())
  phone       String?  @unique
  timezone    String   @default("America/Chicago")
  smsEnabled  Boolean  @default(false)
  createdAt   DateTime @default(now())

  progress    ProgressDay[]
}

model ProgressDay {
  id        String   @id @default(cuid())
  userId    String
  dateKey   String   // "2026-02-21"

  review    Boolean  @default(false)
  learn     Boolean  @default(false)
  sentences Boolean  @default(false)
  speak     Boolean  @default(false)

  user User @relation(fields: [userId], references: [id])
  @@unique([userId, dateKey])
}

model SmsLog {
  id        String   @id @default(cuid())
  to        String
  body      String
  sentAt    DateTime @default(now())
}
```

Do not add roles, auth tables, or multi-user complexity.

Assume **single-user mode**.

---

### 5️⃣ Daily SMS Reminder (Twilio)

Create:

```
/api/cron/daily
```

This endpoint:

1. Loads today’s plan
2. Builds a short agenda message
3. Sends SMS via Twilio
4. Logs the message

Message format:

```
🇮🇹 Italian Training — Week 1 Day 3

• Review (5m)
• Learn (10m)
• Build Sentences (10m)
• Speak (5m)

Start with: Io sono felice.
```

---

### 6️⃣ Twilio Utility

Create a small wrapper:

```
/lib/twilio.ts
```

Use:

```
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_MESSAGING_SERVICE_SID
```

Do not expose Twilio client to the frontend.

---

### 7️⃣ Cron Configuration

System should assume:

* Cron runs once daily (morning)
* No complex scheduling logic
* No timezone math for MVP

---

## 🚫 Explicit Non-Goals

Do NOT implement:

* Authentication UI
* Flashcard system
* Lesson editor
* Admin dashboard
* Gamification
* AI integrations
* Push notifications
* Multi-language support

This is intentionally a **small personal tool**.

---

## ✅ Deliverables Expected from You

1. All Prisma models + migration
2. `/today` page UI
3. Plan loader utility
4. Progress persistence logic
5. Twilio sender
6. Daily cron endpoint
7. Clean, readable code with comments explaining decisions

---

## 🧭 Engineering Philosophy

Optimize for:

* Clarity over flexibility
* Static structure over configurability
* Boring reliability over extensibility

This system should feel like a checklist, not a platform.

---

If you are unsure whether to add something:

**Do less.**

