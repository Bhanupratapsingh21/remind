import axios from "axios";
import { ENV } from "../../config/env";
import { getLocalTimeInfo } from "../../utils/timezone.utils";

export interface OutboundCallParams {
  phoneNumber: string;
  userId: string;
  userName: string;
  reminderId: string;
  title: string;
  description?: string | null;
  priority: string;
  attemptNumber: number;
  timezone: string;
  voicePersona?: string | null;
}

export interface VapiCallResponse {
  id: string;
  status: string;
  phoneNumberId?: string;
  assistantId?: string;
  createdAt?: string;
  isMock?: boolean;
}

/**
 * App voice personas -> Vapi voice config. Adjust voiceIds here to change how each persona sounds.
 */
const VOICE_PERSONAS: Record<string, { provider: string; voiceId: string }> = {
  Elena: { provider: "vapi", voiceId: "Neha" },
  Marcus: { provider: "vapi", voiceId: "Cole" },
  Sofia: { provider: "vapi", voiceId: "Lily" },
  James: { provider: "vapi", voiceId: "Harry" },
};
const DEFAULT_PERSONA = "Elena";

const vapiHttp = () =>
  axios.create({
    baseURL: ENV.VAPI_BASE_URL,
    headers: {
      Authorization: `Bearer ${ENV.VAPI_API_KEY}`,
      "Content-Type": "application/json",
    },
    timeout: 15000,
  });

export class VapiService {
  public static get isMock(): boolean {
    return ENV.VAPI_MOCK_CALLS || !ENV.VAPI_API_KEY;
  }

  public static getVoiceConfig(persona?: string | null) {
    return VOICE_PERSONAS[persona || DEFAULT_PERSONA] || VOICE_PERSONAS[DEFAULT_PERSONA];
  }

  /**
   * Server config sent to Vapi so webhooks reach us and carry the shared secret header.
   */
  public static getServerConfig() {
    const server: Record<string, any> = {
      url: `${ENV.WEBHOOK_BASE_URL.replace(/\/$/, "")}/api/webhooks/vapi`,
    };
    if (ENV.VAPI_WEBHOOK_SECRET) {
      server.headers = { "x-vapi-secret": ENV.VAPI_WEBHOOK_SECRET };
    }
    return server;
  }

  /**
   * Build the prompt context for the dynamic reminder
   */
  public static buildAssistantPrompt(params: OutboundCallParams): string {
    const local = getLocalTimeInfo(new Date(), params.timezone);

    return `
You are the AI Voice Accountability and Reminder Assistant for ${params.userName}.
You are calling to remind them about an important scheduled task.

CONTEXT:
- User Name: ${params.userName}
- Task Title: ${params.title}
- Description: ${params.description || "No additional description provided."}
- Priority: ${params.priority}
- Attempt: #${params.attemptNumber}
- User's timezone: ${params.timezone}
- User's current local date and time: ${local.dateStr} ${local.timeStr}

INSTRUCTIONS:
1. Greet the user warmly and state clearly why you are calling.
   Example: "Hey ${params.userName}, this is your reminder to ${params.title}. Are you taking care of it now?"
2. Listen carefully to what they say:
   - If they say they finished or are done: Call the "complete_reminder" tool.
   - If they ask to be reminded later (e.g. "in 30 minutes", "tomorrow at 9 AM", "call me back"): Call the "snooze_reminder" tool.
     Prefer "minutes" for relative requests. For a clock time, pass "newScheduledAt" as an ISO-8601 timestamp
     in the user's timezone WITH its UTC offset, worked out from the user's current local time above.
   - If they want to drop or cancel this task: Call the "cancel_reminder" tool.
   - If they ask what this reminder is about: Provide details using the task description.
   - If they want to create a new reminder (e.g. "Remind me to call Rahul tomorrow"): Call the "create_reminder" tool.
3. Be concise, polite, accountability-driven, and natural. Keep responses brief since this is a phone call.
4. After the matching tool succeeds, confirm briefly and end the call.
`.trim();
  }

