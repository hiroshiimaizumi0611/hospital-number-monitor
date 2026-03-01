import type { Env, MonitorState } from "./types";

const STATE_KEY = "monitor-state";

export const defaultMonitorState: MonitorState = {
  enabled: false,
  targetNumber: null,
  preAlertThreshold: 5,
  lastSeenNumber: null,
  preAlertSent: false,
  finalAlertSent: false,
  lastCheckedAt: null,
  errorCount: 0,
  lastError: null,
};

export async function loadState(env: Env): Promise<MonitorState> {
  const saved = await env.MONITOR_STATE.get(STATE_KEY, "json");
  return coerceState(saved as Partial<MonitorState> | null);
}

export async function saveState(env: Env, state: MonitorState): Promise<void> {
  await env.MONITOR_STATE.put(STATE_KEY, JSON.stringify(state));
}

function coerceState(saved: Partial<MonitorState> | null): MonitorState {
  if (!saved) {
    return { ...defaultMonitorState };
  }

  return {
    enabled: saved.enabled === true,
    targetNumber: typeof saved.targetNumber === "number" ? saved.targetNumber : null,
    preAlertThreshold:
      typeof saved.preAlertThreshold === "number" ? saved.preAlertThreshold : defaultMonitorState.preAlertThreshold,
    lastSeenNumber: typeof saved.lastSeenNumber === "number" ? saved.lastSeenNumber : null,
    preAlertSent: saved.preAlertSent === true,
    finalAlertSent: saved.finalAlertSent === true,
    lastCheckedAt: typeof saved.lastCheckedAt === "string" ? saved.lastCheckedAt : null,
    errorCount: typeof saved.errorCount === "number" ? saved.errorCount : 0,
    lastError: typeof saved.lastError === "string" ? saved.lastError : null,
  };
}

