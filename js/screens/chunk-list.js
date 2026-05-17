// チャンク学習・一覧画面
// - フラグ色（赤/黄/青）別の絞り込み・練習
// - 検索・タップ練習・フラグ循環切替・編集

import {
    listChunks, setChunkFlagLevel,
    FLAG_ICONS, normalizeFlagLevel, nextFlagLevel
} from "../lib/storage.js";
import { showScreen, showToast } from "../lib/ui.js";
import { startChunkPractice } from "./chunk-practice.js";
import { openChunkQuickAdd } from "./chunk-quick-add.js";
import { openChunkEdit } from "./chunk-edit.js";

let allChunks = [];
let currentFilter = "all"; // "all" | "flag-red" | "flag-yellow" | "flag-blue"
let currentSearch = "";
let listInitialized = false;

export async function openChunkList() {
    showScreen("screen-chunk-list");
    await reloadAndRender();
}

export function initChunkListScreen() {
    if (listInitialized) return;

    document.getElementById("btn-back-from-chunk-list").addEventListener("click", () => {
        showScreen("screen-home");
    });

    document.getElementById("btn-open-chunk-quick-add").addEventListener("click", () => {
        openChunkQuickAdd();
    });

    const searchEl = document.getElementById("chunk-search");
    searchEl.addEventListener("input", () => {
        currentSearch = searchEl.value.trim().toLowerCase();
        render();
    });

    document.querySelectorAll("#chunk-filter-tabs .filter-tab").forEach(tab => {
        tab.addEventListener("click", () => {
            document.querySelectorAll("#chunk-filter-tabs .filter-tab").forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            currentFilter = tab.dataset.filter;
            render();
        });
    });

    document.getElementById("btn-start-chunk-practice-normal").addEventListener("click", () => {
        const pool = getPoolForPractice();
        if (pool.length === 0) {
            showToast("該当するチャンクがありません", "error");
            return;
        }
        const mode = currentFilter.startsWith("flag-") ? "flag" : "normal";
        startChunkPractice({ mode, chunks: pool });
    });

    listInitialized = true;
}

function getPoolForPractice() {
    if (currentFilter === "all") return allChunks;
    if (currentFilter.startsWith("flag-")) {
        const color = currentFilter.slice(5);
        return allChunks.filter(c => normalizeFlagLevel(c.flagLevel) === color);
    }
    return allChunks;
}

async function reloadAndRender() {
    try {
        allChunks = await listChunks();
    } catch (err) {
        console.error("チャンク取得失敗:", err);
        showToast("読み込みに失敗しました", "error");
        allChunks = [];
    }
    render();
}

function render() {
    const filtered = applyFilter(allChunks);
    const listEl = document.getElementById("chunk-list");
    const emptyEl = document.getElementById("chunk-empty");
    const countEl = document.getElementById("chunk-count");
    const practiceBtn = document.getElementById("btn-start-chunk-practice-normal");

    countEl.textContent = `${filtered.length} / ${allChunks.length}件`;
    updateTabCounts();

    if (currentFilter.startsWith("flag-")) {
        const color = currentFilter.slice(5);
        practiceBtn.textContent = `${FLAG_ICONS[color]} ${{red:"赤",yellow:"黄",blue:"青"}[color]}フラグで練習`;
    } else {
        practiceBtn.textContent = "▶︎ フラッシュカード練習";
    }

    if (filtered.length === 0) {
        listEl.innerHTML = "";
        emptyEl.hidden = false;
        return;
    }
    emptyEl.hidden = true;

    listEl.innerHTML = filtered.map((c) => {
        const level = normalizeFlagLevel(c.flagLevel);
        const flagIcon = FLAG_ICONS[level];
        const numLabel = formatNumber(c.number);
        return `
            <li class="sokkan-item" data-id="${c.id}">
                <button class="sokkan-item-flag flag-${level}" data-flag-id="${c.id}" aria-label="フラグ切替">
                    ${flagIcon}
                </button>
                <div class="sokkan-item-body" data-practice-id="${c.id}">
                    <div class="sokkan-item-head">
                        <span class="sokkan-num">${numLabel}</span>
                        <span class="sokkan-item-meta">
                            ${c.practiceCount ? `練習 ${c.practiceCount}回` : "未練習"}
                        </span>
                    </div>
                    <p class="sokkan-item-ja">${escapeHtml(c.chunk)}</p>
                    <p class="sokkan-item-en">${escapeHtml(c.meaning || "（意味未登録）")}</p>
                </div>
                <button class="sokkan-item-edit" data-edit-id="${c.id}" aria-label="編集">
                    ✏️
                </button>
            </li>
        `;
    }).join("");

    listEl.querySelectorAll("[data-practice-id]").forEach(el => {
        el.addEventListener("click", () => {
            const id = el.dataset.practiceId;
            const c = allChunks.find(x => x.id === id);
            if (c) startChunkPractice({ mode: "single", chunks: [c] });
        });
    });

    listEl.querySelectorAll("[data-edit-id]").forEach(el => {
        el.addEventListener("click", (evt) => {
            evt.stopPropagation();
            const id = el.dataset.editId;
            const c = allChunks.find(x => x.id === id);
            if (c) openChunkEdit(c);
        });
    });

    // フラグ循環切替（赤→黄→青→赤）
    listEl.querySelectorAll("[data-flag-id]").forEach(el => {
        el.addEventListener("click", async (evt) => {
            evt.stopPropagation();
            const id = el.dataset.flagId;
            const c = allChunks.find(x => x.id === id);
            if (!c) return;
            const prevLevel = normalizeFlagLevel(c.flagLevel);
            const newLevel = nextFlagLevel(prevLevel);
            c.flagLevel = newLevel;
            render();
            try {
                await setChunkFlagLevel(id, newLevel);
            } catch (err) {
                c.flagLevel = prevLevel;
                render();
                showToast("保存に失敗しました", "error");
            }
        });
    });
}

function countForFilter(filterKey) {
    if (filterKey === "all") return allChunks.length;
    if (filterKey.startsWith("flag-")) {
        const color = filterKey.slice(5);
        return allChunks.filter(c => normalizeFlagLevel(c.flagLevel) === color).length;
    }
    return 0;
}

function updateTabCounts() {
    document.querySelectorAll("#chunk-filter-tabs .filter-tab").forEach(tab => {
        const filterKey = tab.dataset.filter;
        const count = countForFilter(filterKey);
        let badge = tab.querySelector(".tab-count");
        if (!badge) {
            badge = document.createElement("span");
            badge.className = "tab-count";
            tab.appendChild(badge);
        }
        badge.textContent = count;
    });
}

function applyFilter(chunks) {
    let result = chunks;
    if (currentFilter.startsWith("flag-")) {
        const color = currentFilter.slice(5);
        result = result.filter(c => normalizeFlagLevel(c.flagLevel) === color);
    }
    if (currentSearch) {
        const q = currentSearch;
        result = result.filter(c => {
            const numStr = typeof c.number === "number" ? String(c.number).padStart(3, "0") : "";
            return (
                (c.chunk || "").toLowerCase().includes(q) ||
                (c.meaning || "").toLowerCase().includes(q) ||
                (c.example || "").toLowerCase().includes(q) ||
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

export async function refreshChunkList() {
    await reloadAndRender();
}
