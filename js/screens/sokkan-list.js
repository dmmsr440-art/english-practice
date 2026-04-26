// 瞬間英作文・一覧画面
// - カテゴリタブ（全て / ビジネス雑談 / 英会話練習 / その他 / フラグ）で絞り込み
// - 選択中のカテゴリで練習開始
// - 検索・タップ練習・フラグ切替・編集

import { listSokkanExamples, toggleSokkanFlag } from "../lib/storage.js";
import { showScreen, showToast } from "../lib/ui.js";
import { startPractice } from "./sokkan-practice.js";
import { openSokkanQuickAdd } from "./sokkan-quick-add.js";
import { openSokkanEdit } from "./sokkan-edit.js";
import { openSokkanImport } from "./sokkan-import.js";

let allExamples = [];
let currentFilter = "all"; // "all" | "flag" | "cat-ビジネス雑談" | "cat-英会話練習" | "cat-その他"
let currentSearch = "";
let listInitialized = false;

export async function openSokkanList() {
    showScreen("screen-sokkan-list");
    await reloadAndRender();
}

export function initSokkanListScreen() {
    if (listInitialized) return;

    document.getElementById("btn-back-from-sokkan-list").addEventListener("click", () => {
        showScreen("screen-home");
    });

    document.getElementById("btn-open-quick-add").addEventListener("click", () => {
        openSokkanQuickAdd();
    });

    document.getElementById("btn-open-import").addEventListener("click", () => {
        openSokkanImport();
    });

    const searchEl = document.getElementById("sokkan-search");
    searchEl.addEventListener("input", () => {
        currentSearch = searchEl.value.trim().toLowerCase();
        render();
    });

    document.querySelectorAll("#sokkan-filter-tabs .filter-tab").forEach(tab => {
        tab.addEventListener("click", () => {
            document.querySelectorAll("#sokkan-filter-tabs .filter-tab").forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            currentFilter = tab.dataset.filter;
            render();
        });
    });

    document.getElementById("btn-start-practice-normal").addEventListener("click", () => {
        const pool = getPoolForPractice();
        if (pool.length === 0) {
            showToast("該当する例文がありません", "error");
            return;
        }
        const mode = currentFilter === "flag" ? "flag" : "normal";
        startPractice({ mode, examples: pool });
    });

    listInitialized = true;
}

function getPoolForPractice() {
    if (currentFilter === "all") return allExamples;
    if (currentFilter === "flag") return allExamples.filter(e => e.flag);
    if (currentFilter.startsWith("cat-")) {
        const cat = currentFilter.slice(4);
        return allExamples.filter(e => (e.category || "") === cat);
    }
    return allExamples;
}

async function reloadAndRender() {
    try {
        allExamples = await listSokkanExamples();
    } catch (err) {
        console.error("例文の取得に失敗:", err);
        showToast("読み込みに失敗しました", "error");
        allExamples = [];
    }
    render();
}

function render() {
    const filtered = applyFilter(allExamples);
    const listEl = document.getElementById("sokkan-list");
    const emptyEl = document.getElementById("sokkan-empty");
    const countEl = document.getElementById("sokkan-count");
    const practiceBtn = document.getElementById("btn-start-practice-normal");

    countEl.textContent = `${filtered.length} / ${allExamples.length}件`;

    if (currentFilter === "flag") {
        practiceBtn.textContent = "🚩 フラグ付きで練習";
    } else if (currentFilter.startsWith("cat-")) {
        practiceBtn.textContent = `▶︎ ${currentFilter.slice(4)}を練習`;
    } else {
        practiceBtn.textContent = "▶︎ 練習を始める";
    }

    if (filtered.length === 0) {
        listEl.innerHTML = "";
        emptyEl.hidden = false;
        return;
    }
    emptyEl.hidden = true;

    listEl.innerHTML = filtered.map((ex) => {
        const flagClass = ex.flag ? "flag-on" : "flag-off";
        const flagIcon = ex.flag ? "🚩" : "🏳️";
        const numLabel = formatNumber(ex.number);
        const catBadge = ex.category
            ? `<span class="item-cat-badge">${escapeHtml(ex.category)}</span>`
            : "";
        return `
            <li class="sokkan-item" data-id="${ex.id}">
                <button class="sokkan-item-flag ${flagClass}" data-flag-id="${ex.id}" aria-label="フラグ切替">
                    ${flagIcon}
                </button>
                <div class="sokkan-item-body" data-practice-id="${ex.id}">
                    <div class="sokkan-item-head">
                        <span class="sokkan-num">${numLabel}</span>
                        ${catBadge}
                        <span class="sokkan-item-meta">
                            ${ex.practiceCount ? `練習 ${ex.practiceCount}回` : "未練習"}
                        </span>
                    </div>
                    <p class="sokkan-item-ja">${escapeHtml(ex.ja)}</p>
                    <p class="sokkan-item-en">${escapeHtml(ex.en || "（英訳未登録）")}</p>
                </div>
                <button class="sokkan-item-edit" data-edit-id="${ex.id}" aria-label="編集">
                    ✏️
                </button>
            </li>
        `;
    }).join("");

    listEl.querySelectorAll("[data-practice-id]").forEach(el => {
        el.addEventListener("click", () => {
            const id = el.dataset.practiceId;
            const ex = allExamples.find(e => e.id === id);
            if (ex) startPractice({ mode: "single", examples: [ex] });
        });
    });

    listEl.querySelectorAll("[data-edit-id]").forEach(el => {
        el.addEventListener("click", (evt) => {
            evt.stopPropagation();
            const id = el.dataset.editId;
            const ex = allExamples.find(x => x.id === id);
            if (ex) openSokkanEdit(ex);
        });
    });

    listEl.querySelectorAll("[data-flag-id]").forEach(el => {
        el.addEventListener("click", async (evt) => {
            evt.stopPropagation();
            const id = el.dataset.flagId;
            const ex = allExamples.find(x => x.id === id);
            if (!ex) return;
            const newFlag = !ex.flag;
            ex.flag = newFlag;
            render();
            try {
                await toggleSokkanFlag(id, newFlag);
            } catch (err) {
                ex.flag = !newFlag;
                render();
                showToast("保存に失敗しました", "error");
            }
        });
    });
}

function applyFilter(examples) {
    let result = examples;
    if (currentFilter === "flag") {
        result = result.filter(e => e.flag);
    } else if (currentFilter.startsWith("cat-")) {
        const cat = currentFilter.slice(4);
        result = result.filter(e => (e.category || "") === cat);
    }
    if (currentSearch) {
        const q = currentSearch;
        result = result.filter(e => {
            const numStr = typeof e.number === "number" ? String(e.number).padStart(3, "0") : "";
            return (
                (e.ja || "").toLowerCase().includes(q) ||
                (e.en || "").toLowerCase().includes(q) ||
                numStr.includes(q)
            );
        });
    }
    return result;
}

function formatNumber(n) {
    if (typeof n !== "number") return "#---";
    return `#${String(n).padStart(3, "0")}`;
}

function escapeHtml(s) {
    return String(s || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

export async function refreshSokkanList() {
    await reloadAndRender();
}
