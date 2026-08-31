// 瞬間英作文・クイック入力画面
// - 日本語を入力、英訳・発音ポイント・カテゴリを任意で追加（AI生成対応）

import { addSokkanExample } from "../lib/storage.js";
import { showScreen, showToast } from "../lib/ui.js";
import { refreshSokkanList } from "./sokkan-list.js";
import { generateTranslation, generateJapaneseFromEnglish, generatePronunciationPoints, hasGeminiApiKey } from "../lib/gemini.js";

let initialized = false;

// 他画面（構文練習など）から呼ばれたときの戻り先。
// 設定されていると、保存・戻るのあとに呼び出し元の画面へ復帰する。
let returnHandler = null;

export function initSokkanQuickAddScreen() {
    if (initialized) return;

    document.getElementById("btn-back-from-quick-add").addEventListener("click", () => {
        if (goBackToCaller()) return;
        showScreen("screen-sokkan-list");
    });

    document.getElementById("btn-save-quick").addEventListener("click", handleSave);
    document.getElementById("btn-ai-ja-quick").addEventListener("click", handleAIJapanese);
    document.getElementById("btn-ai-translate-quick").addEventListener("click", handleAITranslate);
    document.getElementById("btn-ai-pronunciation-quick").addEventListener("click", handleAIPronunciation);

    initialized = true;
}

// options（すべて任意）:
//   ja / en          … 初期値（構文練習からの引用など）
//   sourceLabel      … 「〜から引用」の表示
//   autoPronunciation… 開いた直後に発音ポイントをAI生成する
//   onReturn         … 保存・戻る のあとに呼ぶ関数（呼び出し元の画面へ復帰）
export function openSokkanQuickAdd(options = {}) {
    const {
        ja = "", en = "", sourceLabel = "",
        autoPronunciation = false, onReturn = null
    } = options;

    returnHandler = onReturn;

    document.getElementById("input-quick-ja").value = ja;
    document.getElementById("input-quick-en").value = en;
    document.getElementById("input-quick-pron").value = "";
    document.getElementById("input-quick-category").value = "";
    document.getElementById("quick-add-note").textContent = "";

    const sourceEl = document.getElementById("quick-add-source");
    if (sourceLabel) {
        sourceEl.textContent = `📋 ${sourceLabel} から引用`;
        sourceEl.hidden = false;
    } else {
        sourceEl.hidden = true;
    }

    showScreen("screen-sokkan-quick-add");

    if (autoPronunciation && en) {
        autoFillPronunciation();
    } else if (!ja) {
        setTimeout(() => document.getElementById("input-quick-ja").focus(), 100);
    }
}

// 呼び出し元の画面へ戻る（戻り先が設定されていればtrue）
function goBackToCaller() {
    const handler = returnHandler;
    returnHandler = null;
    if (!handler) return false;
    // 呼び出し元が復帰できない状態（練習を終えている等）なら瞬間英作文の一覧へ
    return handler() !== false;
}

// 開いた直後の発音ポイント自動生成
// 生成中は保存ボタンを止めて、空のまま保存されるのを防ぐ
async function autoFillPronunciation() {
    if (!hasGeminiApiKey()) return;
    const pronEl = document.getElementById("input-quick-pron");
    const saveBtn = document.getElementById("btn-save-quick");
    const noteEl = document.getElementById("quick-add-note");

    const en = document.getElementById("input-quick-en").value.trim();
    const ja = document.getElementById("input-quick-ja").value.trim();

    pronEl.disabled = true;
    saveBtn.disabled = true;
    saveBtn.textContent = "🤖 発音ポイント生成中…";
    try {
        pronEl.value = await generatePronunciationPoints(en, ja);
    } catch (err) {
        console.warn("発音ポイントの自動生成に失敗:", err);
        noteEl.textContent = "※ 発音ポイントは自動生成できませんでした（🤖ボタンで再試行できます）";
    } finally {
        pronEl.disabled = false;
        saveBtn.disabled = false;
        saveBtn.textContent = "＋ 追加する";
    }
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
        await refreshSokkanList();

        // 構文練習などから来た場合は、保存したら呼び出し元へ戻る
        if (returnHandler) {
            showToast("瞬間英作文に登録しました", "success");
            if (!goBackToCaller()) showScreen("screen-sokkan-list");
            return;
        }

        note.textContent = "✓ 追加しました。続けて入力できます。";
        jaEl.value = "";
        document.getElementById("input-quick-en").value = "";
        document.getElementById("input-quick-pron").value = "";
        document.getElementById("input-quick-category").value = "";
        jaEl.focus();
    } catch (err) {
        console.error("クイック保存失敗:", err);
        showToast("保存に失敗しました", "error");
    } finally {
        btn.disabled = false;
        btn.textContent = "＋ 追加する";
    }
}
