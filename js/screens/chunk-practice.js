// チャンク学習・フラッシュカード練習画面
// - 表：英語チャンクのみ → タップ/ボタンでめくる
// - 裏：意味・例文・出典・場面
// - 前後移動・TTS・フラグ・練習回数記録

import {
    setChunkFlagLevel, recordChunkPractice,
    FLAG_ICONS, FLAG_LABELS, normalizeFlagLevel, nextFlagLevel
} from "../lib/storage.js";
import { showScreen, showToast } from "../lib/ui.js";
import { speak, stopSpeaking } from "../lib/tts.js";
import { refreshChunkList } from "./chunk-list.js";

let initialized = false;
let queue = [];
let idx = 0;
let flipped = false;
let currentMode = "normal";
let recordedIds = new Set();

export function initChunkPracticeScreen() {
    if (initialized) return;

    document.getElementById("btn-back-from-chunk-practice").addEventListener("click", () => {
        if (!confirm("練習を終了して一覧に戻りますか？")) return;
        exitPractice();
    });

    document.getElementById("flashcard").addEventListener("click", toggleFlip);
    document.getElementById("btn-chunk-speak").addEventListener("click", (evt) => {
        evt.stopPropagation();
        const c = queue[idx];
        if (c?.chunk) speak(c.chunk);
    });
    document.getElementById("btn-chunk-speak-example").addEventListener("click", (evt) => {
        evt.stopPropagation();
        const c = queue[idx];
        if (c?.example) speak(c.example);
    });
    document.getElementById("btn-chunk-next").addEventListener("click", next);
    document.getElementById("btn-chunk-prev").addEventListener("click", prev);
    document.getElementById("btn-chunk-toggle-flag").addEventListener("click", handleFlagToggle);

    initialized = true;
}

export function startChunkPractice({ mode, chunks }) {
    if (!chunks || chunks.length === 0) {
        showToast("チャンクがありません", "error");
        return;
    }
    currentMode = mode;
    queue = (mode === "single") ? [...chunks] : shuffle([...chunks]);
    idx = 0;
    flipped = false;
    recordedIds = new Set();
    showScreen("screen-chunk-practice");
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
    const title = document.getElementById("chunk-practice-title");
    const progress = document.getElementById("chunk-practice-progress");
    const empty = document.getElementById("chunk-practice-empty");
    const card = document.getElementById("flashcard");
    const footer = document.querySelector(".chunk-practice-footer");

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
    progress.innerHTML = numLabel
        ? `<span class="practice-num">${numLabel}</span> ・ ${idx + 1} / ${queue.length}枚目`
        : `${idx + 1} / ${queue.length}枚目`;

    document.getElementById("flashcard-chunk").textContent = cur.chunk || "";
    document.getElementById("flashcard-meaning").textContent = cur.meaning || "（意味未登録）";
    const exEl = document.getElementById("flashcard-example");
    const speakExBtn = document.getElementById("btn-chunk-speak-example");
    if (cur.example) {
        exEl.textContent = cur.example;
        exEl.classList.remove("empty");
        speakExBtn.hidden = false;
    } else {
        exEl.textContent = "（例文未登録）";
        exEl.classList.add("empty");
        speakExBtn.hidden = true;
    }
    const sourceEl = document.getElementById("flashcard-source");
    const sceneEl = document.getElementById("flashcard-scene");
    sourceEl.textContent = cur.source ? `📍 ${cur.source}` : "";
    sceneEl.textContent = cur.scene ? `💬 ${cur.scene}` : "";

    card.classList.toggle("flipped", flipped);
    document.getElementById("flashcard-flip-hint").hidden = flipped;

    updateFlagUI(cur.flagLevel);

    document.getElementById("btn-chunk-prev").disabled = (idx === 0);
    document.getElementById("btn-chunk-next").textContent =
        (idx === queue.length - 1) ? "終了 ✓" : "次のカード →";
}

function updateFlagUI(flagLevel) {
    const level = normalizeFlagLevel(flagLevel);
    const icon = document.getElementById("chunk-flag-icon");
    const text = document.getElementById("chunk-flag-text");
    const btn = document.getElementById("btn-chunk-toggle-flag");
    icon.textContent = FLAG_ICONS[level];
    text.textContent = `${FLAG_LABELS[level]}（タップで切替）`;
    btn.classList.remove("flag-red", "flag-yellow", "flag-blue");
    btn.classList.add(`flag-${level}`);
}

function toggleFlip() {
    flipped = !flipped;
    const cur = queue[idx];
    if (flipped && cur && !recordedIds.has(cur.id)) {
        recordedIds.add(cur.id);
        cur.practiceCount = (cur.practiceCount || 0) + 1;
        recordChunkPractice(cur.id).catch(err => {
            console.warn("練習回数の記録失敗:", err);
        });
        if (cur.chunk) speak(cur.chunk);
    }
    render();
}

function next() {
    stopSpeaking();
    if (idx === queue.length - 1) {
        showToast(`お疲れさまでした（${queue.length}枚）`, "success", 3000);
        // 最後まで終えたので確認なしで戻る
        exitPractice();
        return;
    }
    idx += 1;
    flipped = false;
    render();
}

async function exitPractice() {
    stopSpeaking();
    showScreen("screen-chunk-list");
    await refreshChunkList();
}

function prev() {
    stopSpeaking();
    if (idx === 0) return;
    idx -= 1;
    flipped = false;
    render();
}

async function handleFlagToggle(evt) {
    evt.stopPropagation();
    const cur = queue[idx];
    if (!cur) return;
    const prevLevel = normalizeFlagLevel(cur.flagLevel);
    const newLevel = nextFlagLevel(prevLevel);
    cur.flagLevel = newLevel;
    updateFlagUI(newLevel);
    try {
        await setChunkFlagLevel(cur.id, newLevel);
    } catch (err) {
        cur.flagLevel = prevLevel;
        updateFlagUI(prevLevel);
        showToast("保存に失敗しました", "error");
    }
}
