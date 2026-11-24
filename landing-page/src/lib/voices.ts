/**
 * Voices and call styles. Keep ids in sync with backend/src/modules/vapi/voices.ts.
 * Samples in /public/voices are Vapi's own recordings of the exact voices used on calls.
 */
export interface VoiceOption {
  id: string;
  name: string;
  accent: string;
  gender: "Female" | "Male";
  vibe: string;
  sample: string;
}

export const VOICES: VoiceOption[] = [
  { id: "Naina", name: "Naina", accent: "Indian English", gender: "Female", vibe: "Warm and friendly", sample: "/voices/naina.mp3" },
  { id: "Sagar", name: "Sagar", accent: "Indian English", gender: "Male", vibe: "Easygoing and clear", sample: "/voices/sagar.mp3" },
  { id: "Clara", name: "Clara", accent: "American", gender: "Female", vibe: "Polished and professional", sample: "/voices/clara.mp3" },
  { id: "Kai", name: "Kai", accent: "American", gender: "Male", vibe: "Steady and helpful", sample: "/voices/kai.mp3" },
  { id: "Emma", name: "Emma", accent: "American", gender: "Female", vibe: "Bright and upbeat", sample: "/voices/emma.mp3" },
];

export const DEFAULT_VOICE = "Naina";

const LEGACY: Record<string, string> = { Elena: "Naina", Marcus: "Sagar", Sofia: "Emma", James: "Kai" };

/** Accepts current ids and names saved by older versions of the app */
export function findVoice(id?: string | null): VoiceOption {
  const key = id && LEGACY[id] ? LEGACY[id] : id;
  return VOICES.find((v) => v.id === key) || VOICES[0];
}

export interface ToneOption {
  id: "friendly" | "professional" | "disciplined" | "gentle" | "hinglish";
  label: string;
  description: string;
  /** What the agent opens with in this style (matches backend firstMessageFor) */
  example: string;
}

export const TONES: ToneOption[] = [
  {
    id: "friendly",
    label: "Friendly",
    description: "Warm and encouraging, like a supportive friend",
    example: "Hey Aarav, this is your reminder for: send the client update. Are you taking care of it now?",
  },
  {
    id: "professional",
    label: "Professional",
    description: "Crisp and efficient, like an executive assistant",
    example: "Hello Aarav, this is your scheduled reminder: strategy review. Are you on it now?",
  },
  {
    id: "disciplined",
    label: "Disciplined",
    description: "Firm and direct; pushes for a clear commitment",
    example: "Aarav, it's time: evening workout. Are you doing it right now?",
  },
  {
    id: "gentle",
    label: "Gentle",
    description: "Calm, soft and patient; never pushy",
    example: "Hi Aarav, just a gentle reminder: take your evening medicine. Are you able to take care of it now?",
  },
  {
    id: "hinglish",
    label: "Hinglish",
    description: "A natural Hindi-English mix; reply however you like",
    example: "Hi Aarav! Aapka reminder hai: doctor ki appointment. Kya aap abhi kar rahe ho?",
  },
];

export const DEFAULT_TONE: ToneOption["id"] = "friendly";

export function findTone(id?: string | null): ToneOption {
  return TONES.find((t) => t.id === id) || TONES[0];
}

/** One shared <audio> so starting a sample stops whichever one was playing */
let current: HTMLAudioElement | null = null;

export function playSample(src: string, onEnd?: () => void): () => void {
  if (current) {
    current.pause();
    current.dispatchEvent(new Event("ended"));
  }
  const audio = new Audio(src);
  current = audio;
  const done = () => {
    audio.removeEventListener("ended", done);
    if (current === audio) current = null;
    onEnd?.();
  };
  audio.addEventListener("ended", done);
  audio.play().catch(done);
  return () => {
    audio.pause();
    done();
  };
}
