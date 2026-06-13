// トップ画面のロジック
// - Why展開コンポーネントの初期化
// - 日次チェックコンポーネントの初期化
// - モジュールカードのクリックハンドリング（Phase 0では未実装の通知）
// - Why未閲覧時のモーダルリマインダー

import { initWhyToggle, isWhyViewedTodayFlag, openWhy, isWhyOpen } from "../components/why-toggle.js";
import { initDailyCheck } from "../components/daily-check.js";
import { showScreen, showModal, hideModal } from "../lib/ui.js";
import { getStudyStats, getTodayDateKey } from "../lib/storage.js";
import { openSokkanList } from "./sokkan-list.js";
import { openChunkList } from "./chunk-list.js";
import { openDashboard } from "./dashboard.js";

let profileCache = null;
let homeInitialized = false;

export async function initHomeScreen(profile) {
    profileCache = profile;

    // Whyの初期化
    initWhyToggle(profile);

    // 日次チェックの初期化
    await initDailyCheck();

    // モジュールカード（Phase 0では未実装通知）
    document.querySelectorAll(".module-card").forEach(card => {
        card.addEventListener("click", () => {
            const moduleName = card.dataset.module;
            handleModuleClick(moduleName);
        });
    });

    // 設定画面へ
    const settingsBtn = document.getElementById("btn-open-settings");
    if (settingsBtn && !homeInitialized) {
        settingsBtn.addEventListener("click", () => {
            showScreen("screen-settings");
            // 設定画面は別途loadSettingsScreen()でデータを読む
            const evt = new CustomEvent("open-settings");
            document.dispatchEvent(evt);
        });
    }

    // モーダル：Whyリマインダーのボタン
    if (!homeInitialized) {
        document.getElementById("btn-open-why-from-modal").addEventListener("click", () => {
            hideModal("modal-why-reminder");
            openWhy();
        });
        document.getElementById("btn-skip-why").addEventListener("click", () => {
            hideModal("modal-why-reminder");
        });
        document.getElementById("btn-inactivity-close").addEventListener("click", () => {
            hideModal("modal-inactivity-warning");
        });
    }

    homeInitialized = true;

    // ストリーク表示 + 不活発警告（非同期で後から更新）
    updateStreakAndWarn();
}

async function updateStreakAndWarn() {
    try {
        const { streak, gap } = await getStudyStats();
        renderStreakBadge(streak);
        maybeShowInactivityWarning(gap);
    } catch (err) {
        console.warn("ストリーク取得失敗:", err);
    }
}

function renderStreakBadge(streak) {
    const badge = document.getElementById("streak-badge");
    if (!badge) return;
    if (streak >= 1) {
        const fire = streak >= 7 ? "🔥🔥" : "🔥";
        badge.textContent = `${fire} ${streak}日連続`;
        badge.className = "streak-badge" + (streak >= 7 ? " hot" : "");
        badge.hidden = false;
    } else {
        badge.hidden = true;
    }
}

function maybeShowInactivityWarning(gap) {
    if (gap < 2) return;
    const todayKey = getTodayDateKey();
    const storageKey = "inactivityWarningShownDate";
    if (localStorage.getItem(storageKey) === todayKey) return;
    localStorage.setItem(storageKey, todayKey);

    const title = document.getElementById("inactivity-warning-title");
    const body = document.getElementById("inactivity-warning-body");
    if (gap >= 5) {
        title.textContent = "🚨 " + gap + "日間、記録がありません";
        body.textContent = "長い空白ができています。今日から少しずつ再スタートしましょう。1つだけでも大丈夫です！";
    } else {
        title.textContent = "⚠️ " + gap + "日間、記録がありません";
        body.textContent = "学習の間が空いています。今日、1つだけチェックしてみましょう！";
    }
    showModal("modal-inactivity-warning");
}

function handleModuleClick(moduleName) {
    // Whyをまだ今日見ていない場合はモーダルで促す
    if (!isWhyViewedTodayFlag() && !isWhyOpen()) {
        showModal("modal-why-reminder");
        return;
    }

    if (moduleName === "sokkan") {
        openSokkanList();
        return;
    }
    if (moduleName === "chunk") {
        openChunkList();
        return;
    }
    if (moduleName === "dashboard") {
        openDashboard();
        return;
    }
}
