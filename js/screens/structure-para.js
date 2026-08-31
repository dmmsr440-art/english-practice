// 構文・パラフレ・AIパラフレ練習
// - 構文（型）をGeminiに渡し、その型を使った新しい英文＋和訳を生成
// - 英語は隠して日本語だけを提示 → 自分で英作文 → 「答え合わせ」でAIの英文を表示
// - 1構文につき3問。答え合わせした時点で、その構文の練習回数を +1

import {
    setStructureFlagLevel, recordStructurePractice,
    STRUCTURE_CATEGORY_LABELS,
    FLAG_ICONS, FLAG_LABELS, normalizeFlagLevel, nextFlagLevel
} from "../lib/storage.js";
import { showScreen, showToast } from "../lib/ui.js";
import { speak, stopSpeaking } from "../lib/tts.js";
import { generateParaphraseSet, hasGeminiApiKey } from "../lib/gemini.js";
import { refreshStructureList } from "./structure-list.js";
import { resumeStructurePractice } from "./structure-practice.js";
import { openSokkanQuickAdd } from "./sokkan-quick-add.js";

const QUESTIONS_PER_STRUCTURE = 3;

let initialized = false;
let pool = [];          // 出題対象の構文
let pIdx = 0;           // 構文のindex
let items = [];         // 現在の構文のAI生成問題 [{en, ja}]
let qIdx = 0;           // 問題のindex
let revealed = false;
let loading = false;
let loadError = "";
let returnTo = "list";  // "list" | "practice"
let recordedIds = new Set();

export function initStructureParaScreen() {
    if (initialized) return;

    document.getElementById("btn-back-from-structure-para").addEventListener("click", () => {
        if (!confirm("AIパラフレを終了しますか？")) return;
        exitPara();
    });

    document.getElementById("btn-structure-para-reveal").addEventListener("click", revealAnswer);
    document.getElementById("btn-structure-para-speak").addEventListener("click", () => {
        const en = items[qIdx]?.en;
        if (en) speak(en);
    });
    document.getElementById("btn-structure-para-next").addEventListener("click", next);
    document.getElementById("btn-structure-para-regen").addEventListener("click", () => {
        loadItemsForCurrent({ force: true });
    });
    document.getElementById("btn-structure-para-flag").addEventListener("click", handleFlagToggle);
    document.getElementById("btn-structure-para-to-sokkan").addEventListener("click", handleAddToSokkan);

    initialized = true;
}

// AIが作った問題を瞬間英作文へ（クイック入力画面で編集してから保存）
function handleAddToSokkan() {
    const cur = pool[pIdx];
    const item = items[qIdx];
    if (!cur || !item) return;
    stopSpeaking();
    const numLabel = typeof cur.number === "number"
        ? `#${String(cur.number).padStart(3, "0")} ${cur.pattern}`
        : cur.pattern;
    openSokkanQuickAdd({
        ja: item.ja || "",
        en: item.en || "",
        sourceLabel: `🤖 AIパラフレ・🗂 ${numLabel}`,
        autoPronunciation: true,
        onReturn: () => resumeStructurePara()
    });
}

// パラフレ練習に戻る（瞬間英作文への登録から復帰したときなど。状態はそのまま）
export function resumeStructurePara() {
    if (pool.length === 0) return false;
    showScreen("screen-structure-para");
    render();
    return true;
}

