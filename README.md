# Remind 🔔

> An intelligent voice reminder platform where an AI agent calls you at scheduled times to deliver your reminders, and can dynamically reschedule or mark tasks as completed based on conversational voice responses.

## Architecture

This is a monorepo containing:
- **`landing-page/`**: Next.js (App Router) + Tailwind CSS v4. Marketing site, auth, onboarding and the dashboard.
- **`backend/`**: Express + Prisma (MongoDB) API, BullMQ scheduler on Redis, and Vapi voice calls over a Vobiz SIP trunk.

See [LAUNCH.md](LAUNCH.md) for the production setup checklist.

## Quick Start

```bash
docker run -d -p 6379:6379 redis:7   # the scheduler needs Redis
npm run dev:backend                  # API on :5000 (copy backend/.env.example to backend/.env first)
```

### Landing Page
```bash
# Run the landing page dev server
npm run dev:landing

# Or directly in the landing-page directory
cd landing-page
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.
