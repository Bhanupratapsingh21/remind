/** Plan, call style and subscription fields the frontend needs on every user payload */
export function accountExtras(user: {
  callTone?: string | null;
  freeRemindersUsed?: number | null;
  subscriptionStatus?: string | null;
  currentPeriodEnd?: Date | null;
  cancelAtPeriodEnd?: boolean | null;
}) {
  return {
    callTone: user.callTone || "friendly",
    freeRemindersUsed: user.freeRemindersUsed || 0,
    subscriptionStatus: user.subscriptionStatus || null,
    currentPeriodEnd: user.currentPeriodEnd || null,
    cancelAtPeriodEnd: !!user.cancelAtPeriodEnd,
  };
}
