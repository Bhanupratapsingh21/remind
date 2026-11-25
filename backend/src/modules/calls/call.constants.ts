/**
 * Prisma filter for a call that actually connected (someone talked). Carrier refusals, failed
 * dials and unanswered calls have no duration, so they don't use up free tests or block "Call now".
 */
export const CONNECTED_CALL = {
  vapiCallId: { not: null },
  duration: { gt: 0 },
} as const;
