export interface Env {
  MONITOR_STATE: KVNamespace;
  SHARED_TOKEN: string;
  NTFY_TOPIC: string;
  MONITOR_TARGET_URL: string;
  NUMBER_EXTRACTOR_REGEX?: string;
  ERROR_ALERT_THRESHOLD?: string;
}

export interface MonitorState {
  enabled: boolean;
  targetNumber: number | null;
  preAlertThreshold: number;
  lastSeenNumber: number | null;
  preAlertSent: boolean;
  finalAlertSent: boolean;
  lastCheckedAt: string | null;
  errorCount: number;
  lastError: string | null;
}

export interface StartPayload {
  targetNumber: number;
  preAlertThreshold: number;
  token: string;
}

export interface StopPayload {
  token: string;
}

