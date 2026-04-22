// 瞬間英作文・編集画面
// - JA/EN/発音ポイント/カテゴリを編集
// - 削除（確認モーダル）
// - 通しナンバーは読み取り専用表示

import { updateSokkanExample, deleteSokkanExample } from "../lib/storage.js";
import { showScreen, showToast } from "../lib/ui.js";
import { refreshSokkanList } from "./sokkan-list.js";
import {
    generateTranslation, generatePronunciationPoints, hasGeminiApiKey
} from "../lib/gemini.js";

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

    document.getElementById("btn-ai-translate").addEventListener("click", handleAITranslate);
    document.getElementById("btn-ai-pronunciation").addEventListener("click", handleAIPronunciation);

    initialized = true;
}

async function handleAITranslate() {
    if (!hasGeminiApiKey()) {
        showToast("設定画面でGemini APIキーを登録してください", "error", 3500);
        return;
    }
    const ja = document.getElementById("input-edit-ja").value.trim();
    if (!ja) {
        showToast("日本語を入力してください", "error");
        return;
    }
    const btn = document.getElementById("btn-ai-translate");
    const original = btn.textContent;
    btn.disabled = true;
    btn.textContent = "生成中…";
    try {
        const en = await generateTranslation(ja);
        document.getElementById("input-edit-en").value = en;
        showToast("英訳を生成しました", "success");
    } catch (err) {
        console.error(err);
        showToast(err.message || "AI生成に失敗しました", "error", 4000);
    } finally {
        btn.disabled = false;
        btn.textContent = original;
    }
}

async function handleAIPronunciation() {
    if (!hasGeminiApiKey()) {
        showToast("設定画面でGemini APIキーを登録してください", "error", 3500);
        return;
    }
    const en = document.getElementById("input-edit-en").value.trim();
    const ja = document.getElementById("input-edit-ja").value.trim();
    if (!en) {
        showToast("先に英訳を入力・生成してください", "error");
        return;
    }
    const btn = document.getElementById("btn-ai-pronunciation");
    const original = btn.textContent;
    btn.disabled = true;
    btn.textContent = "生成中…";
    try {
        const pron = await generatePronunciationPoints(en, ja);
        document.getElementById("input-edit-pron").value = pron;
        showToast("発音ポイントを生成しました", "success");
    } catch (err) {
        console.error(err);
        showToast(err.message || "AI生成に失敗しました", "error", 4000);
    } finally {
        btn.disabled = false;
        btn.textContent = original;
    }
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
