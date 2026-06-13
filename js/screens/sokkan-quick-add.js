// 瞬間英作文・クイック入力画面
// - 日本語を入力、英訳・発音ポイント・カテゴリを任意で追加（AI生成対応）

import { addSokkanExample } from "../lib/storage.js";
import { showScreen, showToast } from "../lib/ui.js";
import { refreshSokkanList } from "./sokkan-list.js";
import { generateTranslation, generateJapaneseFromEnglish, generatePronunciationPoints, hasGeminiApiKey } from "../lib/gemini.js";

let initialized = false;

export function initSokkanQuickAddScreen() {
    if (initialized) return;

    document.getElementById("btn-back-from-quick-add").addEventListener("click", () => {
        showScreen("screen-sokkan-list");
    });

    document.getElementById("btn-save-quick").addEventListener("click", handleSave);
    document.getElementById("btn-ai-ja-quick").addEventListener("click", handleAIJapanese);
    document.getElementById("btn-ai-translate-quick").addEventListener("click", handleAITranslate);
    document.getElementById("btn-ai-pronunciation-quick").addEventListener("click", handleAIPronunciation);

    initialized = true;
}

export function openSokkanQuickAdd() {
    document.getElementById("input-quick-ja").value = "";
    document.getElementById("input-quick-en").value = "";
    document.getElementById("input-quick-pron").value = "";
    document.getElementById("input-quick-category").value = "";
    document.getElementById("quick-add-note").textContent = "";
    showScreen("screen-sokkan-quick-add");
    setTimeout(() => document.getElementById("input-quick-ja").focus(), 100);
}

async function handleAIJapanese() {
    if (!hasGeminiApiKey()) {
        showToast("設定画面でGemini APIキーを登録してください", "error", 3500);
        return;
    }
    const en = document.getElementById("input-quick-en").value.trim();
    if (!en) {
        showToast("先に英語を入力してください", "error");
        document.getElementById("input-quick-en").focus();
        return;
    }
    const btn = document.getElementById("btn-ai-ja-quick");
    btn.disabled = true;
    btn.textContent = "生成中…";
    try {
        const ja = await generateJapaneseFromEnglish(en);
        document.getElementById("input-quick-ja").value = ja;
        showToast("和訳を生成しました", "success");
    } catch (err) {
        console.error(err);
        showToast(err.message || "AI生成に失敗しました", "error", 4000);
    } finally {
        btn.disabled = false;
        btn.textContent = "🤖 英語から和訳";
    }
}

async function handleAITranslate() {
    if (!hasGeminiApiKey()) {
        showToast("設定画面でGemini APIキーを登録してください", "error", 3500);
        return;
    }
    const ja = document.getElementById("input-quick-ja").value.trim();
    if (!ja) {
        showToast("日本語を入力してください", "error");
        document.getElementById("input-quick-ja").focus();
        return;
    }
    const btn = document.getElementById("btn-ai-translate-quick");
    btn.disabled = true;
    btn.textContent = "生成中…";
    try {
        const en = await generateTranslation(ja);
        document.getElementById("input-quick-en").value = en;
        showToast("英訳を生成しました", "success");
    } catch (err) {
        console.error(err);
        showToast(err.message || "AI生成に失敗しました", "error", 4000);
    } finally {
        btn.disabled = false;
        btn.textContent = "🤖 AI生成";
    }
}

async function handleAIPronunciation() {
    if (!hasGeminiApiKey()) {
        showToast("設定画面でGemini APIキーを登録してください", "error", 3500);
        return;
    }
    const en = document.getElementById("input-quick-en").value.trim();
    const ja = document.getElementById("input-quick-ja").value.trim();
    if (!en) {
        showToast("先に英訳を入力・生成してください", "error", 3500);
        return;
    }
    const btn = document.getElementById("btn-ai-pronunciation-quick");
    btn.disabled = true;
    btn.textContent = "生成中…";
    try {
        const pron = await generatePronunciationPoints(en, ja);
        document.getElementById("input-quick-pron").value = pron;
        showToast("発音ポイントを生成しました", "success");
    } catch (err) {
        console.error(err);
        showToast(err.message || "AI生成に失敗しました", "error", 4000);
    } finally {
        btn.disabled = false;
        btn.textContent = "🤖 AI生成";
    }
}

async function handleSave() {
    const jaEl = document.getElementById("input-quick-ja");
    const note = document.getElementById("quick-add-note");
    const btn = document.getElementById("btn-save-quick");
    const ja = jaEl.value.trim();
    const en = document.getElementById("input-quick-en").value.trim();
    const pronunciation = document.getElementById("input-quick-pron").value.trim();
    const category = document.getElementById("input-quick-category").value;

    if (!ja) {
        showToast("日本語を入力してください", "error");
        jaEl.focus();
        return;
    }

    btn.disabled = true;
    btn.textContent = "保存中…";

    try {
        await addSokkanExample({ ja, en, pronunciation, category });
        note.textContent = "✓ 追加しました。続けて入力できます。";
        jaEl.value = "";
        document.getElementById("input-quick-en").value = "";
        document.getElementById("input-quick-pron").value = "";
        document.getElementById("input-quick-category").value = "";
        jaEl.focus();
        await refreshSokkanList();
    } catch (err) {
        console.error("クイック保存失敗:", err);
        showToast("保存に失敗しました", "error");
    } finally {
        btn.disabled = false;
        btn.textContent = "＋ 追加する";
    }
}
