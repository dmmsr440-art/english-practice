// 構文・パラフレ・型の反復練習
// - 1つの構文について、登録されている例文を連続で出題（＝型の反復）
// - 日本語 → 回答を見る → 英文・TTS・フラグ
// - 回答を見た時点で、その構文の練習回数を +1（同セッションで重複加算しない）

import {
    setStructureFlagLevel, recordStructurePractice,
    STRUCTURE_CATEGORY_LABELS,
    FLAG_ICONS, FLAG_LABELS, normalizeFlagLevel, nextFlagLevel
} from "../lib/storage.js";
import { showScreen, showToast } from "../lib/ui.js";
import { speak, stopSpeaking } from "../lib/tts.js";
import { refreshStructureList } from "./structure-list.js";
import { startStructurePara } from "./structure-para.js";
import { openSokkanQuickAdd } from "./sokkan-quick-add.js";

let initialized = false;
let queue = [];        // 例文を1つ以上持つ構文の配列
let sIdx = 0;          // 構文のindex
let eIdx = 0;          // 例文のindex
let revealed = false;
let currentMode = "normal";
let recordedIds = new Set();

export function initStructurePracticeScreen() {
    if (initialized) return;

    document.getElementById("btn-back-from-structure-practice").addEventListener("click", () => {
        if (!confirm("練習を終了して一覧に戻りますか？")) return;
        exitPractice();
    });

    document.getElementById("btn-structure-reveal").addEventListener("click", revealAnswer);
    document.getElementById("btn-structure-speak").addEventListener("click", () => {
        const en = currentExample()?.en || "";
        if (en) speak(en);
    });
    document.getElementById("btn-structure-next").addEventListener("click", next);
    document.getElementById("btn-structure-prev").addEventListener("click", prev);
    document.getElementById("btn-structure-toggle-flag").addEventListener("click", handleFlagToggle);
    document.getElementById("btn-structure-to-sokkan").addEventListener("click", handleAddToSokkan);
    document.getElementById("btn-structure-to-para").addEventListener("click", () => {
        const cur = queue[sIdx];
        if (!cur) return;
        stopSpeaking();
        startStructurePara({ structures: [cur], returnTo: "practice" });
    });

    initialized = true;
}

export function startStructurePractice({ mode, structures }) {
    const usable = (structures || []).filter(s => (s.examples || []).length > 0);
    if (usable.length === 0) {
        showToast("例文が登録されている構文がありません", "error");
        return;
    }
    currentMode = mode;
    queue = (mode === "single") ? [...usable] : shuffle([...usable]);
    sIdx = 0;
    eIdx = 0;
    revealed = false;
    recordedIds = new Set();
    showScreen("screen-structure-practice");
    render();
}

