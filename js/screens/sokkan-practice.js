// 瞬間英作文・練習画面
// - モード：normal / flag / single
// - 順番はランダムシャッフル
// - 日本語 → 回答表示 → TTS・発音ポイント・フラグ
// - 回答を見た時点で練習回数を +1

import {
    setSokkanFlagLevel, recordSokkanPractice,
    FLAG_ICONS, FLAG_LABELS, normalizeFlagLevel, nextFlagLevel
} from "../lib/storage.js";
import { showScreen, showToast } from "../lib/ui.js";
import { speak, stopSpeaking } from "../lib/tts.js";
import { refreshSokkanList } from "./sokkan-list.js";

let practiceInitialized = false;
let queue = [];
let idx = 0;
let revealed = false;
let currentMode = "normal";
let recordedIds = new Set(); // 同セッションで重複加算しない

export function initSokkanPracticeScreen() {
    if (practiceInitialized) return;

    document.getElementById("btn-back-from-practice").addEventListener("click", () => {
        if (!confirm("練習を終了して一覧に戻りますか？")) return;
        exitPractice();
    });

    document.getElementById("btn-reveal-answer").addEventListener("click", revealAnswer);
    document.getElementById("btn-speak").addEventListener("click", () => {
        const en = queue[idx]?.en || "";
        if (en) speak(en);
    });
    document.getElementById("btn-next-question").addEventListener("click", next);
    document.getElementById("btn-prev-question").addEventListener("click", prev);
    document.getElementById("btn-toggle-flag").addEventListener("click", handleFlagToggle);

    practiceInitialized = true;
}

export function startPractice({ mode, examples }) {
    if (!examples || examples.length === 0) {
        showToast("例文がありません", "error");
        return;
    }
    currentMode = mode;
    queue = (mode === "single") ? [...examples] : shuffle([...examples]);
    idx = 0;
    revealed = false;
    recordedIds = new Set();
    showScreen("screen-sokkan-practice");
    render();
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function render() {
    const title = document.getElementById("practice-title");
    const progress = document.getElementById("practice-progress");
    const empty = document.getElementById("practice-empty");
    const card = document.querySelector(".practice-card");
    const footer = document.querySelector(".practice-footer");

    if (queue.length === 0) {
        empty.hidden = false;
        card.style.display = "none";
        footer.style.display = "none";
        progress.textContent = "";
        return;
    }
    empty.hidden = true;
    card.style.display = "";
    footer.style.display = "";

    const modeLabel = {
        normal: "練習中",
        flag: "🚩フラグ練習",
        single: "1問練習"
    }[currentMode] || "練習中";
    title.textContent = modeLabel;

    const cur = queue[idx];
    const numLabel = typeof cur?.number === "number"
        ? `#${String(cur.number).padStart(3, "0")}`
        : "";
    const countBadge = `<span class="practice-count-badge">練習 ${cur.practiceCount || 0}回</span>`;
    progress.innerHTML = (numLabel
        ? `<span class="practice-num">${numLabel}</span> ・ ${idx + 1} / ${queue.length}問目`
        : `${idx + 1} / ${queue.length}問目`) + ` ・ ${countBadge}`;
    document.getElementById("practice-jp").textContent = cur.ja;
    document.getElementById("practice-en").textContent = cur.en || "（英訳未登録）";
    // 発音ポイントはHTMLを含むのでinnerHTML
    document.getElementById("practice-pron").innerHTML = cur.pronunciation ||
        '<span class="pron-missing">発音ポイントは未登録です</span>';

    // フラグ表示
    updateFlagUI(cur.flagLevel);

    // リビール状態
    document.getElementById("practice-reveal").hidden = !revealed;
    document.getElementById("btn-reveal-answer").hidden = revealed;

    // 前へ/次へのラベル
    document.getElementById("btn-prev-question").disabled = (idx === 0);
    const nextBtn = document.getElementById("btn-next-question");
    nextBtn.textContent = (idx === queue.length - 1) ? "終了 ✓" : "次の問題 →";
}

function updateFlagUI(flagLevel) {
    const level = normalizeFlagLevel(flagLevel);
    const icon = document.getElementById("flag-icon");
    const text = document.getElementById("flag-text");
    const btn = document.getElementById("btn-toggle-flag");
    icon.textContent = FLAG_ICONS[level];
    text.textContent = `${FLAG_LABELS[level]}（タップで切替）`;
    btn.classList.remove("flag-red", "flag-yellow", "flag-blue");
    btn.classList.add(`flag-${level}`);
}

function revealAnswer() {
    revealed = true;
    const cur = queue[idx];
    if (!cur) return;

    document.getElementById("practice-reveal").hidden = false;
    document.getElementById("btn-reveal-answer").hidden = true;

    // 練習回数を +1（同セッションで同例文は1回まで）
    if (!recordedIds.has(cur.id)) {
        recordedIds.add(cur.id);
        cur.practiceCount = (cur.practiceCount || 0) + 1;
        recordSokkanPractice(cur.id).catch(err => {
            console.warn("練習回数の記録失敗:", err);
        });
    }

    // 自動で音声再生（UX）
    if (cur.en) speak(cur.en);
}

function next() {
    stopSpeaking();
    if (idx === queue.length - 1) {
        showToast(`お疲れさまでした（${queue.length}問）`, "success", 3000);
        // 最後まで終えたので確認なしで戻る
        exitPractice();
        return;
    }
    idx += 1;
    revealed = false;
    render();
}

async function exitPractice() {
    stopSpeaking();
    showScreen("screen-sokkan-list");
    await refreshSokkanList();
}

function prev() {
    stopSpeaking();
    if (idx === 0) return;
    idx -= 1;
    revealed = false;
    render();
}

async function handleFlagToggle() {
    const cur = queue[idx];
    if (!cur) return;
    const prevLevel = normalizeFlagLevel(cur.flagLevel);
    const newLevel = nextFlagLevel(prevLevel);
    cur.flagLevel = newLevel;
    updateFlagUI(newLevel);
    try {
        await setSokkanFlagLevel(cur.id, newLevel);
    } catch (err) {
        cur.flagLevel = prevLevel;
        updateFlagUI(prevLevel);
        showToast("保存に失敗しました", "error");
    }
}
