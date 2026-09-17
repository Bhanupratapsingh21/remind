# Remind 🔔

> An intelligent voice reminder platform where an AI agent calls you at scheduled times to deliver your reminders, and can dynamically reschedule or mark tasks as completed based on conversational voice responses.

## Architecture

This is a monorepo containing:
- **`landing-page/`**: Next.js 15+ (App Router) + Tailwind CSS v4 + shadcn/ui.
- **`dashboard/`**: *(Planned)* User portal for managing phone numbers, tasks, reminder schedules, and call logs.
- **`backend/`**: *(Planned)* API server, scheduler, telephony/voice AI service (e.g. Twilio / LiveKit / Vapi / Retell / OpenAI Realtime).

## Quick Start

### Landing Page
```bash
# Run the landing page dev server
npm run dev:landing

# Or directly in the landing-page directory
cd landing-page
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.