// 練習画面に戻る（AIパラフレから復帰したときなど。状態はそのまま）
export function resumeStructurePractice() {
    if (queue.length === 0) return false;
    showScreen("screen-structure-practice");
    render();
    return true;
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function currentExample() {
    return queue[sIdx]?.examples?.[eIdx] || null;
}

function render() {
    const title = document.getElementById("structure-practice-title");
    const progress = document.getElementById("structure-practice-progress");
    const empty = document.getElementById("structure-practice-empty");
    const patternCard = document.querySelector("#screen-structure-practice .structure-pattern-card");
    const card = document.querySelector("#screen-structure-practice .practice-card");
    const footer = document.querySelector("#screen-structure-practice .practice-footer");
    const paraBtn = document.getElementById("btn-structure-to-para");

    if (queue.length === 0) {
        empty.hidden = false;
        patternCard.style.display = "none";
        card.style.display = "none";
        footer.style.display = "none";
        paraBtn.style.display = "none";
        progress.textContent = "";
        return;
    }
    empty.hidden = true;
    patternCard.style.display = "";
    card.style.display = "";
    footer.style.display = "";
    paraBtn.style.display = "";

    title.textContent = (currentMode === "single") ? "1構文練習" : "型の反復";

    const cur = queue[sIdx];
    const examples = cur.examples || [];
    const numLabel = typeof cur.number === "number"
        ? `#${String(cur.number).padStart(3, "0")}`
        : "";
    const parts = [];
    if (numLabel) parts.push(`<span class="practice-num">${numLabel}</span>`);
    if (queue.length > 1) parts.push(`${sIdx + 1} / ${queue.length}構文`);
    parts.push(`例文 ${eIdx + 1} / ${examples.length}`);
    parts.push(`<span class="practice-count-badge">練習 ${cur.practiceCount || 0}回</span>`);
    progress.innerHTML = parts.join(" ・ ");

    document.getElementById("structure-practice-pattern").textContent = cur.pattern || "";
    document.getElementById("structure-practice-meaning").textContent = cur.meaning || "";
    document.getElementById("structure-practice-cat").textContent =
        STRUCTURE_CATEGORY_LABELS[cur.category] || "";

    const noteEl = document.getElementById("structure-practice-note");
    if (cur.note) {
        noteEl.textContent = cur.note;
        noteEl.hidden = false;
    } else {
        noteEl.hidden = true;
    }

    const ex = currentExample();
    document.getElementById("structure-practice-ja").textContent = ex?.ja || "";
    document.getElementById("structure-practice-en").textContent = ex?.en || "";

    updateFlagUI(cur.flagLevel);

    document.getElementById("structure-practice-reveal").hidden = !revealed;
    document.getElementById("btn-structure-reveal").hidden = revealed;

    document.getElementById("btn-structure-prev").disabled = (sIdx === 0 && eIdx === 0);
    document.getElementById("btn-structure-next").textContent = isLast() ? "終了 ✓" : "次へ →";
}

function isLast() {
    const examples = queue[sIdx]?.examples || [];
    return (sIdx === queue.length - 1) && (eIdx === examples.length - 1);
}

function updateFlagUI(flagLevel) {
    const level = normalizeFlagLevel(flagLevel);
    const btn = document.getElementById("btn-structure-toggle-flag");
    document.getElementById("structure-flag-icon").textContent = FLAG_ICONS[level];
    document.getElementById("structure-flag-text").textContent =
        `${FLAG_LABELS[level]}（タップで切替）`;
    btn.classList.remove("flag-red", "flag-yellow", "flag-blue");
    btn.classList.add(`flag-${level}`);
}

function revealAnswer() {
    const cur = queue[sIdx];
    if (!cur) return;
    revealed = true;

    document.getElementById("structure-practice-reveal").hidden = false;
    document.getElementById("btn-structure-reveal").hidden = true;

    // 練習回数は構文単位で1回だけ加算
    if (!recordedIds.has(cur.id)) {
        recordedIds.add(cur.id);
        cur.practiceCount = (cur.practiceCount || 0) + 1;
        recordStructurePractice(cur.id).catch(err => {
            console.warn("練習回数の記録失敗:", err);
        });
    }

    const en = currentExample()?.en;
    if (en) speak(en);
    render();
}

// いま出ている例文を瞬間英作文へ（クイック入力画面で編集してから保存）
function handleAddToSokkan() {
    const cur = queue[sIdx];
    const ex = currentExample();
    if (!cur || !ex) return;
    stopSpeaking();
    const numLabel = typeof cur.number === "number"
        ? `#${String(cur.number).padStart(3, "0")} ${cur.pattern}`
        : cur.pattern;
    openSokkanQuickAdd({
        ja: ex.ja || "",
        en: ex.en || "",
        sourceLabel: `🗂 ${numLabel}`,
        autoPronunciation: true,
        onReturn: () => resumeStructurePractice()
    });
}

function next() {
    stopSpeaking();
    if (isLast()) {
        showToast(`お疲れさまでした（${queue.length}構文）`, "success", 3000);
        exitPractice();
        return;
    }
    const examples = queue[sIdx]?.examples || [];
    if (eIdx < examples.length - 1) {
        eIdx += 1;
    } else {
        sIdx += 1;
        eIdx = 0;
    }
    revealed = false;
    render();
}

function prev() {
    stopSpeaking();
    if (sIdx === 0 && eIdx === 0) return;
    if (eIdx > 0) {
        eIdx -= 1;
    } else {
        sIdx -= 1;
        eIdx = Math.max(0, (queue[sIdx]?.examples || []).length - 1);
    }
    revealed = false;
    render();
}

async function exitPractice() {
    stopSpeaking();
    queue = [];
    showScreen("screen-structure-list");
    await refreshStructureList();
}

async function handleFlagToggle() {
    const cur = queue[sIdx];
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
