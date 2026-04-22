// チャンク学習・一覧画面
// - 検索（chunk・意味）・絞り込み（全て / フラグ付き）
// - ＋ボタン → クイック入力
// - 行タップ → 1問フラッシュカード / ✏️ → 編集

import { listChunks, toggleChunkFlag } from "../lib/storage.js";
import { showScreen, showToast } from "../lib/ui.js";
import { startChunkPractice } from "./chunk-practice.js";
import { openChunkQuickAdd } from "./chunk-quick-add.js";
import { openChunkEdit } from "./chunk-edit.js";

let allChunks = [];
let currentFilter = "all";
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
        if (allChunks.length === 0) {
            showToast("チャンクがありません", "error");
            return;
        }
        startChunkPractice({ mode: "normal", chunks: allChunks });
    });

    document.getElementById("btn-start-chunk-practice-flag").addEventListener("click", () => {
        const pool = allChunks.filter(c => c.flag);
        if (pool.length === 0) {
            showToast("🚩フラグ付きのチャンクがありません", "default", 3000);
            return;
        }
        startChunkPractice({ mode: "flag", chunks: pool });
    });

    listInitialized = true;
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

    countEl.textContent = `${filtered.length} / ${allChunks.length}件`;

    if (filtered.length === 0) {
        listEl.innerHTML = "";
        emptyEl.hidden = false;
        return;
    }
    emptyEl.hidden = true;

    listEl.innerHTML = filtered.map((c) => {
        const flagClass = c.flag ? "flag-on" : "flag-off";
        const flagIcon = c.flag ? "🚩" : "🏳️";
        const numLabel = formatNumber(c.number);
        return `
            <li class="sokkan-item" data-id="${c.id}">
                <button class="sokkan-item-flag ${flagClass}" data-flag-id="${c.id}" aria-label="フラグ切替">
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

    listEl.querySelectorAll("[data-flag-id]").forEach(el => {
        el.addEventListener("click", async (evt) => {
            evt.stopPropagation();
            const id = el.dataset.flagId;
            const c = allChunks.find(x => x.id === id);
            if (!c) return;
            const newFlag = !c.flag;
            c.flag = newFlag;
            render();
            try {
                await toggleChunkFlag(id, newFlag);
            } catch (err) {
                c.flag = !newFlag;
                render();
                showToast("保存に失敗しました", "error");
            }
        });
    });
}

function applyFilter(chunks) {
    let result = chunks;
    if (currentFilter === "flag") {
        result = result.filter(c => c.flag);
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