  /**
   * Define the tools Vapi agent can call during the conversation.
   * The current reminder is resolved server-side from the call, so tools never take a reminder ID.
   */
  public static getToolDefinitions() {
    return [
      {
        type: "function",
        function: {
          name: "complete_reminder",
          description: "Marks the current reminder as completed when the user confirms they did it or are doing it now.",
          parameters: { type: "object", properties: {} },
        },
      },
      {
        type: "function",
        function: {
          name: "snooze_reminder",
          description: "Reschedules the current reminder for a later time when the user requests a delay or callback.",
          parameters: {
            type: "object",
            properties: {
              minutes: {
                type: "number",
                description: "Minutes to snooze from now (e.g., 10, 30, 60). Default is 30.",
              },
              newScheduledAt: {
                type: "string",
                description:
                  "Specific time to call back, as ISO-8601 with UTC offset (e.g. 2026-10-12T09:00:00+05:30). Use instead of minutes for clock times.",
              },
            },
          },
        },
      },
      {
        type: "function",
        function: {
          name: "cancel_reminder",
          description: "Cancels the current reminder when the user no longer wants to be reminded.",
          parameters: { type: "object", properties: {} },
        },
      },
      {
        type: "function",
        function: {
          name: "get_reminder",
          description: "Retrieves the full task information and description of the current reminder.",
          parameters: { type: "object", properties: {} },
        },
      },
      {
        type: "function",
        function: {
          name: "create_reminder",
          description: "Creates a brand new reminder if the user asks during the conversation.",
          parameters: {
            type: "object",
            properties: {
              title: {
                type: "string",
                description: "Task title for the new reminder.",
              },
              delayMinutes: {
                type: "number",
                description: "Delay in minutes from now.",
              },
              priority: {
                type: "string",
                enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
                description: "Priority of the new task.",
              },
            },
            required: ["title"],
          },
        },
      },
    ];
  }