export function startStructurePara({ structures, returnTo: from = "list" }) {
    if (!hasGeminiApiKey()) {
        showToast("設定画面でGemini APIキーを登録してください", "error", 3500);
        return;
    }
    const usable = (structures || []).filter(s => s.pattern);
    if (usable.length === 0) {
        showToast("該当する構文がありません", "error");
        return;
    }
    returnTo = from;
    pool = (usable.length === 1) ? [...usable] : shuffle([...usable]);
    pIdx = 0;
    items = [];
    qIdx = 0;
    revealed = false;
    loadError = "";
    recordedIds = new Set();
    showScreen("screen-structure-para");
    render();
    loadItemsForCurrent();
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

async function loadItemsForCurrent({ force = false } = {}) {
    const cur = pool[pIdx];
    if (!cur) return;
    if (loading) return;
    if (!force && items.length > 0) return;

    loading = true;
    loadError = "";
    items = [];
    qIdx = 0;
    revealed = false;
    render();

    try {
        items = await generateParaphraseSet({
            pattern: cur.pattern,
            meaning: cur.meaning,
            examples: cur.examples || [],
            count: QUESTIONS_PER_STRUCTURE
        });
    } catch (err) {
        console.error("パラフレ生成失敗:", err);
        loadError = err.message || "問題の生成に失敗しました";
    } finally {
        loading = false;
        render();
    }
}

function render() {
    const progress = document.getElementById("structure-para-progress");
    const patternCard = document.querySelector("#screen-structure-para .structure-pattern-card");
    const loadingEl = document.getElementById("structure-para-loading");
    const card = document.getElementById("structure-para-card");
    const footer = document.querySelector("#screen-structure-para .practice-footer");
    const emptyEl = document.getElementById("structure-para-empty");

    const cur = pool[pIdx];
    if (!cur) {
        patternCard.hidden = true;
        loadingEl.hidden = true;
        card.hidden = true;
        footer.hidden = true;
        emptyEl.hidden = false;
        emptyEl.textContent = "出題できる構文がありません。";
        progress.textContent = "";
        return;
    }

    patternCard.hidden = false;
    document.getElementById("structure-para-pattern").textContent = cur.pattern || "";
    document.getElementById("structure-para-meaning").textContent = cur.meaning || "";
    document.getElementById("structure-para-cat").textContent =
        STRUCTURE_CATEGORY_LABELS[cur.category] || "";

    const numLabel = typeof cur.number === "number"
        ? `<span class="practice-num">#${String(cur.number).padStart(3, "0")}</span>`
        : "";
    const parts = [];
    if (numLabel) parts.push(numLabel);
    if (pool.length > 1) parts.push(`${pIdx + 1} / ${pool.length}構文`);
    if (items.length > 0) parts.push(`問題 ${qIdx + 1} / ${items.length}`);
    parts.push(`<span class="practice-count-badge">練習 ${cur.practiceCount || 0}回</span>`);
    progress.innerHTML = parts.join(" ・ ");

    // ローディング中
    if (loading) {
        loadingEl.hidden = false;
        card.hidden = true;
        emptyEl.hidden = true;
        footer.hidden = true;
        return;
    }
    loadingEl.hidden = true;

    // 生成エラー
    if (loadError) {
        card.hidden = true;
        emptyEl.hidden = false;
        emptyEl.textContent = `${loadError}\n「🔄 作り直す」でもう一度試せます。`;
        footer.hidden = false;
        document.getElementById("btn-structure-para-next").textContent =
            (pIdx === pool.length - 1) ? "終了 ✓" : "次の構文 →";
        return;
    }

    emptyEl.hidden = true;
    card.hidden = false;
    footer.hidden = false;

    const item = items[qIdx];
    document.getElementById("structure-para-ja").textContent = item?.ja || "";
    document.getElementById("structure-para-en").textContent = item?.en || "";

    updateFlagUI(cur.flagLevel);

    document.getElementById("structure-para-reveal").hidden = !revealed;
    document.getElementById("btn-structure-para-reveal").hidden = revealed;

    const isLastQuestion = (qIdx === items.length - 1);
    const isLastStructure = (pIdx === pool.length - 1);
    const nextBtn = document.getElementById("btn-structure-para-next");
    if (!isLastQuestion) {
        nextBtn.textContent = "次の問題 →";
    } else if (!isLastStructure) {
        nextBtn.textContent = "次の構文 →";
    } else {
        nextBtn.textContent = "終了 ✓";
    }
}

function updateFlagUI(flagLevel) {
    const level = normalizeFlagLevel(flagLevel);
    const btn = document.getElementById("btn-structure-para-flag");
    document.getElementById("structure-para-flag-icon").textContent = FLAG_ICONS[level];
    document.getElementById("structure-para-flag-text").textContent =
        `${FLAG_LABELS[level]}（タップで切替）`;
    btn.classList.remove("flag-red", "flag-yellow", "flag-blue");
    btn.classList.add(`flag-${level}`);
}

function revealAnswer() {
    const cur = pool[pIdx];
    const item = items[qIdx];
    if (!cur || !item) return;
    revealed = true;

    if (!recordedIds.has(cur.id)) {
        recordedIds.add(cur.id);
        cur.practiceCount = (cur.practiceCount || 0) + 1;
        recordStructurePractice(cur.id).catch(err => {
            console.warn("練習回数の記録失敗:", err);
        });
    }

    render();
    if (item.en) speak(item.en);
}

function next() {
    stopSpeaking();
    const isLastQuestion = (qIdx >= items.length - 1);

    if (!isLastQuestion) {
        qIdx += 1;
        revealed = false;
        clearAnswerInput();
        render();
        return;
    }

    if (pIdx === pool.length - 1) {
        showToast("お疲れさまでした", "success", 3000);
        exitPara();
        return;
    }

    pIdx += 1;
    items = [];
    qIdx = 0;
    revealed = false;
    clearAnswerInput();
    loadItemsForCurrent();
}

function clearAnswerInput() {
    const el = document.getElementById("input-structure-para-answer");
    if (el) el.value = "";
}

async function exitPara() {
    stopSpeaking();
    clearAnswerInput();
    const from = returnTo;
    pool = [];
    items = [];
    if (from === "practice" && resumeStructurePractice()) return;
    showScreen("screen-structure-list");
    await refreshStructureList();
}

async function handleFlagToggle() {
    const cur = pool[pIdx];
    if (!cur) return;
    const prevLevel = normalizeFlagLevel(cur.flagLevel);
    const newLevel = nextFlagLevel(prevLevel);
    cur.flagLevel = newLevel;
    updateFlagUI(newLevel);
    try {
        await setStructureFlagLevel(cur.id, newLevel);
    } catch (err) {
        cur.flagLevel = prevLevel;
        updateFlagUI(prevLevel);
        showToast("保存に失敗しました", "error");
    }
}
