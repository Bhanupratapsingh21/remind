# Setup guide: Vapi, Vobiz, Upstash, Render

Follow the steps in order. Each step ends with the env value it produces.

## 0. What you do NOT need

- **No Vapi assistant.** The backend builds a fresh assistant for every call, with its own prompt, the five voice actions (complete, snooze, cancel, get details, create reminder) and the webhook URL. Leave `VAPI_ASSISTANT_ID` empty. The "Riley" assistant in your Vapi account is unused.
  - To change what the agent says, edit `buildAssistantPrompt` and `firstMessage` in `backend/src/modules/vapi/vapi.service.ts`. Voices for the four personas are in `VOICE_PERSONAS` in the same file.
  - The language model (OpenAI gpt-4o-mini) runs through Vapi and is billed by Vapi. No OpenAI key is needed.
- **No Server URL in the Vapi dashboard.** The backend sends the webhook URL and secret with every call.

## 1. Phone number: which option to pick in Vapi

In Vapi > Phone Numbers > Create Phone Number, pick **BYO SIP Trunk Number**. The others do not fit:

| Option | Why not |
| --- | --- |
| Free Vapi number / Free Vapi SIP | US numbers, inbound only. Cannot call Indian phones |
| Import from Twilio, Vonage, Telnyx | Separate paid carriers. Indian numbers there need extra registration |
| **BYO SIP Trunk Number** | **This is how a Vobiz number plugs into Vapi** |

Vobiz is the carrier that places the call. Vapi runs the AI voice and sends the audio through your Vobiz trunk. ("Opus" in earlier notes meant Vobiz.)

## 2. Vobiz: number, balance and outbound trunk

