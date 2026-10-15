import axios from "axios";
import { ENV } from "../../config/env";

export interface OutboundCallParams {
  phoneNumber: string;
  userName: string;
  reminderId: string;
  title: string;
  description?: string | null;
  priority: string;
  attemptNumber: number;
}

export interface VapiCallResponse {
  id: string;
  status: string;
  phoneNumberId?: string;
  assistantId?: string;
  createdAt?: string;
  isMock?: boolean;
}

export class VapiService {
  /**
   * Build the prompt context for the dynamic reminder
   */
  public static buildAssistantPrompt(params: OutboundCallParams): string {
    return `
You are the AI Voice Accountability and Reminder Assistant for ${params.userName}.
You are calling to remind them about an important scheduled task.

CONTEXT:
- User Name: ${params.userName}
- Reminder ID: ${params.reminderId}
- Task Title: ${params.title}
- Description: ${params.description || "No additional description provided."}
- Priority: ${params.priority}
- Attempt: #${params.attemptNumber}

INSTRUCTIONS:
1. Greet the user warmly and state clearly why you are calling.
   Example: "Hey ${params.userName}, this is your reminder to ${params.title}. Are you taking care of it now?"
2. Listen carefully to what they say:
   - If they say they finished or are done: Call the "complete_reminder" tool.
   - If they ask to be reminded later (e.g. "in 30 minutes", "tomorrow at 9 AM", "call me back"): Call the "snooze_reminder" tool with the requested time.
   - If they want to drop or cancel this task: Call the "cancel_reminder" tool.
   - If they ask what this reminder is about: Provide details using the task description.
   - If they want to create a new reminder (e.g. "Remind me to call Rahul tomorrow"): Call the "create_reminder" tool.
3. Be concise, polite, accountability-driven, and natural. Keep responses brief since this is a phone call.
4. Do NOT read out internal database IDs to the user.
`.trim();
  }

  /**
   * Define the tools Vapi agent can call during the conversation
   */
  public static getToolDefinitions() {
    return [
      {
        type: "function",
        function: {
          name: "complete_reminder",
          description: "Marks the current reminder as completed when the user confirms they did it or are doing it now.",
          parameters: {
            type: "object",
            properties: {
              reminderId: {
                type: "string",
                description: "The unique ID of the reminder being completed.",
              },
            },
            required: ["reminderId"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "snooze_reminder",
          description: "Reschedules or snoozes the reminder for a later time when the user requests a delay or callback.",
          parameters: {
            type: "object",
            properties: {
              reminderId: {
                type: "string",
                description: "The unique ID of the reminder being snoozed.",
              },
              minutes: {
                type: "number",
                description: "Minutes to snooze from now (e.g., 10, 30, 60). Default is 30.",
              },
              newScheduledAt: {
                type: "string",
                description: "Optional specific ISO-8601 date string for the new reminder time.",
              },
            },
            required: ["reminderId"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "cancel_reminder",
          description: "Cancels or deletes the reminder when the user no longer wants to be reminded.",
          parameters: {
            type: "object",
            properties: {
              reminderId: {
                type: "string",
                description: "The unique ID of the reminder to cancel.",
              },
            },
            required: ["reminderId"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "get_reminder",
          description: "Retrieves the full task information and description of the current reminder.",
          parameters: {
            type: "object",
            properties: {
              reminderId: {
                type: "string",
                description: "The unique ID of the reminder.",
              },
            },
            required: ["reminderId"],
          },
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
   * Initiate an Outbound Call via Vapi (with Vobiz telephony integration)
   */
  public static async createOutboundCall(params: OutboundCallParams): Promise<VapiCallResponse> {
    const isMock = ENV.VAPI_MOCK_CALLS || !ENV.VAPI_API_KEY;

    if (isMock) {
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

    const webhookUrl = `${ENV.WEBHOOK_BASE_URL.replace(/\/$/, "")}/api/webhooks/vapi`;
    const prompt = this.buildAssistantPrompt(params);

    const payload: Record<string, any> = {
      phoneNumberId: ENV.VAPI_PHONE_NUMBER_ID,
      customer: {
        number: params.phoneNumber,
        name: params.userName,
      },
      serverUrl: webhookUrl,
    };

    // If an existing assistant is configured in Vapi, pass assistantId with dynamic variable overrides
    if (ENV.VAPI_ASSISTANT_ID) {
      payload.assistantId = ENV.VAPI_ASSISTANT_ID;
      payload.assistantOverrides = {
        variableValues: {
          userName: params.userName,
          reminderId: params.reminderId,
          title: params.title,
          description: params.description || "",
          priority: params.priority,
          attemptNumber: String(params.attemptNumber),
        },
        serverUrl: webhookUrl,
      };
    } else {
      // Inline dynamic assistant configuration with tools & webhook
      payload.assistant = {
        name: `Remind AI - ${params.title.substring(0, 25)}`,
        model: {
          provider: "openai",
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: prompt,
            },
          ],
          tools: this.getToolDefinitions(),
        },
        firstMessage: `Hey ${params.userName}, this is your reminder for: ${params.title}. Are you taking care of it now?`,
        serverUrl: webhookUrl,
      };
    }

    try {
      const response = await axios.post(`${ENV.VAPI_BASE_URL}/call`, payload, {
        headers: {
          Authorization: `Bearer ${ENV.VAPI_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      });

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
}
