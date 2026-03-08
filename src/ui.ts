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
        --app-bg: #eef3f8;
        --screen-bg: #f8fbff;
        --card-bg: #ffffff;
        --hero-bg: #eff6ff;
        --hero-line: #bfdbfe;
        --line: #d9e2ef;
        --ink: #0f172a;
        --muted: #64748b;
        --primary: #2563eb;
        --primary-strong: #1d4ed8;
        --success: #16a34a;
        --danger: #dc2626;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        min-height: 100vh;
        font-family: -apple-system, BlinkMacSystemFont, "Hiragino Sans", "Noto Sans JP", sans-serif;
        color: var(--ink);
        background:
          radial-gradient(circle at top center, rgba(37, 99, 235, 0.11), transparent 44%),
          linear-gradient(180deg, #f7fafe 0%, var(--app-bg) 100%);
      }

      main {
        width: min(100%, 1120px);
        margin: 0 auto;
        padding: 20px 12px 36px;
      }

      .screen {
        background: var(--screen-bg);
        border: 1px solid #dbe3ef;
        border-radius: 24px;
        overflow: hidden;
        box-shadow: 0 20px 44px rgba(15, 23, 42, 0.09);
      }

      .content {
        display: grid;
        gap: 10px;
        padding: 14px 16px 18px;
      }

      .page-header {
        display: grid;
      }

      .kicker {
        margin: 0;
        font-size: 0.64rem;
        font-weight: 700;
        letter-spacing: 0.12em;
        color: #475569;
      }

      h1 {
        margin: 3px 0 0;
        font-size: 1.62rem;
        letter-spacing: -0.02em;
        line-height: 1.2;
      }

      .intro {
        margin: 7px 0 0;
        font-size: 0.74rem;
        color: var(--muted);
      }

      .card {
        background: var(--card-bg);
        border: 1px solid var(--line);
        border-radius: 12px;
      }

      .hero-card {
        background: var(--hero-bg);
        border-color: var(--hero-line);
      }

      .card-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px;
        padding-bottom: 0;
      }

      .card-label {
        font-size: 0.74rem;
        color: var(--muted);
      }

      .badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 52px;
        border-radius: 999px;
        padding: 2px 8px;
        font-size: 0.64rem;
        font-weight: 700;
        line-height: 1.3;
      }

      .badge-live {
        color: #ffffff;
        background: var(--success);
      }

      .badge-paused {
        color: #ffffff;
        background: #64748b;
      }

      .hero-number {
        margin: 4px 16px 0;
        font-size: 3rem;
        line-height: 1;
        font-weight: 800;
        letter-spacing: -0.03em;
        color: var(--primary-strong);
      }

      .hero-meta {
        margin: 4px 16px 16px;
        font-size: 0.74rem;
        color: var(--muted);
      }

      .section-title {
        margin: 0;
        padding: 12px 16px 0;
        font-size: 0.95rem;
        font-weight: 700;
      }

      .form-grid {
        display: grid;
        gap: 10px;
        padding: 10px 16px 16px;
      }

      label {
        display: grid;
        gap: 6px;
        font-size: 0.69rem;
        font-weight: 600;
      }

      input {
        width: 100%;
        border: 1px solid #cbd5e1;
        border-radius: 6px;
        padding: 10px 12px;
        font: inherit;
        font-size: 0.9rem;
        color: var(--ink);
        background: #f8fafc;
      }

      .actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }

      button {
        width: 100%;
        border-radius: 8px;
        border: 0;
        padding: 12px 10px;
        font: inherit;
        font-size: 0.86rem;
        font-weight: 700;
        transition: transform 0.15s ease, opacity 0.15s ease;
      }

      button:active {
        transform: translateY(1px);
      }

      .primary {
        color: #ffffff;
        background: var(--primary);
      }

      .secondary {
        color: var(--ink);
        background: #e2e8f0;
        border: 1px solid #cbd5e1;
      }

      button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .refresh {
        margin-top: 8px;
        border: 0;
        background: transparent;
        color: var(--muted);
        padding: 4px 2px 0;
        text-align: right;
        font-size: 0.73rem;
        font-weight: 600;
      }

      .info-card {
        display: grid;
        gap: 3px;
        padding: 12px 14px;
        background: #eff6ff;
        border-color: #bfdbfe;
      }

      .info-title {
        margin: 0;
        font-size: 0.95rem;
        font-weight: 700;
      }

      .message {
        margin: 0;
        font-size: 0.69rem;
        color: var(--muted);
        line-height: 1.4;
      }

      .message.error {
        color: var(--danger);
        font-weight: 600;
      }

      .status-card {
        padding-bottom: 8px;
      }

      .status-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 12px 16px 0;
      }

      .status-kicker {
        margin: 0;
        font-size: 0.62rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        color: #64748b;
      }

      .status-grid {
        display: grid;
        gap: 8px;
        padding: 8px 16px 10px;
      }

      .status-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .status-label {
        color: var(--muted);
        font-size: 0.74rem;
      }

      .status-value {
        text-align: right;
        font-size: 0.92rem;
        font-weight: 700;
      }

      @media (min-width: 900px) {
        main {
          padding: 30px 18px 48px;
        }

        .screen {
          border-radius: 28px;
        }

        .content {
          grid-template-columns: minmax(0, 1fr) minmax(320px, 360px);
          grid-template-areas:
            "header header"
            "hero status"
            "form status"
            "info status";
          column-gap: 20px;
          row-gap: 16px;
          padding: 22px;
        }

        .page-header {
          grid-area: header;
          max-width: 760px;
        }

        .hero-card {
          grid-area: hero;
        }

        .form-card {
          grid-area: form;
        }

        .info-card {
          grid-area: info;
        }

        .status-card {
          grid-area: status;
          align-self: start;
          position: sticky;
          top: 18px;
          margin-top: 2px;
        }

        h1 {
          font-size: 2.1rem;
        }

        .intro {
          font-size: 0.83rem;
        }

        .hero-number {
          font-size: 3.4rem;
        }

        .hero-meta {
          font-size: 0.8rem;
        }

        .form-grid {
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .form-grid label {
          font-size: 0.75rem;
        }

        .form-grid .token-field,
        .form-grid .actions {
          grid-column: 1 / -1;
        }
      }

      @media (max-width: 380px) {
        h1 {
          font-size: 1.5rem;
        }
        .hero-number {
          font-size: 2.6rem;
        }
      }
    </style>
  </head>
  <body>
    <main>
      <section id="screen-card" class="screen">
        <div class="content">
          <div class="page-header">
            <p class="kicker">JUNBAN WATCH</p>
            <h1>病院受付番号モニター</h1>
            <p class="intro">現在の待ち番号を監視し、順番が近づくと通知します。</p>
          </div>

          <section class="card hero-card">
            <div class="card-head">
              <span class="card-label">現在の待ち番号</span>
              <span id="mode-badge" class="badge badge-live">監視中</span>
            </div>
            <strong id="current-number" class="hero-number">-</strong>
            <p id="next-check" class="hero-meta">次回チェック: 30秒後</p>
          </section>

          <section class="card form-card">
            <h2 class="section-title">監視設定</h2>
            <form id="start-form" class="form-grid">
              <label>
                目標番号
                <input id="target-number" name="targetNumber" type="number" min="1" inputmode="numeric" required />
              </label>
              <label>
                事前通知しきい値
                <input id="pre-alert-threshold" name="preAlertThreshold" type="number" min="0" inputmode="numeric" value="3" required />
              </label>
              <label class="token-field">
                共有トークン
                <input id="token" name="token" type="password" autocomplete="off" required />
              </label>
              <div class="actions">
                <button id="start-button" class="primary" type="submit">監視を開始</button>
                <button id="stop-button" class="secondary" type="button">監視を停止</button>
              </div>
            </form>
            <button id="refresh-button" class="refresh" type="button">状態を更新</button>
          </section>

          <section class="card info-card">
            <p class="info-title">通知先は ntfy を使用</p>
            <p id="message" class="message">端末でトピックを購読すると通知を受け取れます。</p>
          </section>

          <section class="card status-card">
            <div class="status-head">
              <p class="status-kicker">MONITOR STATUS · しきい値 <span id="threshold-kicker">-</span></p>
              <span id="enabled-badge" class="badge badge-live">RUNNING</span>
            </div>
            <div class="status-grid">
              <div class="status-row">
                <span class="status-label">監視状態</span>
                <span id="enabled" class="status-value">停止中</span>
              </div>
              <div class="status-row">
                <span class="status-label">現在番号</span>
                <span id="target-display" class="status-value">-</span>
              </div>
              <div class="status-row">
                <span class="status-label">目標番号</span>
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
          </section>
        </div>
      </section>
    </main>

    <script>
      const tokenInput = document.getElementById('token');
      const targetInput = document.getElementById('target-number');
      const thresholdInput = document.getElementById('pre-alert-threshold');
      const message = document.getElementById('message');
      const currentNumber = document.getElementById('current-number');
      const enabled = document.getElementById('enabled');
      const targetDisplay = document.getElementById('target-display');
      const thresholdDisplay = document.getElementById('threshold-display');
      const checkedAt = document.getElementById('checked-at');
      const errorCount = document.getElementById('error-count');
      const startForm = document.getElementById('start-form');
      const refreshButton = document.getElementById('refresh-button');
      const stopButton = document.getElementById('stop-button');
      const startButton = document.getElementById('start-button');
      const modeBadge = document.getElementById('mode-badge');
      const enabledBadge = document.getElementById('enabled-badge');
      const nextCheck = document.getElementById('next-check');
      const thresholdKicker = document.getElementById('threshold-kicker');
      const TOKEN_KEY = 'hospital-number-monitor-token';

      hydrateToken();
      bindEvents();

      if (tokenInput.value) {
        refreshStatus();
      } else {
        setMessage('共有トークンを入力すると状態を取得できます。');
      }

      function bindEvents() {
        startForm.addEventListener('submit', handleStart);
        refreshButton.addEventListener('click', refreshStatus);
        stopButton.addEventListener('click', handleStop);
        tokenInput.addEventListener('change', persistToken);
        tokenInput.addEventListener('blur', persistToken);
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
        setMessage('監視を開始しています...');

        try {
          const state = await postJson('/api/start', {
            token: tokenInput.value.trim(),
            targetNumber: Number(targetInput.value),
            preAlertThreshold: Number(thresholdInput.value)
          });

          renderState(state);
          if (!state.lastError) {
            setMessage('監視を開始しました。');
          }
        } catch (error) {
          setError(error.message);
        }
      }

      async function handleStop() {
        persistToken();
        setMessage('監視を停止しています...');

        try {
          const state = await postJson('/api/stop', {
            token: tokenInput.value.trim()
          });

          renderState(state);
          if (!state.lastError) {
            setMessage('監視を停止しました。');
          }
        } catch (error) {
          setError(error.message);
        }
      }

      async function refreshStatus() {
        persistToken();

        if (!tokenInput.value.trim()) {
          setError('共有トークンを入力してください。');
          return;
        }

        setMessage('状態を取得しています...');

        try {
          const response = await fetch('/api/status?token=' + encodeURIComponent(tokenInput.value.trim()));
          const payload = await response.json();

          if (!response.ok) {
            throw new Error(payload.error || '状態取得に失敗しました。');
          }

          renderState(payload.state);
          if (!payload.state.lastError) {
            setMessage('最新状態を取得しました。');
          }
        } catch (error) {
          setError(error.message);
        }
      }

      async function postJson(url, body) {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'content-type': 'application/json'
          },
          body: JSON.stringify(body)
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || '通信に失敗しました。');
        }

        return payload.state;
      }

      function renderState(state) {
        const running = Boolean(state.enabled);
        const lastSeen = state.lastSeenNumber === null ? '--' : String(state.lastSeenNumber);

        currentNumber.textContent = lastSeen;
        enabled.textContent = running ? '監視中' : '停止中';
        targetDisplay.textContent = lastSeen;
        thresholdDisplay.textContent = state.targetNumber === null ? '-' : String(state.targetNumber);
        thresholdKicker.textContent = String(state.preAlertThreshold);
        checkedAt.textContent = formatTimestamp(state.lastCheckedAt);
        errorCount.textContent = String(state.errorCount);
        nextCheck.textContent = running
          ? '次回チェック: ' + formatNextCheck(state.lastCheckedAt)
          : '監視停止中です。開始するとチェックが再開されます。';

        setBadgeState(modeBadge, running, running ? '監視中' : '停止中');
        setBadgeState(enabledBadge, running, running ? 'RUNNING' : 'PAUSED');

        if (state.targetNumber !== null) {
          targetInput.value = String(state.targetNumber);
        }

        thresholdInput.value = String(state.preAlertThreshold);
        stopButton.disabled = !running;
        startButton.disabled = false;

        if (state.lastError) {
          setError(state.lastError);
        }
      }

      function setBadgeState(element, isRunning, label) {
        element.classList.remove('badge-live', 'badge-paused');
        element.classList.add(isRunning ? 'badge-live' : 'badge-paused');
        element.textContent = label;
      }

      function formatTimestamp(value) {
        if (!value) {
          return '-';
        }

        return new Date(value).toLocaleString('ja-JP', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
      }

      function formatNextCheck(value) {
        if (!value) {
          return '30秒後';
        }

        const nextMs = new Date(value).getTime() + 30 * 1000;
        if (Number.isNaN(nextMs)) {
          return '30秒後';
        }

        const diffSec = Math.round((nextMs - Date.now()) / 1000);
        if (diffSec <= 0) {
          return 'まもなく';
        }

        return diffSec + '秒後';
      }

      function setMessage(text) {
        message.classList.remove('error');
        message.textContent = text;
      }

      function setError(text) {
        message.classList.add('error');
        message.textContent = text;
      }
    </script>
  </body>
</html>`;
}
