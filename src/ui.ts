export function renderHomePage(): string {
  return `<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>病院受付番号モニター</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #f4f5ef;
        --panel: rgba(255, 255, 255, 0.9);
        --ink: #15231e;
        --muted: #5f6d67;
        --line: rgba(21, 35, 30, 0.12);
        --accent: #0e7a57;
        --accent-strong: #09593f;
        --warn: #b63b1a;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        min-height: 100vh;
        font-family: -apple-system, BlinkMacSystemFont, "Hiragino Sans", sans-serif;
        color: var(--ink);
        background:
          radial-gradient(circle at top right, rgba(14, 122, 87, 0.18), transparent 40%),
          linear-gradient(180deg, #fbfcf8 0%, var(--bg) 100%);
      }

      main {
        width: min(100%, 480px);
        margin: 0 auto;
        padding: 24px 16px 40px;
      }

      .panel {
        background: var(--panel);
        border: 1px solid var(--line);
        border-radius: 24px;
        padding: 20px;
        box-shadow: 0 18px 40px rgba(21, 35, 30, 0.08);
        backdrop-filter: blur(12px);
      }

      h1 {
        margin: 0 0 8px;
        font-size: 1.4rem;
        line-height: 1.3;
      }

      p {
        margin: 0;
        line-height: 1.5;
      }

      .intro {
        color: var(--muted);
        margin-bottom: 18px;
      }

      .metric {
        margin: 16px 0 18px;
        padding: 16px;
        border-radius: 18px;
        background: rgba(14, 122, 87, 0.08);
      }

      .metric-label {
        color: var(--muted);
        font-size: 0.9rem;
      }

      .metric-value {
        display: block;
        margin-top: 6px;
        font-size: 2.4rem;
        font-weight: 700;
      }

      form,
      .actions,
      .status-grid {
        display: grid;
        gap: 12px;
      }

      label {
        display: grid;
        gap: 6px;
        font-size: 0.92rem;
      }

      input {
        width: 100%;
        border: 1px solid var(--line);
        border-radius: 14px;
        padding: 14px;
        font: inherit;
        color: var(--ink);
        background: rgba(255, 255, 255, 0.95);
      }

      button {
        width: 100%;
        border: 0;
        border-radius: 999px;
        padding: 14px 16px;
        font: inherit;
        font-weight: 700;
        color: white;
        background: var(--accent);
      }

      button.secondary {
        color: var(--ink);
        background: rgba(21, 35, 30, 0.08);
      }

      .status-grid {
        margin-top: 18px;
      }

      .status-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding-bottom: 10px;
        border-bottom: 1px solid var(--line);
      }

      .status-row:last-child {
        padding-bottom: 0;
        border-bottom: 0;
      }

      .status-label {
        color: var(--muted);
      }

      .status-value {
        text-align: right;
        font-weight: 600;
      }

      .message {
        min-height: 1.5em;
        margin-top: 14px;
        font-size: 0.92rem;
        color: var(--muted);
      }

      .message.error {
        color: var(--warn);
      }
    </style>
  </head>
  <body>
    <main>
      <section class="panel">
        <h1>病院受付番号モニター</h1>
        <p class="intro">自分の受付番号を入れると、順番が近づいた時に ntfy へ通知します。</p>

        <div class="metric">
          <span class="metric-label">現在番号</span>
          <strong id="current-number" class="metric-value">-</strong>
        </div>

        <form id="start-form">
          <label>
            共有トークン
            <input id="token" name="token" type="password" autocomplete="off" required />
          </label>
          <label>
            あなたの受付番号
            <input id="target-number" name="targetNumber" type="number" min="1" inputmode="numeric" required />
          </label>
          <label>
            事前通知しきい値
            <input id="pre-alert-threshold" name="preAlertThreshold" type="number" min="0" inputmode="numeric" value="5" required />
          </label>
          <button type="submit">監視を開始</button>
        </form>

        <div class="actions" style="margin-top: 12px;">
          <button id="refresh-button" type="button" class="secondary">状態を更新</button>
          <button id="stop-button" type="button" class="secondary">監視を停止</button>
        </div>

        <div class="status-grid">
          <div class="status-row">
            <span class="status-label">監視状態</span>
            <span id="enabled" class="status-value">停止中</span>
          </div>
          <div class="status-row">
            <span class="status-label">設定番号</span>
            <span id="target-display" class="status-value">-</span>
          </div>
          <div class="status-row">
            <span class="status-label">しきい値</span>
            <span id="threshold-display" class="status-value">-</span>
          </div>
          <div class="status-row">
            <span class="status-label">最終確認</span>
            <span id="checked-at" class="status-value">-</span>
          </div>
          <div class="status-row">
            <span class="status-label">連続失敗</span>
            <span id="error-count" class="status-value">0</span>
          </div>
        </div>

        <p id="message" class="message"></p>
      </section>
    </main>

    <script>
      const tokenInput = document.getElementById("token");
      const targetInput = document.getElementById("target-number");
      const thresholdInput = document.getElementById("pre-alert-threshold");
      const message = document.getElementById("message");
      const currentNumber = document.getElementById("current-number");
      const enabled = document.getElementById("enabled");
      const targetDisplay = document.getElementById("target-display");
      const thresholdDisplay = document.getElementById("threshold-display");
      const checkedAt = document.getElementById("checked-at");
      const errorCount = document.getElementById("error-count");
      const startForm = document.getElementById("start-form");
      const refreshButton = document.getElementById("refresh-button");
      const stopButton = document.getElementById("stop-button");
      const TOKEN_KEY = "hospital-number-monitor-token";

      hydrateToken();
      bindEvents();

      if (tokenInput.value) {
        refreshStatus();
      } else {
        setMessage("共有トークンを入力すると状態を取得できます。");
      }

      function bindEvents() {
        startForm.addEventListener("submit", handleStart);
        refreshButton.addEventListener("click", refreshStatus);
        stopButton.addEventListener("click", handleStop);
        tokenInput.addEventListener("change", persistToken);
        tokenInput.addEventListener("blur", persistToken);
      }

      function hydrateToken() {
        const saved = window.localStorage.getItem(TOKEN_KEY);
        if (saved) {
          tokenInput.value = saved;
        }
      }

      function persistToken() {
        if (tokenInput.value.trim()) {
          window.localStorage.setItem(TOKEN_KEY, tokenInput.value.trim());
        } else {
          window.localStorage.removeItem(TOKEN_KEY);
        }
      }

      async function handleStart(event) {
        event.preventDefault();
        persistToken();
        setMessage("監視を開始しています...");

        try {
          const state = await postJson("/api/start", {
            token: tokenInput.value.trim(),
            targetNumber: Number(targetInput.value),
            preAlertThreshold: Number(thresholdInput.value)
          });

          renderState(state);
          if (!state.lastError) {
            setMessage("監視を開始しました。");
          }
        } catch (error) {
          setError(error.message);
        }
      }

      async function handleStop() {
        persistToken();
        setMessage("監視を停止しています...");

        try {
          const state = await postJson("/api/stop", {
            token: tokenInput.value.trim()
          });

          renderState(state);
          if (!state.lastError) {
            setMessage("監視を停止しました。");
          }
        } catch (error) {
          setError(error.message);
        }
      }

      async function refreshStatus() {
        persistToken();

        if (!tokenInput.value.trim()) {
          setError("共有トークンを入力してください。");
          return;
        }

        setMessage("状態を取得しています...");

        try {
          const response = await fetch("/api/status?token=" + encodeURIComponent(tokenInput.value.trim()));
          const payload = await response.json();

          if (!response.ok) {
            throw new Error(payload.error || "状態取得に失敗しました。");
          }

          renderState(payload.state);
          if (!payload.state.lastError) {
            setMessage("最新状態を取得しました。");
          }
        } catch (error) {
          setError(error.message);
        }
      }

      async function postJson(url, body) {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify(body)
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || "通信に失敗しました。");
        }

        return payload.state;
      }

      function renderState(state) {
        currentNumber.textContent = state.lastSeenNumber === null ? "-" : String(state.lastSeenNumber);
        enabled.textContent = state.enabled ? "監視中" : "停止中";
        targetDisplay.textContent = state.targetNumber === null ? "-" : String(state.targetNumber);
        thresholdDisplay.textContent = String(state.preAlertThreshold);
        checkedAt.textContent = formatTimestamp(state.lastCheckedAt);
        errorCount.textContent = String(state.errorCount);

        if (state.targetNumber !== null) {
          targetInput.value = String(state.targetNumber);
        }

        thresholdInput.value = String(state.preAlertThreshold);

        if (state.lastError) {
          setError(state.lastError);
        }
      }

      function formatTimestamp(value) {
        if (!value) {
          return "-";
        }

        return new Date(value).toLocaleString("ja-JP");
      }

      function setMessage(text) {
        message.classList.remove("error");
        message.textContent = text;
      }

      function setError(text) {
        message.classList.add("error");
        message.textContent = text;
      }
    </script>
  </body>
</html>`;
}
