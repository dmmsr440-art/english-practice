// チャンク学習・編集画面
// - chunk/意味/例文/出典/場面 を編集、削除
// - 🤖 AI生成：意味・例文

import { updateChunk, deleteChunk } from "../lib/storage.js";
import { showScreen, showToast } from "../lib/ui.js";
import { refreshChunkList } from "./chunk-list.js";
import {
    generateChunkMeaning, generateChunkExample, hasGeminiApiKey
} from "../lib/gemini.js";

let initialized = false;
let currentId = null;
let currentNumber = null;

export function initChunkEditScreen() {
    if (initialized) return;

    document.getElementById("btn-back-from-chunk-edit").addEventListener("click", () => {
        showScreen("screen-chunk-list");
    });

    document.getElementById("btn-save-chunk-edit").addEventListener("click", handleSave);
    document.getElementById("btn-delete-chunk-edit").addEventListener("click", handleDelete);

    document.getElementById("btn-ai-chunk-meaning").addEventListener("click", handleAIMeaning);
    document.getElementById("btn-ai-chunk-example").addEventListener("click", handleAIExample);

    initialized = true;
}

export function openChunkEdit(c) {
    currentId = c.id;
    currentNumber = c.number;
    const numLabel = typeof c.number === "number"
        ? `#${String(c.number).padStart(3, "0")}`
        : "#---";
    document.getElementById("chunk-edit-number").textContent = numLabel;
    document.getElementById("input-chunk-text").value = c.chunk || "";
    document.getElementById("input-chunk-meaning").value = c.meaning || "";
    document.getElementById("input-chunk-example").value = c.example || "";
    document.getElementById("input-chunk-source").value = c.source || "";
    document.getElementById("input-chunk-scene").value = c.scene || "";
    showScreen("screen-chunk-edit");
}

async function handleSave() {
    if (!currentId) return;
    const chunk = document.getElementById("input-chunk-text").value.trim();
    const meaning = document.getElementById("input-chunk-meaning").value.trim();
    const example = document.getElementById("input-chunk-example").value.trim();
    const source = document.getElementById("input-chunk-source").value.trim();
    const scene = document.getElementById("input-chunk-scene").value.trim();

    if (!chunk) {
        showToast("チャンクは必須です", "error");
        return;
    }

    const btn = document.getElementById("btn-save-chunk-edit");
    btn.disabled = true;
    btn.textContent = "保存中…";

    try {
        await updateChunk(currentId, { chunk, meaning, example, source, scene });
        showToast("保存しました", "success");
        await refreshChunkList();
        showScreen("screen-chunk-list");
    } catch (err) {
        console.error("チャンク編集保存失敗:", err);
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
        : "このチャンク";
    if (!confirm(`${numLabel} を削除します。元に戻せません。よろしいですか？`)) return;

    const btn = document.getElementById("btn-delete-chunk-edit");
    btn.disabled = true;
    btn.textContent = "削除中…";

    try {
        await deleteChunk(currentId);
        showToast("削除しました", "success");
        await refreshChunkList();
        showScreen("screen-chunk-list");
    } catch (err) {
        console.error("削除失敗:", err);
        showToast("削除に失敗しました", "error");
    } finally {
        btn.disabled = false;
        btn.textContent = "🗑 このチャンクを削除";
    }
}

async function handleAIMeaning() {
    if (!hasGeminiApiKey()) {
        showToast("設定画面でGemini APIキーを登録してください", "error", 3500);
        return;
    }
    const chunk = document.getElementById("input-chunk-text").value.trim();
    if (!chunk) {
        showToast("チャンクを入力してください", "error");
        return;
    }
    const btn = document.getElementById("btn-ai-chunk-meaning");
    const original = btn.textContent;
    btn.disabled = true;
    btn.textContent = "生成中…";
    try {
        const meaning = await generateChunkMeaning(chunk);
        document.getElementById("input-chunk-meaning").value = meaning;
        showToast("意味を生成しました", "success");
    } catch (err) {
        console.error(err);
        showToast(err.message || "AI生成に失敗しました", "error", 4000);
    } finally {
        btn.disabled = false;
        btn.textContent = original;
    }
}

async function handleAIExample() {
    if (!hasGeminiApiKey()) {
        showToast("設定画面でGemini APIキーを登録してください", "error", 3500);
        return;
    }
    const chunk = document.getElementById("input-chunk-text").value.trim();
    const meaning = document.getElementById("input-chunk-meaning").value.trim();
    if (!chunk) {
        showToast("チャンクを入力してください", "error");
        return;
    }
    const btn = document.getElementById("btn-ai-chunk-example");
    const original = btn.textContent;
    btn.disabled = true;
    btn.textContent = "生成中…";
    try {
        const example = await generateChunkExample(chunk, meaning);
        document.getElementById("input-chunk-example").value = example;
        showToast("例文を生成しました", "success");
    } catch (err) {
        console.error(err);
        showToast(err.message || "AI生成に失敗しました", "error", 4000);
    } finally {
        btn.disabled = false;
        btn.textContent = original;
    }
}
