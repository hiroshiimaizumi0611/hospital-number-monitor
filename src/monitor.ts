import { loadState, saveState } from "./state";
import type { Env, MonitorState } from "./types";

const DEFAULT_ERROR_ALERT_THRESHOLD = 3;
const NTFY_BASE_URL = "https://ntfy.sh";
const DEFAULT_NUMBER_EXTRACTOR_REGEX = '<td class="goods_name">\\s*([0-9]{1,4})\\s*</td>';

export async function runMonitor(env: Env): Promise<MonitorState> {
  const state = await loadState(env);

  if (!state.enabled || state.targetNumber === null) {
    return state;
  }

  let currentNumber: number;

  try {
    currentNumber = await fetchCurrentNumber(env);
  } catch (error) {
    return recordMonitorError(env, state, toErrorMessage(error));
  }

  let nextState: MonitorState = {
    ...state,
    lastSeenNumber: currentNumber,
    lastCheckedAt: new Date().toISOString(),
    errorCount: 0,
    lastError: null,
  };

  if (!nextState.finalAlertSent && currentNumber >= state.targetNumber) {
    const delivered = await sendNtfyNotification(
      env,
      "病院受付番号通知",
      `順番です。現在番号: ${currentNumber} / あなたの番号: ${state.targetNumber}`,
    );

    if (delivered) {
      nextState = {
        ...nextState,
        enabled: false,
        finalAlertSent: true,
      };
    } else {
      nextState = {
        ...nextState,
        lastError: "到達通知の送信に失敗しました。",
      };
    }
  } else {
    const preAlertPoint = Math.max(state.targetNumber - state.preAlertThreshold, 0);

    if (!nextState.preAlertSent && currentNumber >= preAlertPoint) {
      const delivered = await sendNtfyNotification(
        env,
        "病院受付番号通知",
        `順番が近づいています。現在番号: ${currentNumber} / あなたの番号: ${state.targetNumber}`,
      );

      if (delivered) {
        nextState = {
          ...nextState,
          preAlertSent: true,
        };
      } else {
        nextState = {
          ...nextState,
          lastError: "事前通知の送信に失敗しました。",
        };
      }
    }
  }

  await saveState(env, nextState);
  return nextState;
}

async function recordMonitorError(env: Env, state: MonitorState, message: string): Promise<MonitorState> {
  const nextState: MonitorState = {
    ...state,
    lastCheckedAt: new Date().toISOString(),
    errorCount: state.errorCount + 1,
    lastError: message,
  };

  const threshold = parseErrorAlertThreshold(env.ERROR_ALERT_THRESHOLD);

  if (nextState.errorCount === threshold) {
    await sendNtfyNotification(
      env,
      "病院受付番号通知エラー",
      `監視が連続で失敗しています。直近エラー: ${message}`,
    );
  }

  await saveState(env, nextState);
  return nextState;
}

async function fetchCurrentNumber(env: Env): Promise<number> {
  const response = await fetch(env.MONITOR_TARGET_URL, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
    },
    cf: {
      cacheEverything: false,
      cacheTtl: 0,
    },
  });

  if (!response.ok) {
    throw new Error(`監視対象ページの取得に失敗しました (${response.status})`);
  }

  const html = await response.text();
  const regexSource = env.NUMBER_EXTRACTOR_REGEX || DEFAULT_NUMBER_EXTRACTOR_REGEX;
  const match = html.match(new RegExp(regexSource, "u"));
  const extracted = match?.[1] ?? match?.[0];

  if (!extracted) {
    throw new Error("現在番号を抽出できませんでした。");
  }

  const digits = extracted.replace(/[^\d]/g, "");

  if (!digits) {
    throw new Error("抽出結果に数値が含まれていません。");
  }

  return Number.parseInt(digits, 10);
}

async function sendNtfyNotification(env: Env, title: string, message: string): Promise<boolean> {
  try {
    const response = await fetch(`${NTFY_BASE_URL}/${encodeURIComponent(env.NTFY_TOPIC)}`, {
      method: "POST",
      headers: {
        "content-type": "text/plain; charset=utf-8",
        Title: title,
      },
      body: message,
    });

    if (!response.ok) {
      console.error(`ntfy returned ${response.status}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to send ntfy notification", error);
    return false;
  }
}

function parseErrorAlertThreshold(rawValue: string | undefined): number {
  const parsed = Number.parseInt(rawValue || "", 10);

  if (Number.isInteger(parsed) && parsed > 0) {
    return parsed;
  }

  return DEFAULT_ERROR_ALERT_THRESHOLD;
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "不明なエラーが発生しました。";
}
