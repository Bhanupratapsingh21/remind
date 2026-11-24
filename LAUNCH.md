# Launch checklist

Step-by-step setup for Vapi, Vobiz, Upstash and Render is in [SETUP.md](SETUP.md).

Audit date: 2026-11-23. Both apps build and typecheck cleanly. The code for scheduling, calling, retries, webhooks and auth is complete. What stops the app from working is configuration and hosting, listed below in order.

## 1. Blockers you must fix (nothing works without these)

### 1.1 Vapi API key is rejected
Vapi answers every request made with the current `VAPI_API_KEY` with `401 Invalid Key`. Vapi's hint: the public and private keys are mixed up.

- Vapi dashboard → Organization → API Keys → copy the **Private** key.
- Put it in `VAPI_API_KEY` on the backend host.
- Until then, every reminder burns its retries and ends as MISSED. For local testing set `VAPI_MOCK_CALLS=true`.

### 1.2 Redis is missing
The scheduler (BullMQ) needs Redis. There is none locally and none configured. Without it, creating a reminder hangs and no call is ever placed.

- Use a persistent, always-on Redis: Redis Cloud, Railway Redis, Render Key Value, or Upstash on a fixed plan. Avoid pay-per-command plans: BullMQ polls Redis constantly and the bill grows even when idle.
- Set `REDIS_URL`. TLS URLs start with `rediss://`.
- Locally: `docker run -d -p 6379:6379 redis:7`.

### 1.3 Backend must run on a long-running Node host
The BullMQ worker runs inside the API process. Vercel, Netlify Functions and other serverless hosts will not work for the backend.

- Use Render (Web Service), Railway, Fly.io, or a VPS.
- Build command: `npm install && npm run build:backend` (from the repo root), start command: `npm --workspace=backend run start`.
- Run a single instance at first.

### 1.4 Public webhook URL
`WEBHOOK_BASE_URL` is still `https://your-public-domain.com`. Vapi sends tool calls (complete, snooze, cancel by voice) and end-of-call reports there. Without it the voice actions do nothing.

- Set it to the backend's public https origin, for example `https://api.yourdomain.com`. No trailing `/api`.

### 1.5 Production env vars on the backend host

| Variable | Value |
| --- | --- |
| `NODE_ENV` | `production` (required for secure cookies and webhook auth) |
| `CLIENT_URL` | Exact frontend origin, for example `https://yourdomain.com` |
| `WEBHOOK_BASE_URL` | Backend public origin |
| `VAPI_WEBHOOK_SECRET` | Output of `openssl rand -hex 32`. Webhooks are refused in production without it |
| `VAPI_API_KEY` | Private key (see 1.1) |
| `VAPI_PHONE_NUMBER_ID` | The Vobiz number imported into Vapi |
| `VAPI_MOCK_CALLS` | `false` |
| `REDIS_URL` | See 1.2 |
| `DATABASE_URL`, `JWT_SECRET`, `SMTP_*` | Copy from your current `.env`. Use a fresh long random `JWT_SECRET` in production |

The backend now refuses to start when `NODE_ENV=production` and any of these is wrong: Redis URL, webhook URL, webhook secret, phone number ID, `CLIENT_URL`, or calls still in mock mode. Render and Railway set `NODE_ENV=production` for you, so a first deploy with mock calls on will exit at boot with a clear list of what to fix. `/health` also reports whether Vapi accepts the key.

A reminder that hits the daily call cap is marked FAILED, and the reason appears only in the server log.

### 1.6 Frontend host
- Deploy `landing-page` to Vercel with `NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api`.
- Put the frontend and backend on the **same registrable domain**, for example `yourdomain.com` and `api.yourdomain.com`. Login cookies are cross-site otherwise (`vercel.app` vs `onrender.com`), and Safari and Chrome drop them: login looks fine, then every request returns 401.

## 2. Check before going live

- **Dashboard assistant vs code assistant.** `VAPI_ASSISTANT_ID` is set, so Vapi uses the assistant built in the Vapi dashboard, and the prompt and five tools written in `backend/src/modules/vapi/vapi.service.ts` are ignored. That dashboard assistant must define `complete_reminder`, `snooze_reminder`, `cancel_reminder`, `get_reminder`, `create_reminder`, and use the `{{title}}`, `{{userName}}`, `{{localTime}}` variables. Simplest for launch: **leave `VAPI_ASSISTANT_ID` empty** so the tested in-code assistant is used. The backend now logs an error at startup if the dashboard assistant is missing tools.
- **Vobiz trunk.** At startup the backend logs `Calling from <number> (provider: byo-phone-number)`. If the provider is not `byo-phone-number`, the Vobiz trunk is not the one placing calls.
- **Email sender.** `SMTP_FROM` says "Eavara OTP". Change it if the brand on emails should be Remind. The sending domain must be verified in Brevo.
- **Non-Indian numbers.** Onboarding now defaults to +91. Confirm with Vobiz whether international numbers can be dialled; if not, remove the other country codes from onboarding.
- **Support email.** Set `NEXT_PUBLIC_SUPPORT_EMAIL` on the frontend host. The footer Support link and the contact line on Terms and Privacy use it.
- **Legal text.** The Terms and Privacy pages are a plain-language starting point written from what the app actually does. Have them reviewed.
- **One real end-to-end test**: sign up, onboard with your own number, create a reminder 2 minutes out, answer, say "done". The reminder must flip to COMPLETED on the dashboard.

## 3. Product decisions still open

- **Trial expiry removed.** The dashboard no longer counts down or blocks users after 3 days. Everyone is on a free plan limited to 2 active reminders. The backend still stores `trialEndsAt` but nothing reads it.
- **Pricing page vs backend.** The page promises Basic "Free forever" and Pro at ₹199. The backend gives every user a 3-day trial with the full AI call and 2 active reminders, and has no payment flow. "Upgrade to Pro" only links to signup, and the dashboard upgrade button now says upgrades are not open yet.
- **Mobile app section.** The landing page shows App Store and Google Play badges marked "Coming soon". Remove the section if there will be no app.
- **Phone numbers are not verified.** Anyone can enter any number and the app will call it. A per-user daily call cap now limits the damage (`MAX_CALLS_PER_USER_PER_DAY`, default 20). SMS or call-based verification is the real fix after launch.

## 4. Done in this pass

- Startup validation of production config, and a `vapi` field on `/health`.
- Startup check of the dashboard assistant's tools when `VAPI_ASSISTANT_ID` is set.
- Daily outbound call cap per user.
- Settings panel on the dashboard: phone, timezone, calling hours, voice, retries.
- Terms and Privacy pages (drafts, have them reviewed), Support as email, dead social links removed.
- `/demoui` returns 404 in production.

## 5. Local run

```bash
docker run -d -p 6379:6379 redis:7
npm run dev:backend
npm run dev:landing
```

For calls to reach your laptop, expose the backend with `ngrok http 5000` and put the ngrok URL in `WEBHOOK_BASE_URL`.
