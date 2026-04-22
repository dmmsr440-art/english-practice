// 瞬間英作文・編集画面
// - JA/EN/発音ポイント/カテゴリを編集
// - 削除（確認モーダル）
// - 通しナンバーは読み取り専用表示

import { updateSokkanExample, deleteSokkanExample } from "../lib/storage.js";
import { showScreen, showToast } from "../lib/ui.js";
import { refreshSokkanList } from "./sokkan-list.js";

let initialized = false;
let currentId = null;
let currentNumber = null;

export function initSokkanEditScreen() {
    if (initialized) return;

    document.getElementById("btn-back-from-edit").addEventListener("click", () => {
        showScreen("screen-sokkan-list");
    });

    document.getElementById("btn-save-edit").addEventListener("click", handleSave);
    document.getElementById("btn-delete-edit").addEventListener("click", handleDelete);

    initialized = true;
}

export function openSokkanEdit(example) {
    currentId = example.id;
    currentNumber = example.number;
    const numLabel = typeof example.number === "number"
        ? `#${String(example.number).padStart(3, "0")}`
        : "#---";
    document.getElementById("edit-number").textContent = numLabel;
    document.getElementById("input-edit-ja").value = example.ja || "";
    document.getElementById("input-edit-en").value = example.en || "";
    document.getElementById("input-edit-pron").value = example.pronunciation || "";
    document.getElementById("input-edit-category").value = example.category || "";
    showScreen("screen-sokkan-edit");
}

async function handleSave() {
    if (!currentId) return;
    const ja = document.getElementById("input-edit-ja").value.trim();
    const en = document.getElementById("input-edit-en").value.trim();
    const pronunciation = document.getElementById("input-edit-pron").value.trim();
    const category = document.getElementById("input-edit-category").value.trim();

    if (!ja) {
        showToast("日本語は必須です", "error");
        return;
    }

    const btn = document.getElementById("btn-save-edit");
    btn.disabled = true;
    btn.textContent = "保存中…";

    try {
        await updateSokkanExample(currentId, { ja, en, pronunciation, category });
        showToast("保存しました", "success");
        await refreshSokkanList();
        showScreen("screen-sokkan-list");
    } catch (err) {
        console.error("編集保存失敗:", err);
        showToast("保存に失敗しました", "error");
    } finally {
        btn.disabled = false;
        btn.textContent = "保存する";
    }
}

async function handleDelete() {
    if (!currentId) return;
    const numLabel = typeof currentNumber === "number"
        ? `#${String(currentNumber).padStart(3, "0")}`
        : "この例文";
    if (!confirm(`${numLabel} を削除します。元に戻せません。よろしいですか？`)) return;

    const btn = document.getElementById("btn-delete-edit");
    btn.disabled = true;
    btn.textContent = "削除中…";

    try {
        await deleteSokkanExample(currentId);
        showToast("削除しました", "success");
        await refreshSokkanList();
        showScreen("screen-sokkan-list");
    } catch (err) {
        console.error("削除失敗:", err);
        showToast("削除に失敗しました", "error");
    } finally {
        btn.disabled = false;
        btn.textContent = "🗑 この例文を削除";
    }
}
