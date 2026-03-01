import { runMonitor } from "./monitor";
import { defaultMonitorState, loadState, saveState } from "./state";
import type { Env, StartPayload, StopPayload } from "./types";
import { renderHomePage } from "./ui";

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/") {
      return new Response(renderHomePage(), {
        headers: {
          "content-type": "text/html; charset=utf-8",
        },
      });
    }

    if (request.method === "GET" && url.pathname === "/api/status") {
      return handleStatus(url, env);
    }

    if (request.method === "POST" && url.pathname === "/api/start") {
      return handleStart(request, env, ctx);
    }

    if (request.method === "POST" && url.pathname === "/api/stop") {
      return handleStop(request, env);
    }

    return json({ error: "Not Found" }, 404);
  },

  async scheduled(_event: ScheduledController, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(runMonitor(env));
  },
} satisfies ExportedHandler<Env>;

async function handleStatus(url: URL, env: Env): Promise<Response> {
  const token = url.searchParams.get("token") || "";

  if (!isValidToken(token, env)) {
    return json({ error: "認証に失敗しました。" }, 401);
  }

  const state = await loadState(env);
  return json({ state });
}

async function handleStart(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const payload = await parseJson<StartPayload>(request);

  if (!payload) {
    return json({ error: "リクエスト形式が不正です。" }, 400);
  }

  if (!isValidToken(payload.token, env)) {
    return json({ error: "認証に失敗しました。" }, 401);
  }

  const targetNumber = toPositiveInteger(payload.targetNumber);
  const preAlertThreshold = toNonNegativeInteger(payload.preAlertThreshold);

  if (targetNumber === null) {
    return json({ error: "受付番号は 1 以上の整数で入力してください。" }, 400);
  }

  if (preAlertThreshold === null) {
    return json({ error: "事前通知しきい値は 0 以上の整数で入力してください。" }, 400);
  }

  if (preAlertThreshold > targetNumber) {
    return json({ error: "事前通知しきい値は受付番号以下にしてください。" }, 400);
  }

  await saveState(env, {
    ...defaultMonitorState,
    enabled: true,
    targetNumber,
    preAlertThreshold,
  });

  const monitorRun = runMonitor(env);
  ctx.waitUntil(monitorRun);
  const state = await monitorRun;

  return json({ state });
}

async function handleStop(request: Request, env: Env): Promise<Response> {
  const payload = await parseJson<StopPayload>(request);

  if (!payload) {
    return json({ error: "リクエスト形式が不正です。" }, 400);
  }

  if (!isValidToken(payload.token, env)) {
    return json({ error: "認証に失敗しました。" }, 401);
  }

  const state = await loadState(env);
  const nextState = {
    ...state,
    enabled: false,
  };

  await saveState(env, nextState);
  return json({ state: nextState });
}

async function parseJson<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

function isValidToken(token: string, env: Env): boolean {
  return Boolean(token) && token === env.SHARED_TOKEN;
}

function toPositiveInteger(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    return null;
  }

  return value;
}

function toNonNegativeInteger(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    return null;
  }

  return value;
}

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
