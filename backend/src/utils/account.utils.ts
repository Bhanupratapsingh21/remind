/** Plan, call style and subscription fields the frontend needs on every user payload */
export function accountExtras(user: {
  callTone?: string | null;
  freeRemindersUsed?: number | null;
  subscriptionStatus?: string | null;
  currentPeriodEnd?: Date | null;
  cancelAtPeriodEnd?: boolean | null;
  callingStartTime?: string | null;
  callingEndTime?: string | null;
  defaultMaxAttempts?: number | null;
  defaultRetryInterval?: number | null;
}) {
  return {
    callTone: user.callTone || "friendly",
    freeRemindersUsed: user.freeRemindersUsed || 0,
    subscriptionStatus: user.subscriptionStatus || null,
    currentPeriodEnd: user.currentPeriodEnd || null,
    cancelAtPeriodEnd: !!user.cancelAtPeriodEnd,
    // The dashboard warns when a reminder falls outside these hours (the worker holds it until they open)
    callingStartTime: user.callingStartTime || "08:00",
    callingEndTime: user.callingEndTime || "22:00",
    defaultMaxAttempts: user.defaultMaxAttempts || 3,
    defaultRetryInterval: user.defaultRetryInterval || 10,
  };
}