  /**
   * Initiate an Outbound Call via Vapi (telephony through the phone number configured in Vapi)
   */
  public static async createOutboundCall(params: OutboundCallParams): Promise<VapiCallResponse> {
    if (this.isMock) {
      const mockCallId = `vapi_sim_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      console.log(`\n======================================================`);
      console.log(`📞 [Vapi Simulation Mode] Simulating outbound phone call:`);
      console.log(`   To: ${params.phoneNumber} (${params.userName})`);
      console.log(`   Reminder: "${params.title}" (ID: ${params.reminderId})`);
      console.log(`   Attempt: #${params.attemptNumber} | Priority: ${params.priority}`);
      console.log(`   Mock Call ID: ${mockCallId}`);
      console.log(`======================================================\n`);

      return {
        id: mockCallId,
        status: "queued",
        isMock: true,
      };
    }

    const server = this.getServerConfig();
    const metadata = {
      reminderId: params.reminderId,
      userId: params.userId,
      attemptNumber: params.attemptNumber,
    };

    const payload: Record<string, any> = {
      phoneNumberId: ENV.VAPI_PHONE_NUMBER_ID,
      customer: {
        number: params.phoneNumber,
        name: params.userName,
      },
    };

    // If an existing assistant is configured in Vapi, pass assistantId with dynamic variable overrides.
    // NOTE: on this path the dashboard assistant's own prompt and tools are used; it must define the
    // same tools as getToolDefinitions() and reference {{title}}, {{userName}}, {{localTime}} etc.
    if (ENV.VAPI_ASSISTANT_ID) {
      const local = getLocalTimeInfo(new Date(), params.timezone);
      payload.assistantId = ENV.VAPI_ASSISTANT_ID;
      payload.assistantOverrides = {
        variableValues: {
          userName: params.userName,
          title: params.title,
          description: params.description || "",
          priority: params.priority,
          attemptNumber: String(params.attemptNumber),
          timezone: params.timezone,
          localTime: `${local.dateStr} ${local.timeStr}`,
        },
        voice: this.getVoiceConfig(params.voicePersona),
        server,
        metadata,
      };
    } else {
      // Inline dynamic assistant configuration with tools & webhook (versioned in this repo)
      payload.assistant = {
        name: `Remind AI - ${params.title.substring(0, 25)}`,
        model: {
          provider: "openai",
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: this.buildAssistantPrompt(params),
            },
          ],
          tools: this.getToolDefinitions(),
        },
        voice: this.getVoiceConfig(params.voicePersona),
        firstMessage: `Hey ${params.userName}, this is your reminder for: ${params.title}. Are you taking care of it now?`,
        endCallFunctionEnabled: true,
        server,
        metadata,
      };
    }

    try {
      const response = await vapiHttp().post("/call", payload);

      return {
        id: response.data?.id,
        status: response.data?.status || "initiated",
        phoneNumberId: response.data?.phoneNumberId,
        assistantId: response.data?.assistantId,
        createdAt: response.data?.createdAt,
        isMock: false,
      };
    } catch (error: any) {
      const errDetail = error.response?.data || error.message;
      console.error("❌ [VapiService] Failed to create outbound call:", errDetail);
      throw new Error(`Vapi outbound call failed: ${JSON.stringify(errDetail)}`);
    }
  }

  /**
   * Fetch a call from Vapi (used to reconcile calls whose webhook never arrived)
   */
  public static async getCall(callId: string): Promise<any> {
    const response = await vapiHttp().get(`/call/${callId}`);
    return response.data;
  }

  /** Outcome of the startup check, reported on /health */
  public static setupStatus: {
    state: "mock" | "pending" | "ok" | "error";
    problems: string[];
    phoneProvider?: string;
  } = { state: "pending", problems: [] };

  /**
   * Startup sanity check: the API key works, VAPI_PHONE_NUMBER_ID exists (provider "byo-phone-number"
   * means an imported SIP trunk number such as Vobiz), and a dashboard assistant, when used, has our tools.
   */
  public static async verifySetup(): Promise<void> {
    if (this.isMock) {
      this.setupStatus = { state: "mock", problems: [] };
      console.log("📞 [VapiService] Mock call mode is on; skipping Vapi checks.");
      return;
    }

    const problems: string[] = [];
    let phoneProvider: string | undefined;
    const describe = (error: any) => {
      if (error.response?.status === 401) return "Vapi rejected VAPI_API_KEY (401). Use the private key.";
      return JSON.stringify(error.response?.data || error.message);
    };

    if (!ENV.VAPI_PHONE_NUMBER_ID) {
      problems.push("VAPI_PHONE_NUMBER_ID is not set; outbound calls will fail.");
    } else {
      try {
        const { data } = await vapiHttp().get(`/phone-number/${ENV.VAPI_PHONE_NUMBER_ID}`);
        phoneProvider = data.provider;
        console.log(
          `📞 [VapiService] Calling from ${data.number || data.sipUri || data.id} (provider: ${data.provider})`
        );
      } catch (error: any) {
        problems.push(`Could not load VAPI_PHONE_NUMBER_ID: ${describe(error)}`);
      }
    }

    if (ENV.VAPI_ASSISTANT_ID && !problems.some((p) => p.includes("401"))) {
      try {
        const { data } = await vapiHttp().get(`/assistant/${ENV.VAPI_ASSISTANT_ID}`);
        const inlineTools: string[] = (data.model?.tools || []).map((t: any) => t.function?.name).filter(Boolean);
        const expected = this.getToolDefinitions().map((t) => t.function.name);
        const missing = expected.filter((name) => !inlineTools.includes(name));
        if (missing.length && !(data.model?.toolIds || []).length) {
          problems.push(
            `Dashboard assistant ${ENV.VAPI_ASSISTANT_ID} lacks tools: ${missing.join(", ")}. ` +
              "Clear VAPI_ASSISTANT_ID to use the in-code assistant."
          );
        } else if (missing.length) {
          console.warn(
            `⚠️ [VapiService] Dashboard assistant uses shared tools (toolIds); make sure they cover: ${missing.join(", ")}`
          );
        }
      } catch (error: any) {
        problems.push(`Could not load VAPI_ASSISTANT_ID: ${describe(error)}`);
      }
    }

    this.setupStatus = { state: problems.length ? "error" : "ok", problems, phoneProvider };
    problems.forEach((p) => console.error(`❌ [VapiService] ${p}`));
  }
}
