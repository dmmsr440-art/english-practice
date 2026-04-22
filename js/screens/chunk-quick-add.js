// チャンク学習・クイック入力画面
// - チャンクのみ即メモ（意味・例文は後で編集/AI生成）

import { addChunk } from "../lib/storage.js";
import { showScreen, showToast } from "../lib/ui.js";
import { refreshChunkList } from "./chunk-list.js";

let initialized = false;

export function initChunkQuickAddScreen() {
    if (initialized) return;

    document.getElementById("btn-back-from-chunk-quick-add").addEventListener("click", () => {
        showScreen("screen-chunk-list");
    });

    document.getElementById("btn-save-chunk-quick").addEventListener("click", handleSave);

    initialized = true;
}

export function openChunkQuickAdd() {
    const ta = document.getElementById("input-chunk-quick");
    ta.value = "";
    document.getElementById("chunk-quick-note").textContent = "";
    showScreen("screen-chunk-quick-add");
    setTimeout(() => ta.focus(), 100);
}

async function handleSave() {
    const ta = document.getElementById("input-chunk-quick");
    const note = document.getElementById("chunk-quick-note");
    const btn = document.getElementById("btn-save-chunk-quick");
    const chunk = ta.value.trim();

    if (!chunk) {
        showToast("チャンクを入力してください", "error");
        ta.focus();
        return;
    }

    btn.disabled = true;
    btn.textContent = "保存中…";

    try {
        await addChunk({ chunk });
        note.textContent = "✓ 追加しました。続けて入力できます。";
        ta.value = "";
        ta.focus();
        await refreshChunkList();
    } catch (err) {
        console.error("チャンク保存失敗:", err);
        showToast("保存に失敗しました", "error");
    } finally {
        btn.disabled = false;
        btn.textContent = "＋ 追加する";
    }
}
