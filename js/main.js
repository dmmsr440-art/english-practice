// エントリポイント
// - Firebase初期化（モジュール読み込み時）
// - 認証状態の監視
// - 画面遷移の制御

import { onAuthChange, handleRedirectResult } from "./lib/firebase.js";
import { ensureProfile } from "./lib/storage.js";
import { initLoginScreen } from "./screens/login.js";
import { initHomeScreen } from "./screens/home.js";
import { initSettingsScreen, loadSettingsData } from "./screens/settings.js";
import { initSokkanListScreen } from "./screens/sokkan-list.js";
import { initSokkanPracticeScreen } from "./screens/sokkan-practice.js";
import { initSokkanQuickAddScreen } from "./screens/sokkan-quick-add.js";
import { initSokkanEditScreen } from "./screens/sokkan-edit.js";
import { initSokkanImportScreen } from "./screens/sokkan-import.js";
import { initChunkListScreen } from "./screens/chunk-list.js";
import { initChunkPracticeScreen } from "./screens/chunk-practice.js";
import { initChunkQuickAddScreen } from "./screens/chunk-quick-add.js";
import { initChunkEditScreen } from "./screens/chunk-edit.js";
import { initStructureListScreen } from "./screens/structure-list.js";
import { initStructurePracticeScreen } from "./screens/structure-practice.js";
import { initStructureParaScreen } from "./screens/structure-para.js";
import { initStructureEditScreen } from "./screens/structure-edit.js";
import { initDashboardScreen } from "./screens/dashboard.js";
import { initShadowingLogScreen } from "./screens/shadowing-log.js";
import { initListeningLogScreen } from "./screens/listening-log.js";
import { showScreen, showToast } from "./lib/ui.js";

// 起動時処理
(async function bootstrap() {
    // リダイレクトログイン後の結果処理（モバイル対応）
    await handleRedirectResult();

    // 画面別の初期化（イベントリスナー登録）
    initLoginScreen();
    initSettingsScreen();
    initSokkanListScreen();
    initSokkanPracticeScreen();
    initSokkanQuickAddScreen();
    initSokkanEditScreen();
    initSokkanImportScreen();
    initChunkListScreen();
    initChunkPracticeScreen();
    initChunkQuickAddScreen();
    initChunkEditScreen();
    initStructureListScreen();
    initStructurePracticeScreen();
    initStructureParaScreen();
    initStructureEditScreen();
    initDashboardScreen();
    initShadowingLogScreen();
    initListeningLogScreen();

    // 認証状態の変化を監視
    onAuthChange(async (user) => {
        if (user) {
            // ログイン済み
            try {
                const profile = await ensureProfile(user);
                await initHomeScreen(profile);
                await loadSettingsData();
                showScreen("screen-home");
            } catch (err) {
                console.error("プロフィール初期化エラー:", err);
                showToast("読み込みに失敗しました。再読み込みしてください", "error", 5000);
            }
        } else {
            // 未ログイン
            showScreen("screen-login");
        }
    });
})();

// Service Worker 登録（オフライン対応）
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./service-worker.js").catch(err => {
            console.warn("Service Worker 登録失敗:", err);
        });
    });
}
