// 設定画面のロジック
// - プロフィール表示（メール）
// - Why Statement 編集
// - Goal Statement 編集
// - ログアウト

import {
    getProfile, saveWhyStatement, saveGoalStatement
} from "../lib/storage.js";
import { signOutUser, auth } from "../lib/firebase.js";
import { showScreen, showToast } from "../lib/ui.js";
import { refreshWhyText } from "../components/why-toggle.js";

let settingsInitialized = false;

export function initSettingsScreen() {
    if (settingsInitialized) return;

    // 戻るボタン
    document.getElementById("btn-back-from-settings").addEventListener("click", () => {
        showScreen("screen-home");
    });

    // Whyを保存
    document.getElementById("btn-save-why").addEventListener("click", async () => {
        const text = document.getElementById("input-why-statement").value.trim();
        if (!text) {
            showToast("Why Statementは空にできません", "error");
            return;
        }
        try {
            await saveWhyStatement(text);
            refreshWhyText(text);
            showToast("Why Statementを保存しました", "success");
        } catch (err) {
            console.error(err);
            showToast("保存に失敗しました", "error");
        }
    });

    // Goalを保存
    document.getElementById("btn-save-goal").addEventListener("click", async () => {
        const text = document.getElementById("input-goal-statement").value.trim();
        if (!text) {
            showToast("Goal Statementは空にできません", "error");
            return;
        }
        try {
            await saveGoalStatement(text);
            showToast("Goal Statementを保存しました", "success");
        } catch (err) {
            console.error(err);
            showToast("保存に失敗しました", "error");
        }
    });

    // ログアウト
    document.getElementById("btn-logout").addEventListener("click", async () => {
        if (!confirm("ログアウトしますか？")) return;
        try {
            await signOutUser();
            // 認証状態変化はmain.jsで検知される
        } catch (err) {
            console.error(err);
            showToast("ログアウトに失敗しました", "error");
        }
    });

    // 「設定を開く」イベント（home.jsから発火）
    document.addEventListener("open-settings", async () => {
        await loadSettingsData();
    });

    settingsInitialized = true;
}

export async function loadSettingsData() {
    const profile = await getProfile();
    if (!profile) return;

    document.getElementById("settings-email").textContent =
        auth.currentUser?.email || profile.email || "-";
    document.getElementById("input-why-statement").value = profile.whyStatement || "";
    document.getElementById("input-goal-statement").value = profile.goalStatement || "";
}
