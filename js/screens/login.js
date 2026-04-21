// ログイン画面のロジック

import { signInWithGoogle } from "../lib/firebase.js";
import { showToast } from "../lib/ui.js";

let loginInitialized = false;

export function initLoginScreen() {
    if (loginInitialized) return;

    const btn = document.getElementById("btn-google-login");
    btn.addEventListener("click", async () => {
        btn.disabled = true;
        const originalText = btn.innerHTML;
        btn.innerHTML = '<span>ログイン中...</span>';

        try {
            await signInWithGoogle();
            // 認証成功時は main.js の onAuthChange が次の処理を担う
        } catch (err) {
            console.error(err);
            let msg = "ログインに失敗しました";
            if (err.code === "auth/popup-blocked") {
                msg = "ポップアップがブロックされています。設定を確認してください";
            } else if (err.code === "auth/popup-closed-by-user") {
                msg = "ログインがキャンセルされました";
            } else if (err.code === "auth/network-request-failed") {
                msg = "ネットワークエラーが発生しました";
            }
            showToast(msg, "error");
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    });

    loginInitialized = true;
}
