// 瞬間英作文・クイック入力画面
// - 会議中に詰まった日本語を即メモ（日本語のみ）
// - 英訳・発音ポイントは空で保存（後でAI生成または編集で追加）

import { addSokkanExample } from "../lib/storage.js";
import { showScreen, showToast } from "../lib/ui.js";
import { refreshSokkanList } from "./sokkan-list.js";

let initialized = false;

export function initSokkanQuickAddScreen() {
    if (initialized) return;

    document.getElementById("btn-back-from-quick-add").addEventListener("click", () => {
        showScreen("screen-sokkan-list");
    });

    document.getElementById("btn-save-quick").addEventListener("click", handleSave);

    initialized = true;
}

export function openSokkanQuickAdd() {
    const ta = document.getElementById("input-quick-ja");
    ta.value = "";
    document.getElementById("quick-add-note").textContent = "";
    showScreen("screen-sokkan-quick-add");
    setTimeout(() => ta.focus(), 100);
}

async function handleSave() {
    const ta = document.getElementById("input-quick-ja");
    const note = document.getElementById("quick-add-note");
    const btn = document.getElementById("btn-save-quick");
    const ja = ta.value.trim();

    if (!ja) {
        showToast("日本語を入力してください", "error");
        ta.focus();
        return;
    }

    btn.disabled = true;
    btn.textContent = "保存中…";

    try {
        await addSokkanExample({ ja });
        note.textContent = "✓ 追加しました。続けて入力できます。";
        ta.value = "";
        ta.focus();
        await refreshSokkanList();
    } catch (err) {
        console.error("クイック保存失敗:", err);
        showToast("保存に失敗しました", "error");
    } finally {
        btn.disabled = false;
        btn.textContent = "＋ 追加する";
    }
}