In the [Vobiz console](https://console.vobiz.ai):

1. **Complete KYC** if the console asks for it. Indian numbers need business verification.
2. **Buy a phone number (DID).** This becomes the caller ID users see.
3. **Add balance.** Calls fail with "Insufficient balance" otherwise.
4. **Create an outbound trunk.** SIP Trunk > Outbound Trunks > Create New Trunk.
   - Trunk name: `Vapi Remind`.
   - Authentication: create a new **Credential** (username and password). Use credentials or an IP list, not both.
   - Save. Then open the trunk and copy from "Authentication & Linking":
     - **SIP Domain**, like `abcd1234.sip.vobiz.ai`. Use this exact domain, not the generic `sip.vobiz.ai`.
     - **Username** and **Password**.

## 3. Vapi: connect the trunk and import the number

In the [Vapi dashboard](https://dashboard.vapi.ai):

1. **Integrations > SIP Trunk Credentials > Add New Credential.**
   - Name: `Vobiz Trunk`.
   - Gateway: the Vobiz SIP Domain from step 2.
   - Username and password: from step 2.
   - Turn on **outbound calling**. Save.
2. **Phone Numbers > Create Phone Number > BYO SIP Trunk Number.**
   - Number: your Vobiz number. Vobiz's guide uses the local form, like `08071387149`. If calls fail with a number-format error, try `+918071387149`.
   - SIP Trunk Credential: `Vobiz Trunk`.
   - Label: `Remind Line`. Click Import.
3. **Copy the phone number's ID.** Open the imported number. The ID is a UUID like `3f2a...-....`. This is **`VAPI_PHONE_NUMBER_ID`**.
4. **Test from Vapi first.** Phone Calls > New Call. Pick the "Riley" assistant, your Vobiz number as caller ID, and your own mobile as the destination, like `+919876543210`. If your phone rings, the trunk works.

Same setup through the API, if you prefer:

```bash
curl -X POST https://api.vapi.ai/credential -H "Authorization: Bearer $VAPI_API_KEY" -H "Content-Type: application/json" -d '{"provider":"byo-sip-trunk","name":"Vobiz Trunk","gateways":[{"ip":"YOUR_ID.sip.vobiz.ai","inboundEnabled":false}],"outboundLeadingPlusEnabled":true,"outboundAuthenticationPlan":{"authUsername":"VOBIZ_USERNAME","authPassword":"VOBIZ_PASSWORD"}}'
```

```bash
curl -X POST https://api.vapi.ai/phone-number -H "Authorization: Bearer $VAPI_API_KEY" -H "Content-Type: application/json" -d '{"provider":"byo-phone-number","name":"Remind Line","number":"08071387149","numberE164CheckEnabled":false,"credentialId":"CREDENTIAL_ID_FROM_FIRST_CALL"}'
```

The `id` in the second response is `VAPI_PHONE_NUMBER_ID`.

Common failures:

| Error | Fix |
| --- | --- |
| SIP auth failed | Username, password or SIP domain do not match the Vobiz trunk |
| Insufficient balance | Add funds in Vobiz |
| Phone format error | Number needs `+91` and the country code, or the local form |
| Call connects but silent | Check the call in Vapi > Calls for the ended reason |

## 4. Upstash Redis

1. [console.upstash.com](https://console.upstash.com) > Redis > Create Database.
   - Region: **ap-southeast-1 (Singapore)**, the same region as the Render backend.
   - Leave **Eviction off**. The scheduler stores reminders in Redis and must never lose them.
2. Open the database > Connect > copy the **TCP / ioredis** URL. It looks like `rediss://default:PASSWORD@NAME.upstash.io:6379`. This is **`REDIS_URL`**.

**Plan.** The scheduler talks to Redis every few seconds even when idle. Upstash's own BullMQ guide recommends a **Fixed plan** (from about $10 a month) because pay-as-you-go bills each command, and the free tier is likely to run out within the month. Render Key Value (Starter, persistent) in Singapore is an equal-cost alternative.

## 5. Deploy the backend on Render

`render.yaml` in the repo root describes the service. Render reads it from GitHub.

1. Push the code. The blueprint must be on the branch Render deploys from:

```bash
git push origin feat/voice-reminders-vapi
```

2. [dashboard.render.com](https://dashboard.render.com) > New > **Blueprint** > connect the GitHub repo `Bhanupratapsingh21/remind` > pick the branch (`main` after the PR is merged).
3. Render asks for the values marked `sync: false`. Paste:

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | Your MongoDB Atlas URL |
| `JWT_SECRET` | A new long random string |
| `REDIS_URL` | Upstash URL from step 4 |
| `CLIENT_URL` | Your frontend URL, like `https://yourdomain.com` |
| `VAPI_API_KEY` | Vapi private key |
| `VAPI_PHONE_NUMBER_ID` | From step 3 |
| `SMTP_*` | Copy from your local `backend/.env` for now |
| `WEBHOOK_BASE_URL` | Leave empty at first. Render's own URL is used automatically |

`NODE_ENV=production`, `VAPI_WEBHOOK_SECRET` (generated by Render), `MAX_CALLS_PER_USER_PER_DAY=20` and the rest are already set by the blueprint.

4. Click **Apply**. Render runs:

```bash
npm ci --include=dev && npm run build:backend
npm --workspace=backend run start
```

5. Check it. The response must show `"redis":"connected"` and `"vapi":{"state":"ok"}`:

```bash
curl https://remind-backend.onrender.com/health
```

If the deploy fails at boot, the log lists exactly which env var is missing.

**Plan.** The blueprint uses the paid **Starter** instance. Free instances sleep after 15 minutes idle, and a sleeping backend never places a call.

**Atlas network access.** In MongoDB Atlas > Network Access, allow Render's outbound IPs (Render service > Connect > Outbound) or `0.0.0.0/0`.

## 6. Domains and the frontend

- Deploy `landing-page` on Vercel. Root directory `landing-page`. Env `NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api`.
- Give the backend a custom domain on Render, like `api.yourdomain.com`, and the frontend `yourdomain.com`. Login cookies only work reliably when both share a domain.
- Then on Render set `WEBHOOK_BASE_URL=https://api.yourdomain.com` and `CLIENT_URL=https://yourdomain.com`.

## 7. Limits

| Variable | Default | Meaning |
| --- | --- | --- |
| `MAX_CALLS_PER_USER_PER_DAY` | 20 | Calls one user can receive in 24 hours, retries included |
| User setting "Call attempts" | 3 | Tries per reminder before it is marked missed |
| User setting "Minutes between tries" | 10 | Gap between retries |
| Free plan | 2 | Active reminders per user (`maxReminders` on the user) |

## 8. Testing real calls from your laptop

Vapi must reach your backend for the voice actions to work.

```bash
ngrok http 5000
```

Put the `https://....ngrok-free.app` URL in `WEBHOOK_BASE_URL` in `backend/.env`, set `VAPI_PHONE_NUMBER_ID`, keep `VAPI_MOCK_CALLS=false`, and restart the backend. Create a reminder two minutes out and answer the call.
