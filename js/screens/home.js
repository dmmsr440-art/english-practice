// トップ画面のロジック
// - Why展開コンポーネントの初期化
// - 日次チェックコンポーネントの初期化
// - モジュールカードのクリックハンドリング（Phase 0では未実装の通知）
// - Why未閲覧時のモーダルリマインダー

import { initWhyToggle, isWhyViewedTodayFlag, openWhy, isWhyOpen } from "../components/why-toggle.js";
import { initDailyCheck } from "../components/daily-check.js";
import { showScreen, showModal, hideModal, showToast } from "../lib/ui.js";

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
    }

    homeInitialized = true;
}

function handleModuleClick(moduleName) {
    // Whyをまだ今日見ていない場合はモーダルで促す
    if (!isWhyViewedTodayFlag() && !isWhyOpen()) {
        showModal("modal-why-reminder");
        return;
    }

    // Phase 0では各モジュールは未実装
    const names = {
        sokkan: "瞬間英作文",
        chunk: "チャンク学習",
        shadowing: "シャドーイングログ",
        cambly: "Camblyログ",
        listening: "多聴ログ",
        solo: "独り言ログ",
        dashboard: "進捗ダッシュボード"
    };
    showToast(`${names[moduleName] || "このモジュール"} は Phase 1 以降で実装予定です`, "default", 3000);
}
