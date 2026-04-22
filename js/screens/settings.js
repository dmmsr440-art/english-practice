// 設定画面のロジック
// - プロフィール表示（メール）
// - Why Statement 編集
// - Goal Statement 編集
// - ログアウト

import {
    getProfile, saveWhyStatement, saveGoalStatement,
    saveGeminiApiKey
} from "../lib/storage.js";
import { signOutUser, auth } from "../lib/firebase.js";
import { showScreen, showToast } from "../lib/ui.js";
import { refreshWhyText } from "../components/why-toggle.js";
import { setGeminiApiKey } from "../lib/gemini.js";

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

    // Gemini APIキー：表示切替
    document.getElementById("chk-reveal-gemini-key").addEventListener("change", (evt) => {
        const input = document.getElementById("input-gemini-key");
        input.type = evt.target.checked ? "text" : "password";
    });

    // Gemini APIキー：保存
    document.getElementById("btn-save-gemini-key").addEventListener("click", async () => {
        const key = document.getElementById("input-gemini-key").value.trim();
        const statusEl = document.getElementById("gemini-key-status");
        try {
            await saveGeminiApiKey(key);
            setGeminiApiKey(key);
            statusEl.textContent = key ? "✓ APIキーを保存しました" : "APIキーを削除しました";
            showToast(key ? "APIキーを保存しました" : "APIキーを削除しました", "success");
        } catch (err) {
            console.error(err);
            showToast("保存に失敗しました", "error");
        }
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

    const geminiInput = document.getElementById("input-gemini-key");
    const geminiStatus = document.getElementById("gemini-key-status");
    const key = profile.geminiApiKey || "";
    geminiInput.value = key;
    setGeminiApiKey(key);
    geminiStatus.textContent = key ? "✓ 登録済み" : "未設定";
}
