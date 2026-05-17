// チャンク学習・クイック入力画面
// - 英語直接入力 または 日本語→AI変換で英語チャンクを登録
// - 例文・出典も任意で登録、例文はAI生成可能

import { addChunk } from "../lib/storage.js";
import { showScreen, showToast } from "../lib/ui.js";
import { refreshChunkList } from "./chunk-list.js";
import {
    generateChunkFromJapanese, generateChunkExample, hasGeminiApiKey
} from "../lib/gemini.js";

let initialized = false;

export function initChunkQuickAddScreen() {
    if (initialized) return;

    document.getElementById("btn-back-from-chunk-quick-add").addEventListener("click", () => {
        showScreen("screen-chunk-list");
    });

    document.getElementById("btn-save-chunk-quick").addEventListener("click", handleSave);
    document.getElementById("btn-translate-chunk-quick").addEventListener("click", handleTranslate);
    document.getElementById("btn-ai-example-chunk-quick").addEventListener("click", handleAIExample);

    initialized = true;
}

export function openChunkQuickAdd() {
    document.getElementById("input-chunk-quick").value = "";
    document.getElementById("input-chunk-quick-ja").value = "";
    document.getElementById("input-chunk-quick-example").value = "";
    document.getElementById("input-chunk-quick-source").value = "";
    document.getElementById("chunk-quick-note").textContent = "";
    showScreen("screen-chunk-quick-add");
    setTimeout(() => document.getElementById("input-chunk-quick").focus(), 100);
}

async function handleTranslate() {
    if (!hasGeminiApiKey()) {
        showToast("設定画面でGemini APIキーを登録してください", "error", 3500);
        return;
    }
    const ja = document.getElementById("input-chunk-quick-ja").value.trim();
    if (!ja) {
        showToast("日本語を入力してください", "error");
        document.getElementById("input-chunk-quick-ja").focus();
        return;
    }
    const btn = document.getElementById("btn-translate-chunk-quick");
    btn.disabled = true;
    btn.textContent = "変換中…";
    try {
        const chunk = await generateChunkFromJapanese(ja);
        document.getElementById("input-chunk-quick").value = chunk;
        document.getElementById("input-chunk-quick").focus();
        showToast("英語に変換しました", "success");
    } catch (err) {
        console.error(err);
        showToast(err.message || "AI変換に失敗しました", "error", 4000);
    } finally {
        btn.disabled = false;
        btn.textContent = "🤖 英語に変換";
    }
}

async function handleAIExample() {
    if (!hasGeminiApiKey()) {
        showToast("設定画面でGemini APIキーを登録してください", "error", 3500);
        return;
    }
    const chunk = document.getElementById("input-chunk-quick").value.trim();
    const meaning = document.getElementById("input-chunk-quick-ja").value.trim();
    if (!chunk) {
        showToast("先に英語チャンクを入力してください", "error", 3500);
        return;
    }
    const btn = document.getElementById("btn-ai-example-chunk-quick");
    btn.disabled = true;
    btn.textContent = "生成中…";
    try {
        const example = await generateChunkExample(chunk, meaning);
        document.getElementById("input-chunk-quick-example").value = example;
        showToast("例文を生成しました", "success");
    } catch (err) {
        console.error(err);
        showToast(err.message || "AI生成に失敗しました", "error", 4000);
    } finally {
        btn.disabled = false;
        btn.textContent = "🤖 AI生成";
    }
}

async function handleSave() {
    const ta = document.getElementById("input-chunk-quick");
    const note = document.getElementById("chunk-quick-note");
    const btn = document.getElementById("btn-save-chunk-quick");
    const chunk = ta.value.trim();
    const meaning = document.getElementById("input-chunk-quick-ja").value.trim();
    const example = document.getElementById("input-chunk-quick-example").value.trim();
    const source = document.getElementById("input-chunk-quick-source").value.trim();

    if (!chunk) {
        showToast("チャンクを入力してください", "error");
        ta.focus();
        return;
    }

    btn.disabled = true;
    btn.textContent = "保存中…";

    try {
        await addChunk({ chunk, meaning, example, source });
        note.textContent = "✓ 追加しました。続けて入力できます。";
        ta.value = "";
        document.getElementById("input-chunk-quick-ja").value = "";
        document.getElementById("input-chunk-quick-example").value = "";
        document.getElementById("input-chunk-quick-source").value = "";
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
