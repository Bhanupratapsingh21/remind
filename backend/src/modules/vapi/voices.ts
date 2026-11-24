/**
 * Voices and call styles. Keep in sync with landing-page/src/lib/voices.ts (ids, names, tones).
 * Each voice id is the Vapi voice id; landing previews come from Vapi's own samples of the same voice.
 */
export const VOICES = {
  Naina: { provider: "vapi", voiceId: "Naina" }, // Indian English, female
  Sagar: { provider: "vapi", voiceId: "Sagar" }, // Indian English, male
  Clara: { provider: "vapi", voiceId: "Clara" }, // American, female
  Kai: { provider: "vapi", voiceId: "Kai" }, // American, male
  Emma: { provider: "vapi", voiceId: "Emma" }, // American, female
} as const;

export type VoiceId = keyof typeof VOICES;
export const DEFAULT_VOICE: VoiceId = "Naina";

/** Names saved by earlier versions of the app, mapped to the closest current voice */
const LEGACY_VOICES: Record<string, VoiceId> = {
  Elena: "Naina",
  Marcus: "Sagar",
  Sofia: "Emma",
  James: "Kai",
};

export function resolveVoice(name?: string | null): VoiceId {
  if (name && name in VOICES) return name as VoiceId;
  if (name && LEGACY_VOICES[name]) return LEGACY_VOICES[name];
  return DEFAULT_VOICE;
}

export const TONES = ["friendly", "professional", "disciplined", "gentle", "hinglish"] as const;
export type Tone = (typeof TONES)[number];
export const DEFAULT_TONE: Tone = "friendly";

export function resolveTone(tone?: string | null): Tone {
  return (TONES as readonly string[]).includes(tone || "") ? (tone as Tone) : DEFAULT_TONE;
}

/** How the agent speaks in each style; appended to the system prompt */
export const TONE_INSTRUCTIONS: Record<Tone, string> = {
  friendly: "Sound warm, upbeat and encouraging, like a supportive friend. Light, natural phrasing.",
  professional: "Sound crisp, polite and efficient, like an executive assistant. No small talk; get to the point.",
  disciplined:
    "Sound firm, direct and motivating, like an accountability coach. Do not accept vague excuses: push for a clear commitment (done now, or an exact time).",
  gentle: "Sound calm, soft and patient. Slow down, be reassuring, never pushy.",
  hinglish:
    "Speak natural Hinglish: a casual mix of Hindi and English the way people talk in Indian cities, written in Roman script (for example: \"Haan ji, aapka reminder hai. Kya aap abhi kar rahe ho?\"). Understand the user whether they reply in Hindi, English or a mix. Keep tool calls and their arguments in English.",
};

export function firstMessageFor(tone: Tone, userName: string, title: string): string {
  if (tone === "hinglish") return `Hi ${userName}! Aapka reminder hai: ${title}. Kya aap abhi kar rahe ho?`;
  if (tone === "professional") return `Hello ${userName}, this is your scheduled reminder: ${title}. Are you on it now?`;
  if (tone === "disciplined") return `${userName}, it's time: ${title}. Are you doing it right now?`;
  if (tone === "gentle") return `Hi ${userName}, just a gentle reminder: ${title}. Are you able to take care of it now?`;
  return `Hey ${userName}, this is your reminder for: ${title}. Are you taking care of it now?`;
}

/** Hinglish needs a transcriber that follows Hindi-English code switching; others use Vapi's default */
export function transcriberFor(tone: Tone) {
  return tone === "hinglish" ? { provider: "deepgram", model: "nova-3", language: "multi" } : undefined;
}
